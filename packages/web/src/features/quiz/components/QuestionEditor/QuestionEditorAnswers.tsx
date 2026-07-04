import {
  ANSWERS_COLORS,
  ANSWERS_LABELS,
} from "@questly/web/features/game/utils/constants"
import { useQuizEditor } from "@questly/web/features/quiz/contexts/quiz-editor-context"
import FormulaVariablesEditor from "@questly/web/features/quiz/components/QuestionEditor/FormulaVariablesEditor"
import EstimateVariablesEditor from "@questly/web/features/quiz/components/QuestionEditor/EstimateVariablesEditor"
import Slider from "@questly/web/components/Slider"
import clsx from "clsx"
import { Check, Cloud, Minus, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

const QuestionEditorAnswers = () => {
  const { currentQuestion, currentIndex, updateQuestion } = useQuizEditor()
  const { t } = useTranslation()

  const isMultiple = currentQuestion.type === "multiple"
  const isTrueFalse = currentQuestion.type === "truefalse"
  const isShortAnswer = currentQuestion.type === "shortanswer"
  const isWordCloud = currentQuestion.type === "wordcloud"
  const isCalculated = currentQuestion.type === "calculated"
  const isEstimate = currentQuestion.type === "estimate"
  const isDotmocracy = currentQuestion.type === "dotmocracy"

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
  const onVariablesChange = (next: typeof variables) =>
    updateQuestion(currentIndex, { calculatedVariables: next })
  const estimateVariables = currentQuestion.estimateVariables ?? []
  const onEstimateVariablesChange = (next: typeof estimateVariables) =>
    updateQuestion(currentIndex, { estimateVariables: next })
  const onFormulaChange = (formula: string) => updateQuestion(currentIndex, { formula })

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
        <FormulaVariablesEditor
          variables={variables}
          formula={currentQuestion.formula ?? ""}
          onVariablesChange={onVariablesChange}
          onFormulaChange={onFormulaChange}
        />

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
      </div>
    )
  }

  if (isEstimate) {
    return (
      <div className="relative z-10 flex flex-col gap-4">
        <EstimateVariablesEditor
          variables={estimateVariables}
          formula={currentQuestion.formula ?? ""}
          onVariablesChange={onEstimateVariablesChange}
          onFormulaChange={onFormulaChange}
        />

        {/* Tolerance */}
        <div className="flex flex-col gap-1.5 px-1">
          <span className="text-sm font-semibold text-white/70">
            {t("quiz:estimate.tolerance")}
          </span>
          <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm">
            <Slider
              min={0}
              max={20}
              step={1}
              value={currentQuestion.estimateTolerancePercent ?? 5}
              onChange={(v) => updateQuestion(currentIndex, { estimateTolerancePercent: v })}
              formatValue={(v) => `${v}%`}
            />
          </div>
          <p className="px-1 text-xs text-white/40">
            {t("quiz:estimate.toleranceHint")}
          </p>
        </div>
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
