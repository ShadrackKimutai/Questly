import {
  ANSWERS_COLORS,
  ANSWERS_LABELS,
} from "@questly/web/features/game/utils/constants"
import { useQuizEditor } from "@questly/web/features/quiz/contexts/quiz-editor-context"
import type { CalculatedVariable } from "@questly/common/types/game"
import clsx from "clsx"
import { Check, Cloud, Minus, Plus, Calculator, AlertCircle } from "lucide-react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

const previewFormula = (
  formula: string,
  variables: CalculatedVariable[],
): string => {
  if (!formula.trim() || variables.length === 0) return "—"
  try {
    const scope: Record<string, number> = {}
    for (const v of variables) {
      scope[v.name] = v.min + Math.random() * (v.max - v.min)
      scope[v.name] = parseFloat(scope[v.name].toFixed(v.decimals))
    }
    let expr = formula
    const names = Object.keys(scope).sort((a, b) => b.length - a.length)
    for (const name of names) {
      expr = expr.replace(new RegExp(`\\b${name}\\b`, "g"), String(scope[name]))
    }
    if (/[^0-9+\-*/^().% ]/.test(expr)) return "?"
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expr})`)() as number
    const varStr = names.map((n) => `${n}=${scope[n]}`).join(", ")
    return `${varStr} → ${isFinite(result) ? result.toFixed(4).replace(/\.?0+$/, "") : "error"}`
  } catch {
    return "?"
  }
}

const QuestionEditorAnswers = () => {
  const { currentQuestion, currentIndex, updateQuestion } = useQuizEditor()
  const { t } = useTranslation()

  const isMultiple = currentQuestion.type === "multiple"
  const isTrueFalse = currentQuestion.type === "truefalse"
  const isShortAnswer = currentQuestion.type === "shortanswer"
  const isWordCloud = currentQuestion.type === "wordcloud"
  const isCalculated = currentQuestion.type === "calculated"
  const isDotmocracy = currentQuestion.type === "dotmocracy"
  const isGrid2x2 = currentQuestion.type === "grid2x2"

  const updateAnswer = (index: number, value: string) => {
    const next = [...currentQuestion.answers]
    next[index] = value
    updateQuestion(currentIndex, { answers: next })
  }

  const addAnswer = () => {
    if (currentQuestion.answers.length >= 4) return
    updateQuestion(currentIndex, { answers: [...currentQuestion.answers, ""] })
  }

  const removeAnswer = () => {
    if (currentQuestion.answers.length <= 2) return
    const next = currentQuestion.answers.slice(0, -1)
    const maxIndex = next.length - 1
    const nextSolution = currentQuestion.solutions.filter((s) => s <= maxIndex)
    updateQuestion(currentIndex, {
      answers: next,
      solutions: nextSolution.length > 0 ? nextSolution : [0],
    })
  }

  const toggleSolution = (index: number) => {
    if (!isMultiple) {
      updateQuestion(currentIndex, { solutions: [index] })
      return
    }
    const current = currentQuestion.solutions
    if (current.includes(index)) {
      const next = current.filter((s) => s !== index)
      updateQuestion(currentIndex, { solutions: next.length > 0 ? next : [index] })
    } else {
      updateQuestion(currentIndex, { solutions: [...current, index] })
    }
  }

  const updateTextSolution = (index: number, value: string) => {
    const next = [...(currentQuestion.textSolutions ?? [])]
    next[index] = value
    updateQuestion(currentIndex, { textSolutions: next })
  }

  const addTextSolution = () => {
    updateQuestion(currentIndex, { textSolutions: [...(currentQuestion.textSolutions ?? []), ""] })
  }

  const removeTextSolution = (index: number) => {
    const next = (currentQuestion.textSolutions ?? []).filter((_, i) => i !== index)
    updateQuestion(currentIndex, { textSolutions: next.length > 0 ? next : [""] })
  }

  const variables = currentQuestion.calculatedVariables ?? []

  const updateVariable = (index: number, patch: Partial<CalculatedVariable>) => {
    const next = variables.map((v, i) => (i === index ? { ...v, ...patch } : v))
    updateQuestion(currentIndex, { calculatedVariables: next })
  }

  const addVariable = () => {
    if (variables.length >= 8) return
    const usedNames = new Set(variables.map((v) => v.name))
    const letters = "abcdefghijklmnopqrstuvwxyz".split("")
    const next = letters.find((l) => !usedNames.has(l)) ?? `v${variables.length}`
    updateQuestion(currentIndex, {
      calculatedVariables: [...variables, { name: next, min: 1, max: 10, decimals: 0 }],
    })
  }

  const removeVariable = (index: number) => {
    const next = variables.filter((_, i) => i !== index)
    updateQuestion(currentIndex, { calculatedVariables: next })
  }

  const preview = useMemo(
    () => previewFormula(currentQuestion.formula ?? "", variables),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentQuestion.formula, currentQuestion.calculatedVariables],
  )

  if (isDotmocracy) {
    const dotTypeValue = currentQuestion.dotType ?? "single"

    return (
      <div className="relative z-10 flex flex-col gap-4">
        {/* Options */}
        <div className="flex items-center justify-between px-1">
          <div className="rounded-lg bg-white px-2 py-1 text-sm font-semibold text-gray-500">
            {t("quiz:dotmocracy.options")}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              title="Remove option"
              onClick={removeAnswer}
              disabled={currentQuestion.answers.length <= 2}
              className="flex size-7 items-center justify-center rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <button
              type="button"
              title="Add option"
              onClick={addAnswer}
              disabled={currentQuestion.answers.length >= 8}
              className="flex size-7 items-center justify-center rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-40"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {currentQuestion.answers.map((answer, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-violet-400/30 bg-violet-600/20 px-4 py-3"
            >
              <span className="text-violet-300">●</span>
              <input
                className="flex-1 bg-transparent text-sm font-semibold text-white placeholder-white/50 outline-none"
                placeholder={t("quiz:addAnswerPlaceholder")}
                value={answer}
                onChange={(e) => updateAnswer(i, e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* Dot type toggle */}
        <div className="flex gap-2 px-1">
          {(["single", "multiple"] as const).map((dt) => (
            <button
              key={dt}
              type="button"
              onClick={() => updateQuestion(currentIndex, { dotType: dt })}
              className={clsx(
                "flex-1 rounded-xl border-2 py-2 text-sm font-semibold transition-colors",
                dotTypeValue === dt
                  ? "border-violet-400 bg-violet-500/20 text-white"
                  : "border-white/20 text-white/50 hover:border-white/40",
              )}
            >
              {t(`quiz:dotmocracy.${dt}`)}
            </button>
          ))}
        </div>

      </div>
    )
  }

  if (isGrid2x2) {
    const addGridItem = () => {
      if (currentQuestion.answers.length >= 6) return
      updateQuestion(currentIndex, {
        answers: [...currentQuestion.answers, `Item ${currentQuestion.answers.length + 1}`],
      })
    }

    const removeGridItem = () => {
      if (currentQuestion.answers.length <= 1) return
      updateQuestion(currentIndex, { answers: currentQuestion.answers.slice(0, -1) })
    }

    return (
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5 px-1">
          <span className="text-sm font-semibold text-white/70">
            {t("quiz:grid2x2.xAxisLabel")}
          </span>
          <input
            className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white outline-none backdrop-blur-sm placeholder-white/40"
            placeholder={t("quiz:grid2x2.xAxisLabel")}
            value={currentQuestion.gridXLabel ?? ""}
            onChange={(e) => updateQuestion(currentIndex, { gridXLabel: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5 px-1">
          <span className="text-sm font-semibold text-white/70">
            {t("quiz:grid2x2.yAxisLabel")}
          </span>
          <input
            className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white outline-none backdrop-blur-sm placeholder-white/40"
            placeholder={t("quiz:grid2x2.yAxisLabel")}
            value={currentQuestion.gridYLabel ?? ""}
            onChange={(e) => updateQuestion(currentIndex, { gridYLabel: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="rounded-lg bg-white px-2 py-1 text-sm font-semibold text-gray-500">
            {t("quiz:grid2x2.items")}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              title="Remove item"
              onClick={removeGridItem}
              disabled={currentQuestion.answers.length <= 1}
              className="flex size-7 items-center justify-center rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <button
              type="button"
              title="Add item"
              onClick={addGridItem}
              disabled={currentQuestion.answers.length >= 6}
              className="flex size-7 items-center justify-center rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-40"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {currentQuestion.answers.map((answer, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-violet-400/30 bg-violet-600/20 px-4 py-3"
            >
              <span className="text-violet-300">{i + 1}</span>
              <input
                className="flex-1 bg-transparent text-sm font-semibold text-white placeholder-white/50 outline-none"
                placeholder={t("quiz:addAnswerPlaceholder")}
                value={answer}
                onChange={(e) => updateAnswer(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isWordCloud) {
    return (
      <div className="z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/10 px-6 py-8 text-center backdrop-blur-sm">
        <Cloud className="size-10 text-white/60" />
        <p className="text-base font-semibold text-white/80">
          {t("quiz:wordcloudHint")}
        </p>
      </div>
    )
  }

  if (isCalculated) {
    return (
      <div className="relative z-10 flex flex-col gap-4">
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
              value={currentQuestion.formula ?? ""}
              onChange={(e) => updateQuestion(currentIndex, { formula: e.target.value })}
            />
          </div>
          <p className="px-1 text-xs text-white/40">
            {t("quiz:calculated.formulaHint", {
              vars: variables.map((v) => v.name).join(", "),
            })}
          </p>
        </div>

        {/* Tolerances */}
        <div className="flex gap-3 px-1">
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">
              {t("quiz:calculated.toleranceFull")}
            </span>
            <div className="flex items-center gap-1 rounded-xl bg-emerald-600/30 px-3 py-1.5">
              <input
                type="number"
                min={0}
                max={100}
                title="Full credit tolerance %"
                placeholder="5"
                className="w-full bg-transparent text-sm font-bold text-white outline-none"
                value={currentQuestion.toleranceBase ?? 5}
                onChange={(e) =>
                  updateQuestion(currentIndex, { toleranceBase: parseFloat(e.target.value) || 5 })
                }
              />
              <span className="text-sm text-white/60">%</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">
              {t("quiz:calculated.tolerancePartial")}
            </span>
            <div className="flex items-center gap-1 rounded-xl bg-amber-600/30 px-3 py-1.5">
              <input
                type="number"
                min={0}
                max={100}
                title="Partial credit tolerance %"
                placeholder="15"
                className="w-full bg-transparent text-sm font-bold text-white outline-none"
                value={currentQuestion.tolerancePartial ?? 15}
                onChange={(e) =>
                  updateQuestion(currentIndex, { tolerancePartial: parseFloat(e.target.value) || 15 })
                }
              />
              <span className="text-sm text-white/60">%</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">
              {t("quiz:calculated.answerDecimals")}
            </span>
            <div className="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1.5">
              <input
                type="number"
                min={0}
                max={6}
                title="Answer decimal places"
                placeholder="2"
                className="w-full bg-transparent text-sm font-bold text-white outline-none"
                value={currentQuestion.answerDecimals ?? 2}
                onChange={(e) =>
                  updateQuestion(currentIndex, { answerDecimals: parseInt(e.target.value) || 0 })
                }
              />
              <span className="text-sm text-white/60">dp</span>
            </div>
          </div>
        </div>

        {/* Live preview */}
        {currentQuestion.formula && (
          <div className="flex items-start gap-2 rounded-xl bg-black/20 px-3 py-2">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-white/40" />
            <p className="font-mono text-xs text-white/60">
              {t("quiz:calculated.preview")}: {preview}
            </p>
          </div>
        )}
      </div>
    )
  }

  if (isShortAnswer) {
    const textSolutions = currentQuestion.textSolutions ?? [""]

    return (
      <div className="z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="rounded-lg bg-white px-2 py-1 text-sm font-semibold text-gray-500">
            {t("quiz:acceptedAnswers")}
          </div>
          <button
            type="button"
            title="Add accepted answer"
            onClick={addTextSolution}
            className="flex size-7 items-center justify-center rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {textSolutions.map((sol, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3">
              <Check className="size-4 shrink-0 text-white" />
              <input
                className="flex-1 bg-transparent font-semibold text-white placeholder-white/70 outline-none"
                placeholder={t("quiz:addAnswerPlaceholder")}
                value={sol}
                onChange={(e) => updateTextSolution(i, e.target.value)}
              />
              {textSolutions.length > 1 && (
                <button
                  type="button"
                  title="Remove"
                  onClick={() => removeTextSolution(i)}
                  className="flex size-5 shrink-0 items-center justify-center rounded text-white/70 hover:text-white"
                >
                  <Minus className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="z-10 flex flex-col gap-3">
      {!isTrueFalse && (
        <div className="flex items-center justify-between px-1">
          <div className="rounded-lg bg-white px-2 py-1 text-sm font-semibold text-gray-500">
            {currentQuestion.answers.length}
            {t("quiz:answersCountSuffix")}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              title="Remove answer"
              onClick={removeAnswer}
              disabled={currentQuestion.answers.length <= 2}
              className="flex size-7 items-center justify-center rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <button
              type="button"
              title="Add answer"
              onClick={addAnswer}
              disabled={currentQuestion.answers.length >= 4}
              className="flex size-7 items-center justify-center rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-40"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {currentQuestion.answers.map((answer, i) => {
          const isSelected = currentQuestion.solutions.includes(i)

          return (
            <div
              key={i}
              className={clsx(
                "flex items-center gap-3 rounded-2xl px-4 py-6",
                ANSWERS_COLORS[i],
              )}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-black/20 text-sm font-bold text-white md:size-8 md:text-base">
                {ANSWERS_LABELS[i]}
              </span>
              <div className="flex flex-1 items-center justify-between gap-1.5 drop-shadow-md">
                <input
                  className="w-full bg-transparent font-semibold text-white placeholder-white/70 outline-none read-only:cursor-default"
                  placeholder={t("quiz:addAnswerPlaceholder")}
                  value={answer}
                  readOnly={isTrueFalse}
                  onChange={(e) => updateAnswer(i, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => toggleSolution(i)}
                  className={clsx(
                    "flex size-6 shrink-0 items-center justify-center border-2 transition-colors",
                    isMultiple ? "rounded-sm" : "rounded-full",
                    isSelected
                      ? "border-white bg-white text-green-600"
                      : "border-white/60 bg-transparent",
                  )}
                >
                  {isSelected && <Check className="size-4 stroke-5" />}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default QuestionEditorAnswers
