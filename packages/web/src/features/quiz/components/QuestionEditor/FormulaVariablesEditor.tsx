import type { CalculatedVariable } from "@questly/common/types/game"
import { AlertCircle, Calculator, Minus, Plus } from "lucide-react"
import { evaluate } from "mathjs"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

const previewFormula = (
  formula: string,
  variables: CalculatedVariable[],
): string => {
  if (!formula.trim() || variables.length === 0) return "—"

  const scope: Record<string, number> = {}
  for (const v of variables) {
    const raw = v.min + Math.random() * (v.max - v.min)
    scope[v.name] = parseFloat(raw.toFixed(v.decimals))
  }

  try {
    const result: unknown = evaluate(formula, scope)
    const varStr = Object.entries(scope)
      .map(([name, value]) => `${name}=${value}`)
      .join(", ")
    const resultStr =
      typeof result === "number" && isFinite(result)
        ? result.toFixed(4).replace(/\.?0+$/, "")
        : "error"
    return `${varStr} → ${resultStr}`
  } catch {
    return "?"
  }
}

type Props = {
  variables: CalculatedVariable[]
  formula: string
  onVariablesChange: (_variables: CalculatedVariable[]) => void
  onFormulaChange: (_formula: string) => void
}

const FormulaVariablesEditor = ({ variables, formula, onVariablesChange, onFormulaChange }: Props) => {
  const { t } = useTranslation()

  const updateVariable = (index: number, patch: Partial<CalculatedVariable>) => {
    onVariablesChange(variables.map((v, i) => (i === index ? { ...v, ...patch } : v)))
  }

  const addVariable = () => {
    if (variables.length >= 8) return
    const usedNames = new Set(variables.map((v) => v.name))
    const letters = "abcdefghijklmnopqrstuvwxyz".split("")
    const next = letters.find((l) => !usedNames.has(l)) ?? `v${variables.length}`
    onVariablesChange([...variables, { name: next, min: 1, max: 10, decimals: 0 }])
  }

  const removeVariable = (index: number) => {
    onVariablesChange(variables.filter((_, i) => i !== index))
  }

  const preview = useMemo(
    () => previewFormula(formula, variables),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-semibold text-white/50">min</span>
              <input
                type="number"
                title="Minimum value"
                placeholder="1"
                className="w-16 rounded-lg bg-white/20 py-1 text-center text-sm font-semibold text-white outline-none"
                value={v.min}
                onChange={(e) => updateVariable(i, { min: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <span className="text-white/40">–</span>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-semibold text-white/50">max</span>
              <input
                type="number"
                title="Maximum value"
                placeholder="10"
                className="w-16 rounded-lg bg-white/20 py-1 text-center text-sm font-semibold text-white outline-none"
                value={v.max}
                onChange={(e) => updateVariable(i, { max: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-semibold text-white/50">dp</span>
              <input
                type="number"
                min={0}
                max={6}
                title="Decimal places"
                placeholder="0"
                className="w-10 rounded-lg bg-white/20 py-1 text-center text-sm font-semibold text-white outline-none"
                value={v.decimals}
                onChange={(e) => updateVariable(i, { decimals: parseInt(e.target.value) || 0 })}
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

      {/* Live preview */}
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

export default FormulaVariablesEditor
