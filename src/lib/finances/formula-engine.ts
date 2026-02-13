import { evaluate, parse } from "mathjs";

/**
 * Безопасно вычислить формулу с заданными значениями параметров.
 * Возвращает результат или 0 при ошибке.
 *
 * Пример: evaluateFormula("clients * price", { clients: 12, price: 3000 }) → 36000
 */
export function evaluateFormula(formula: string, params: Record<string, number>): number {
  if (!formula || !formula.trim()) return 0;
  try {
    const result = evaluate(formula, params);
    if (typeof result !== "number" || !isFinite(result)) return 0;
    return result;
  } catch {
    return 0;
  }
}

/**
 * Проверить формулу на корректность.
 * Возвращает { valid: true } или { valid: false, error: string }.
 */
export function validateFormula(
  formula: string,
  availableParams: string[]
): { valid: boolean; error?: string } {
  if (!formula || !formula.trim()) {
    return { valid: false, error: "Формула не может быть пустой" };
  }

  try {
    const node = parse(formula);
    const usedKeys = extractParamKeysFromNode(node);

    const unknown = usedKeys.filter((k) => !availableParams.includes(k));
    if (unknown.length > 0) {
      return {
        valid: false,
        error: `Неизвестные переменные: ${unknown.join(", ")}`,
      };
    }

    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      error: `Ошибка синтаксиса: ${e instanceof Error ? e.message : "неизвестная ошибка"}`,
    };
  }
}

/**
 * Извлечь ключи параметров из формулы.
 */
export function extractParamKeys(formula: string): string[] {
  if (!formula || !formula.trim()) return [];
  try {
    const node = parse(formula);
    return extractParamKeysFromNode(node);
  } catch {
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractParamKeysFromNode(node: any): string[] {
  const keys = new Set<string>();

  function walk(n: {
    type: string;
    name?: string;
    args?: unknown[];
    content?: unknown;
    value?: unknown;
  }) {
    if (n.type === "SymbolNode" && n.name) {
      keys.add(n.name);
    }
    if (n.type === "FunctionNode" && Array.isArray(n.args)) {
      for (const arg of n.args) walk(arg as typeof n);
    }
    if (n.type === "OperatorNode" && Array.isArray(n.args)) {
      for (const arg of n.args) walk(arg as typeof n);
    }
    if (n.type === "ParenthesisNode" && n.content) {
      walk(n.content as typeof n);
    }
  }

  walk(node);
  return Array.from(keys);
}
