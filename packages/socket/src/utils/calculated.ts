import { evaluate } from "mathjs"
import type { CalculatedVariable } from "@questly/common/types/game"

export const randomizeVariables = (
  variables: CalculatedVariable[],
): Record<string, number> => {
  const result: Record<string, number> = {}
  for (const { name, min, max, decimals } of variables) {
    const raw = min + Math.random() * (max - min)
    result[name] = parseFloat(raw.toFixed(decimals))
  }
  return result
}

export const evaluateFormula = (
  formula: string,
  variables: Record<string, number>,
): number => {
  try {
    const result = evaluate(formula, { ...variables })
    return typeof result === "number" && isFinite(result) ? result : NaN
  } catch {
    return NaN
  }
}

export const checkTolerance = (
  playerAnswer: number,
  correctAnswer: number,
  toleranceBase: number,
  tolerancePartial: number,
): "full" | "partial" | "wrong" => {
  if (!isFinite(playerAnswer)) return "wrong"
  // handle correct answer of zero
  if (correctAnswer === 0) {
    return Math.abs(playerAnswer) < 0.001 ? "full" : "wrong"
  }
  const accuracy =
    Math.abs(playerAnswer - correctAnswer) / Math.abs(correctAnswer)
  if (accuracy <= toleranceBase / 100) return "full"
  if (accuracy <= tolerancePartial / 100) return "partial"
  return "wrong"
}
