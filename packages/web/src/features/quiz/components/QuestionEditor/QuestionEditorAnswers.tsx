import {
  ANSWERS_COLORS,
  ANSWERS_LABELS,
} from "@questly/web/features/game/utils/constants"
import { useQuizEditor } from "@questly/web/features/quiz/contexts/quiz-editor-context"
import clsx from "clsx"
import { Check, Cloud, Minus, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

const QuestionEditorAnswers = () => {
  const { currentQuestion, currentIndex, updateQuestion } = useQuizEditor()
  const { t } = useTranslation()

  const updateAnswer = (index: number, value: string) => {
    const next = [...currentQuestion.answers]
    next[index] = value
    updateQuestion(currentIndex, { answers: next })
  }

  const addAnswer = () => {
    if (currentQuestion.answers.length >= 4) {
      return
    }

    updateQuestion(currentIndex, { answers: [...currentQuestion.answers, ""] })
  }

  const removeAnswer = () => {
    if (currentQuestion.answers.length <= 2) {
      return
    }

    const next = currentQuestion.answers.slice(0, -1)
    const maxIndex = next.length - 1
    const nextSolution = currentQuestion.solutions.filter((s) => s <= maxIndex)

    updateQuestion(currentIndex, {
      answers: next,
      solutions: nextSolution.length > 0 ? nextSolution : [0],
    })
  }

  const isMultiple = currentQuestion.type === "multiple"
  const isTrueFalse = currentQuestion.type === "truefalse"
  const isShortAnswer = currentQuestion.type === "shortanswer"
  const isWordCloud = currentQuestion.type === "wordcloud"

  const updateTextSolution = (index: number, value: string) => {
    const next = [...(currentQuestion.textSolutions ?? [])]
    next[index] = value
    updateQuestion(currentIndex, { textSolutions: next })
  }

  const addTextSolution = () => {
    const next = [...(currentQuestion.textSolutions ?? []), ""]
    updateQuestion(currentIndex, { textSolutions: next })
  }

  const removeTextSolution = (index: number) => {
    const next = (currentQuestion.textSolutions ?? []).filter((_, i) => i !== index)
    updateQuestion(currentIndex, { textSolutions: next.length > 0 ? next : [""] })
  }

  const toggleSolution = (index: number) => {
    if (!isMultiple) {
      updateQuestion(currentIndex, { solutions: [index] })
      return
    }

    const current = currentQuestion.solutions

    if (current.includes(index)) {
      const next = current.filter((s) => s !== index)
      updateQuestion(currentIndex, {
        solutions: next.length > 0 ? next : [index],
      })
    } else {
      updateQuestion(currentIndex, { solutions: [...current, index] })
    }
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
