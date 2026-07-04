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

// fixed absolute tolerance used when the correct answer is exactly 0, since a
// percentage of 0 collapses to a zero-width window
const ZERO_ANSWER_TOLERANCE = 1

export const computeEstimateScore = (
  playerAnswer: number,
  correctAnswer: number,
  tolerancePercent: number,
): { fraction: number; accuracy: number; tier: "full" | "partial" | "wrong" } => {
  if (!isFinite(playerAnswer)) return { fraction: 0, accuracy: Infinity, tier: "wrong" }

  const tierFromFraction = (fraction: number): "full" | "partial" | "wrong" =>
    fraction >= 0.8 ? "full" : fraction > 0 ? "partial" : "wrong"

  if (correctAnswer === 0) {
    const diff = Math.abs(playerAnswer)
    if (tolerancePercent === 0) {
      return diff === 0
        ? { fraction: 1, accuracy: 0, tier: "full" }
        : { fraction: 0, accuracy: diff, tier: "wrong" }
    }
    const fraction = Math.max(0, 1 - diff / ZERO_ANSWER_TOLERANCE)
    return { fraction, accuracy: diff, tier: tierFromFraction(fraction) }
  }

  const accuracy = Math.abs(playerAnswer - correctAnswer) / Math.abs(correctAnswer)
  if (tolerancePercent === 0) {
    return accuracy === 0
      ? { fraction: 1, accuracy, tier: "full" }
      : { fraction: 0, accuracy, tier: "wrong" }
  }
  const fraction = Math.max(0, 1 - accuracy / (tolerancePercent / 100))
  return { fraction, accuracy, tier: tierFromFraction(fraction) }
}

// fallback absolute half-width for the guess-slider range when the correct
// answer is exactly 0, since a multiplier of 0 collapses to a zero-width window
const ZERO_ANSWER_RANGE_PAD = 10

// each side of the range is independently randomized within this band around
// the base half-width, so the correct answer doesn't always sit at the visual
// midpoint of the slider (which players could otherwise learn to exploit)
const SIDE_RANDOMIZATION_MIN = 0.5
const SIDE_RANDOMIZATION_MAX = 1.5

const randomSideWidth = (base: number): number =>
  base * (SIDE_RANDOMIZATION_MIN + Math.random() * (SIDE_RANDOMIZATION_MAX - SIDE_RANDOMIZATION_MIN))

export const computeEstimateAnswerRange = (
  correctAnswer: number,
  multiplier = 0.5,
): { min: number; max: number } => {
  const base =
    correctAnswer === 0 ? ZERO_ANSWER_RANGE_PAD : Math.abs(correctAnswer) * multiplier

  return {
    min: correctAnswer - randomSideWidth(base),
    max: correctAnswer + randomSideWidth(base),
  }
}
