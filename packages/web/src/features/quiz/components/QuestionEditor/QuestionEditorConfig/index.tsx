import * as Switch from "@radix-ui/react-switch"
import { NO_TIME_LIMIT } from "@questly/common/constants"
import type { QuestionType } from "@questly/common/types/game"
import ConfigField from "@questly/web/features/quiz/components/QuestionEditor/QuestionEditorConfig/ConfigField"
import ConfigNumberInput from "@questly/web/features/quiz/components/QuestionEditor/QuestionEditorConfig/ConfigNumberInput"
import ConfigSection from "@questly/web/features/quiz/components/QuestionEditor/QuestionEditorConfig/ConfigSection"
import { useQuizEditor } from "@questly/web/features/quiz/contexts/quiz-editor-context"
import clsx from "clsx"
import { Calculator, CheckSquare, Clock, Cloud, Grid2x2, Keyboard, Square, Timer, ToggleLeft, Vote } from "lucide-react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

const DEFAULT_TIME = 20

const TRUE_FALSE_ANSWERS = ["True", "False"]

const QUESTION_TYPES: { value: QuestionType; labelKey: string; icon: ReactNode }[] = [
  { value: "single", labelKey: "quiz:question.config.typeSingle", icon: <Square className="size-4" /> },
  { value: "multiple", labelKey: "quiz:question.config.typeMultiple", icon: <CheckSquare className="size-4" /> },
  { value: "truefalse", labelKey: "quiz:question.config.typeTrueFalse", icon: <ToggleLeft className="size-4" /> },
  { value: "shortanswer", labelKey: "quiz:question.config.typeShortAnswer", icon: <Keyboard className="size-4" /> },
  { value: "wordcloud", labelKey: "quiz:question.config.typeWordCloud", icon: <Cloud className="size-4" /> },
  { value: "calculated", labelKey: "quiz:question.config.typeCalculated", icon: <Calculator className="size-4" /> },
  { value: "dotmocracy", labelKey: "quiz:question.config.typeDotmocracy", icon: <Vote className="size-4" /> },
  { value: "grid2x2", labelKey: "quiz:question.config.typeGrid2x2", icon: <Grid2x2 className="size-4" /> },
]

const QuestionEditorConfig = () => {
  const { currentQuestion, currentIndex, updateQuestion } = useQuizEditor()
  const { t } = useTranslation()
  const isTimeLimitEnabled = currentQuestion.time !== NO_TIME_LIMIT
  const questionType = currentQuestion.type ?? "single"

  const handleUpdateQuestion = (key: string) => (value: string | number) => {
    updateQuestion(currentIndex, { [key]: value })
  }

  const handleToggleTimeLimit = (checked: boolean) => {
    updateQuestion(currentIndex, {
      time: checked ? DEFAULT_TIME : NO_TIME_LIMIT,
    })
  }

  const handleTypeChange = (value: QuestionType) => {
    if (value === "truefalse") {
      updateQuestion(currentIndex, { type: value, answers: TRUE_FALSE_ANSWERS, solutions: [0], textSolutions: undefined })
    } else if (value === "shortanswer") {
      updateQuestion(currentIndex, { type: value, answers: [], solutions: [], textSolutions: [""] })
    } else if (value === "wordcloud") {
      updateQuestion(currentIndex, { type: value, answers: [], solutions: [], textSolutions: undefined })
    } else if (value === "calculated") {
      updateQuestion(currentIndex, {
        type: value,
        answers: [],
        solutions: [],
        textSolutions: undefined,
        calculatedVariables: [{ name: "a", min: 1, max: 10, decimals: 0 }],
        formula: "",
        toleranceBase: 5,
        tolerancePartial: 15,
        answerDecimals: 2,
      })
    } else if (value === "dotmocracy") {
      updateQuestion(currentIndex, {
        type: value,
        answers: ["Option A", "Option B", "Option C"],
        solutions: [],
        textSolutions: undefined,
        calculatedVariables: undefined,
        formula: undefined,
        dotType: "single",
        gridXLabel: undefined,
        gridYLabel: undefined,
      })
    } else if (value === "grid2x2") {
      updateQuestion(currentIndex, {
        type: value,
        answers: ["Item 1", "Item 2", "Item 3", "Item 4"],
        solutions: [],
        textSolutions: undefined,
        calculatedVariables: undefined,
        formula: undefined,
        dotType: undefined,
        gridXLabel: undefined,
        gridYLabel: undefined,
      })
    } else if (
      questionType === "truefalse" ||
      questionType === "shortanswer" ||
      questionType === "wordcloud" ||
      questionType === "calculated" ||
      questionType === "dotmocracy" ||
      questionType === "grid2x2"
    ) {
      updateQuestion(currentIndex, { type: value, answers: ["", ""], solutions: [0], textSolutions: undefined, calculatedVariables: undefined, formula: undefined, dotType: undefined, gridXLabel: undefined, gridYLabel: undefined })
    } else {
      updateQuestion(currentIndex, { type: value })
    }
  }

  return (
    <aside className="z-10 m-3 flex w-68 shrink-0 flex-col gap-6 self-start overflow-auto rounded-xl bg-white p-4 shadow-sm">
      <ConfigSection title={t("quiz:question.config.questionType")}>
        <div className="flex flex-wrap gap-2">
          {QUESTION_TYPES.map(({ value, labelKey, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleTypeChange(value)}
              className={clsx(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 px-2 py-2 text-xs font-semibold transition-colors",
                questionType === value
                  ? "border-primary text-primary bg-primary/5"
                  : "border-gray-200 text-gray-500 hover:border-gray-300",
              )}
            >
              {icon}
              {t(labelKey)}
            </button>
          ))}
        </div>
      </ConfigSection>

      <ConfigSection title={t("quiz:question.config.timings")}>
        <ConfigField>
          <ConfigField.Label
            icon={<Clock className="size-4" />}
            label={t("quiz:question.config.questionDisplay")}
          />
          <ConfigNumberInput
            value={currentQuestion.cooldown}
            min={3}
            onChange={handleUpdateQuestion("cooldown")}
          />
          <ConfigField.Description>
            {t("quiz:question.config.questionDisplayHint")}
          </ConfigField.Description>
        </ConfigField>

        <ConfigField>
          <ConfigField.Label
            icon={<Timer className="size-4" />}
            label={t("quiz:question.config.answerTime")}
            unit={isTimeLimitEnabled ? "sec" : undefined}
            action={
              <Switch.Root
                checked={isTimeLimitEnabled}
                onCheckedChange={handleToggleTimeLimit}
                className="data-[state=checked]:bg-primary focus-visible:outline-primary relative h-5 w-9 cursor-pointer rounded-full bg-gray-200 transition-colors focus-visible:outline-2"
              >
                <Switch.Thumb className="block size-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-4.5" />
              </Switch.Root>
            }
          />
          {isTimeLimitEnabled && (
            <ConfigNumberInput
              value={currentQuestion.time}
              min={5}
              onChange={handleUpdateQuestion("time")}
            />
          )}
          <ConfigField.Description>
            {isTimeLimitEnabled
              ? t("quiz:question.config.answerTimeHint")
              : t("quiz:question.config.noTimeLimitHint")}
          </ConfigField.Description>
        </ConfigField>
      </ConfigSection>
    </aside>
  )
}

export default QuestionEditorConfig
