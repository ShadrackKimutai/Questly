import type { EstimateVariable } from "@questly/common/types/game"
import { AlertCircle, Calculator, Minus, Plus } from "lucide-react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

const previewFormula = (formula: string, variables: EstimateVariable[]): string => {
  if (!formula.trim() || variables.length === 0) return "—"
  try {
    let expr = formula
    const names = variables.map((v) => v.name).sort((a, b) => b.length - a.length)
    for (const name of names) {
      const value = variables.find((v) => v.name === name)?.value ?? 0
      expr = expr.replace(new RegExp(`\\b${name}\\b`, "g"), String(value))
    }
    if (/[^0-9+\-*/^().% ]/.test(expr)) return "?"
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expr})`)() as number
    return isFinite(result) ? result.toFixed(4).replace(/\.?0+$/, "") : "error"
  } catch {
    return "?"
  }
}

type Props = {
  variables: EstimateVariable[]
  formula: string
  onVariablesChange: (_variables: EstimateVariable[]) => void
  onFormulaChange: (_formula: string) => void
}

const EstimateVariablesEditor = ({ variables, formula, onVariablesChange, onFormulaChange }: Props) => {
  const { t } = useTranslation()

  const updateVariable = (index: number, patch: Partial<EstimateVariable>) => {
    onVariablesChange(variables.map((v, i) => (i === index ? { ...v, ...patch } : v)))
  }

  const addVariable = () => {
    if (variables.length >= 8) return
    const usedNames = new Set(variables.map((v) => v.name))
    const letters = "abcdefghijklmnopqrstuvwxyz".split("")
    const next = letters.find((l) => !usedNames.has(l)) ?? `v${variables.length}`
    onVariablesChange([...variables, { name: next, value: 10 }])
  }

  const removeVariable = (index: number) => {
    onVariablesChange(variables.filter((_, i) => i !== index))
  }

  const preview = useMemo(
    () => previewFormula(formula, variables),
    [formula, variables],
  )

  return (
    <>
      {/* Variables */}
      <div className="flex items-center justify-between px-1">
        <span className="rounded-lg bg-white px-2 py-1 text-sm font-semibold text-gray-500">
          {t("quiz:calculated.variables")}
        </span>
        <button
          type="button"
          title="Add variable"
          onClick={addVariable}
          disabled={variables.length >= 8}
          className="flex size-7 items-center justify-center rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-40"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {variables.map((v, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm"
          >
            <input
              className="w-10 rounded-lg bg-purple-600 py-1 text-center text-sm font-bold text-white outline-none"
              value={v.name}
              maxLength={4}
              onChange={(e) => updateVariable(i, { name: e.target.value })}
              title="Variable name"
            />
            <div className="flex flex-1 flex-col items-center">
              <span className="text-[10px] font-semibold text-white/50">value</span>
              <input
                type="number"
                title="Value"
                placeholder="10"
                className="w-full rounded-lg bg-white/20 py-1 text-center text-sm font-semibold text-white outline-none"
                value={v.value}
                onChange={(e) => updateVariable(i, { value: parseFloat(e.target.value) || 0 })}
              />
            </div>
            {variables.length > 1 && (
              <button
                type="button"
                title="Remove variable"
                onClick={() => removeVariable(i)}
                className="ml-auto flex size-5 items-center justify-center text-white/50 hover:text-white"
              >
                <Minus className="size-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Formula */}
      <div className="flex flex-col gap-1.5 px-1">
        <span className="text-sm font-semibold text-white/70">
          {t("quiz:calculated.formula")}
        </span>
        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm">
          <Calculator className="size-4 shrink-0 text-purple-300" />
          <input
            className="flex-1 bg-transparent font-mono text-sm font-semibold text-white outline-none placeholder-white/40"
            placeholder={t("quiz:calculated.formulaPlaceholder")}
            value={formula}
            onChange={(e) => onFormulaChange(e.target.value)}
          />
        </div>
        <p className="px-1 text-xs text-white/40">
          {t("quiz:calculated.formulaHint", {
            vars: variables.map((v) => v.name).join(", "),
          })}
        </p>
      </div>

      {/* Live preview (deterministic — variables are fixed values, not randomized) */}
      {formula && (
        <div className="flex items-start gap-2 rounded-xl bg-black/20 px-3 py-2">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-white/40" />
          <p className="font-mono text-xs text-white/60">
            {t("quiz:calculated.preview")}: {preview}
          </p>
        </div>
      )}
    </>
  )
}

export default EstimateVariablesEditor
