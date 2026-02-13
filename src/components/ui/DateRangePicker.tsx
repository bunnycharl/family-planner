"use client";

import { useState, useEffect, useRef } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isWithinInterval,
  isSameDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  label: string;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function DateRangePicker({
  label,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectingStart(true);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const displayText =
    start && end
      ? `${format(start, "d MMM yyyy", { locale: ru })} — ${format(end, "d MMM yyyy", { locale: ru })}`
      : start
        ? `${format(start, "d MMM yyyy", { locale: ru })} — ...`
        : "Выбрать даты";

  function handleDateClick(date: Date) {
    const dateStr = format(date, "yyyy-MM-dd");

    if (selectingStart) {
      onStartDateChange(dateStr);
      onEndDateChange("");
      setSelectingStart(false);
    } else {
      if (start && date < start) {
        // If second date is before start, swap them
        onEndDateChange(startDate);
        onStartDateChange(dateStr);
      } else {
        onEndDateChange(dateStr);
      }
      setIsOpen(false);
      setSelectingStart(true);
    }
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <div>
      <span className="mb-1.5 block text-xs font-bold uppercase text-[#999]">{label}</span>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-2xl border-2 border-[var(--c-black)] px-4 py-2.5 text-sm bg-white text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--c-lavender)]/30"
        >
          <span className={cn("truncate", !start && "text-[#999]")}>{displayText}</span>
          <svg
            className={cn(
              "h-4 w-4 shrink-0 text-[#999] transition-transform ml-2",
              isOpen && "rotate-180"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border-2 border-[var(--c-black)] bg-white shadow-2xl p-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--c-gray)] transition-colors cursor-pointer"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-extrabold uppercase text-[var(--c-black)]">
                {format(currentMonth, "LLLL yyyy", { locale: ru })}
              </span>
              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--c-gray)] transition-colors cursor-pointer"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-[10px] font-bold text-[#999] py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const inMonth = isSameMonth(day, currentMonth);
                const isStart = start && isSameDay(day, start);
                const isEnd = end && isSameDay(day, end);
                const isInRange = start && end && isWithinInterval(day, { start, end });

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    disabled={!inMonth}
                    className={cn(
                      "h-8 w-full text-xs font-bold rounded-lg transition-all cursor-pointer",
                      !inMonth && "text-transparent cursor-default",
                      inMonth &&
                        !isStart &&
                        !isEnd &&
                        !isInRange &&
                        "text-[var(--c-black)] hover:bg-[var(--c-gray)]",
                      isInRange &&
                        !isStart &&
                        !isEnd &&
                        "bg-[var(--c-lavender)]/20 text-[var(--c-black)]",
                      (isStart || isEnd) && "bg-[var(--c-lavender)] text-white font-extrabold"
                    )}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>

            {/* Helper text */}
            <div className="mt-3 pt-3 border-t border-[var(--c-gray)] text-center">
              <span className="text-[10px] font-bold uppercase text-[#999]">
                {selectingStart ? "Выберите дату начала" : "Выберите дату окончания"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
