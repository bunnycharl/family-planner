"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  showNone?: boolean;
  onNone?: () => void;
  isNone?: boolean;
}

// --- HSV <-> RGB <-> Hex helpers ---

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  const s = max === 0 ? 0 : d / max;
  return [h, s, max];
}

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  return [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function hexToHsv(hex: string): [number, number, number] {
  return rgbToHsv(...hexToRgb(hex));
}

// --- Canvas rendering ---

function drawSatValCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  hue: number
) {
  const [r, g, b] = hsvToRgb(hue, 1, 1);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, width, height);

  const whiteGrad = ctx.createLinearGradient(0, 0, width, 0);
  whiteGrad.addColorStop(0, "rgba(255,255,255,1)");
  whiteGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = whiteGrad;
  ctx.fillRect(0, 0, width, height);

  const blackGrad = ctx.createLinearGradient(0, 0, 0, height);
  blackGrad.addColorStop(0, "rgba(0,0,0,0)");
  blackGrad.addColorStop(1, "rgba(0,0,0,1)");
  ctx.fillStyle = blackGrad;
  ctx.fillRect(0, 0, width, height);
}

function drawHueSlider(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const grad = ctx.createLinearGradient(0, 0, width, 0);
  const stops = [0, 0.17, 0.33, 0.5, 0.67, 0.83, 1];
  const colors = ["#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000"];
  stops.forEach((s, i) => grad.addColorStop(s, colors[i]));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

// --- Component ---

export function ColorPicker({ value, onChange, showNone, onNone, isNone }: ColorPickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on click outside
  useEffect(() => {
    if (!showCustom) return;
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowCustom(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCustom]);

  // HSV state — source of truth for the custom picker canvas
  const initHsv = hexToHsv(value || "#0d9488");
  const [hue, setHue] = useState(() => initHsv[0]);
  const [sat, setSat] = useState(() => initHsv[1]);
  const [val, setVal] = useState(() => initHsv[2]);

  const svCanvasRef = useRef<HTMLCanvasElement>(null);
  const hueCanvasRef = useRef<HTMLCanvasElement>(null);

  const SV_W = 220;
  const SV_H = 160;
  const HUE_W = 220;
  const HUE_H = 16;

  // Helper to update HSV + emit color + update hex input
  const applyHsv = useCallback(
    (h: number, s: number, v: number) => {
      setHue(h);
      setSat(s);
      setVal(v);
      const [r, g, b] = hsvToRgb(h, s, v);
      const hex = rgbToHex(r, g, b);
      setHexInput(hex);
      onChange(hex);
    },
    [onChange]
  );

  // Helper to set from hex (for presets and hex input)
  const applyHex = useCallback(
    (hex: string) => {
      const [h, s, v] = hexToHsv(hex);
      setHue(h);
      setSat(s);
      setVal(v);
      setHexInput(hex);
      onChange(hex);
    },
    [onChange]
  );

  // Draw SV canvas when hue or showCustom changes
  useEffect(() => {
    const canvas = svCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawSatValCanvas(ctx, SV_W, SV_H, hue);
  }, [hue, showCustom]);

  // Draw hue canvas when custom picker opens
  useEffect(() => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawHueSlider(ctx, HUE_W, HUE_H);
  }, [showCustom]);

  // --- SV canvas pointer handlers ---
  const svDragging = useRef(false);

  const handleSvInteraction = useCallback(
    (e: React.PointerEvent) => {
      const canvas = svCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
      applyHsv(hue, x / rect.width, 1 - y / rect.height);
    },
    [hue, applyHsv]
  );

  const onSvPointerDown = useCallback(
    (e: React.PointerEvent) => {
      svDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      handleSvInteraction(e);
    },
    [handleSvInteraction]
  );

  const onSvPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!svDragging.current) return;
      handleSvInteraction(e);
    },
    [handleSvInteraction]
  );

  const onSvPointerUp = useCallback(() => {
    svDragging.current = false;
  }, []);

  // --- Hue slider pointer handlers ---
  const hueDragging = useRef(false);

  const handleHueInteraction = useCallback(
    (e: React.PointerEvent) => {
      const canvas = hueCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      applyHsv((x / rect.width) * 360, sat, val);
    },
    [sat, val, applyHsv]
  );

  const onHuePointerDown = useCallback(
    (e: React.PointerEvent) => {
      hueDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      handleHueInteraction(e);
    },
    [handleHueInteraction]
  );

  const onHuePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!hueDragging.current) return;
      handleHueInteraction(e);
    },
    [handleHueInteraction]
  );

  const onHuePointerUp = useCallback(() => {
    hueDragging.current = false;
  }, []);

  // --- Hex input ---
  function handleHexChange(input: string) {
    setHexInput(input);
    const clean = input.startsWith("#") ? input : "#" + input;
    if (/^#[0-9a-fA-F]{6}$/.test(clean)) {
      applyHex(clean.toLowerCase());
    }
  }

  const isPreset = PRESET_COLORS.includes(value);

  return (
    <div>
      {/* Preset swatches */}
      <div className="flex flex-wrap items-center gap-2">
        {showNone && (
          <button
            type="button"
            onClick={onNone}
            className={cn(
              "h-8 w-8 rounded-lg border-2 transition-all flex items-center justify-center cursor-pointer",
              isNone
                ? "border-[var(--color-text)] scale-110 ring-2 ring-offset-1 ring-[var(--color-text)]/20"
                : "border-[var(--color-border)] hover:scale-105"
            )}
            title="Без цвета"
          >
            <svg
              className="h-4 w-4 text-[var(--color-text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              applyHex(c);
              setShowCustom(false);
            }}
            className={cn(
              "h-8 w-8 rounded-lg border-2 transition-all cursor-pointer",
              !isNone && value === c
                ? "border-[var(--color-text)] scale-110 ring-2 ring-offset-1 ring-[var(--color-text)]/20"
                : "border-transparent hover:scale-105"
            )}
            style={{ backgroundColor: c }}
            aria-label={`Цвет ${c}`}
          />
        ))}

        {/* Custom color toggle + popover anchor */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCustom(!showCustom)}
            className={cn(
              "h-8 w-8 rounded-lg border-2 transition-all flex items-center justify-center cursor-pointer",
              showCustom || (!isNone && !isPreset)
                ? "border-[var(--color-text)] scale-110 ring-2 ring-offset-1 ring-[var(--color-text)]/20"
                : "border-[var(--color-border)] hover:scale-105"
            )}
            style={!isNone && !isPreset && value ? { backgroundColor: value } : undefined}
            title="Свой цвет"
          >
            {(isPreset || isNone || !value) && (
              <svg
                className="h-4 w-4 text-[var(--color-text-muted)]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            )}
          </button>

          {/* Custom picker popover — speech bubble above the button */}
          {showCustom && (
            <div
              ref={popoverRef}
              className="absolute bottom-full right-0 z-50 mb-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3 space-y-3 shadow-xl"
            >
              {/* Saturation-Value canvas */}
              <div className="relative" style={{ width: SV_W, height: SV_H }}>
                <canvas
                  ref={svCanvasRef}
                  width={SV_W}
                  height={SV_H}
                  className="block rounded-lg cursor-crosshair"
                  style={{ width: SV_W, height: SV_H }}
                  onPointerDown={onSvPointerDown}
                  onPointerMove={onSvPointerMove}
                  onPointerUp={onSvPointerUp}
                />
                <div
                  className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
                  style={{
                    left: sat * SV_W,
                    top: (1 - val) * SV_H,
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.3)",
                  }}
                />
              </div>

              {/* Hue slider */}
              <div className="relative" style={{ width: HUE_W, height: HUE_H }}>
                <canvas
                  ref={hueCanvasRef}
                  width={HUE_W}
                  height={HUE_H}
                  className="block rounded-full cursor-pointer"
                  style={{ width: HUE_W, height: HUE_H }}
                  onPointerDown={onHuePointerDown}
                  onPointerMove={onHuePointerMove}
                  onPointerUp={onHuePointerUp}
                />
                <div
                  className="pointer-events-none absolute top-1/2 h-5 w-3 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-white"
                  style={{
                    left: (hue / 360) * HUE_W,
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.3)",
                  }}
                />
              </div>

              {/* Hex input + preview */}
              <div className="flex items-center gap-3">
                <div
                  className="h-8 w-8 shrink-0 rounded-lg border border-[var(--color-border)]"
                  style={{ backgroundColor: value || "#000000" }}
                />
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder="#000000"
                  maxLength={7}
                  className={cn(
                    "w-24 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-2 py-1 text-sm font-mono",
                    "text-[var(--color-text)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                  )}
                />
              </div>

              {/* Speech bubble arrow pointing down to the button */}
              <div
                className="absolute -bottom-[10px] right-[10px] h-0 w-0"
                style={{
                  borderLeft: "10px solid transparent",
                  borderRight: "10px solid transparent",
                  borderTop: "10px solid var(--color-border)",
                }}
              />
              <div
                className="absolute -bottom-[8px] right-[11px] h-0 w-0"
                style={{
                  borderLeft: "9px solid transparent",
                  borderRight: "9px solid transparent",
                  borderTop: "9px solid var(--color-bg-card)",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
