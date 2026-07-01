import type { AnswerFeedback } from "@questly/common/types/game/status"
import type { CommonStatusDataMap } from "@questly/common/types/game/status"
import CricleCheck from "@questly/web/features/game/components/icons/CricleCheck"
import CricleXmark from "@questly/web/features/game/components/icons/CricleXmark"
import { usePlayerStore } from "@questly/web/features/game/stores/player"
import { SFX } from "@questly/web/features/game/utils/constants"
import clsx from "clsx"
import { Check, X } from "lucide-react"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import useSound from "use-sound"

interface Props {
  data: CommonStatusDataMap["SHOW_RESULT"]
}

const FeedbackPanel = ({ feedback }: { feedback: AnswerFeedback }) => {
  const { t } = useTranslation()

  if (feedback.type === "dotmocracy") {
    return (
      <div className="mt-2 w-full max-w-md rounded-2xl bg-black/30 p-4 backdrop-blur-sm">
        <p className="mb-3 text-xs font-semibold tracking-wide text-white/50 uppercase">
          {t("game:yourAnswer")}
        </p>
        <div className="flex flex-wrap gap-3">
          {feedback.options.map((option, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="min-w-7 rounded-lg bg-violet-500/30 px-2 py-0.5 text-center text-sm font-bold text-violet-300">
                {feedback.votes[i] ?? 0}
              </span>
              <span className="text-sm text-white/70">{option}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (feedback.type === "calculated") {
    const tierColor =
      feedback.resultTier === "full"
        ? "bg-emerald-500/20 border border-emerald-500/40"
        : feedback.resultTier === "partial"
          ? "bg-amber-500/20 border border-amber-500/40"
          : "bg-red-500/20 border border-red-500/40"

    return (
      <div className={`mt-2 w-full max-w-md space-y-3 rounded-2xl p-4 backdrop-blur-sm ${tierColor}`}>
        {/* Variables row */}
        {Object.keys(feedback.playerVariables).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(feedback.playerVariables).map(([name, val]) => (
              <span
                key={name}
                className="rounded-lg bg-white/10 px-2 py-0.5 font-mono text-sm font-bold text-white"
              >
                {name} = {val}
              </span>
            ))}
          </div>
        )}
        {/* Answers */}
        <div className="flex flex-col gap-1.5 text-sm font-semibold">
          <div className="flex items-center justify-between">
            <span className="text-white/60">{t("game:calculated.yourAnswer")}</span>
            <span className="font-bold text-white">
              {feedback.playerAnswer !== null ? feedback.playerAnswer : t("game:noAnswer")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60">{t("game:calculated.correctAnswer")}</span>
            <span className="font-bold text-emerald-300">{feedback.correctAnswer}</span>
          </div>
        </div>
      </div>
    )
  }

  if (feedback.type === "wordcloud") {
    return (
      <div className="mt-2 w-full max-w-md space-y-2 rounded-2xl bg-black/30 p-4 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-white/50 uppercase">
              {t("game:yourAnswer")}
            </p>
            <p className="text-sm font-semibold text-white/80">
              {feedback.playerText ?? t("game:noAnswer")}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (feedback.type === "shortanswer") {
    return (
      <div className="mt-2 w-full max-w-md space-y-2 rounded-2xl bg-black/30 p-4 backdrop-blur-sm">
        {feedback.playerText && (
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500">
              <X className="size-3 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-white/50 uppercase">
                {t("game:yourAnswer")}
              </p>
              <p className="text-sm font-semibold text-white/80">
                {feedback.playerText}
              </p>
            </div>
          </div>
        )}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-500">
            <Check className="size-3 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-white/50 uppercase">
              {feedback.correctOptions.length === 1
                ? t("game:correctAnswer")
                : t("game:correctAnswers")}
            </p>
            <p className="text-sm font-semibold text-white">
              {feedback.correctOptions.join(" · ")}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // choice (single / multiple / truefalse)
  const relevant = feedback.items.filter(
    (item) => item.selectedByPlayer || item.isCorrect,
  )

  if (relevant.length === 0) return null

  return (
    <div className="mt-2 w-full max-w-md space-y-2 rounded-2xl bg-black/30 p-4 backdrop-blur-sm">
      {relevant.map((item, i) => {
        const hit = item.selectedByPlayer && item.isCorrect
        const miss = !item.selectedByPlayer && item.isCorrect
        const wrong = item.selectedByPlayer && !item.isCorrect

        return (
          <div key={i} className="flex items-center gap-3">
            <div
              className={clsx(
                "flex size-5 shrink-0 items-center justify-center rounded-full",
                hit && "bg-green-500",
                miss && "bg-amber-400",
                wrong && "bg-red-500",
              )}
            >
              {wrong ? (
                <X className="size-3 text-white" />
              ) : (
                <Check className="size-3 text-white" />
              )}
            </div>

            <span
              className={clsx(
                "flex-1 text-sm font-semibold",
                hit && "text-white",
                miss && "text-amber-300",
                wrong && "text-white/70 line-through",
              )}
            >
              {item.text}
            </span>

            {miss && (
              <span className="shrink-0 rounded bg-amber-400/20 px-1.5 py-0.5 text-xs font-bold text-amber-300">
                {t("game:missed")}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

const Result = ({
  data: { correct, partial, message, points, myPoints, rank, aheadOfMe, answerFeedback },
}: Props) => {
  const player = usePlayerStore()
  const { t } = useTranslation()
  const rankKeyMap: Record<number, string> = {
    1: "game:rank.1",
    2: "game:rank.2",
    3: "game:rank.3",
  }
  const rankKey = rankKeyMap[rank] ?? "rank.other"

  const [sfxResults] = useSound(SFX.RESULTS_SOUND, { volume: 0.2 })

  useEffect(() => {
    player.updatePoints(myPoints)
    const { pendingQuestion, appendHistory } = player
    if (pendingQuestion) {
      appendHistory({ question: pendingQuestion, correct, points })
    }
    // oxlint-disable-next-line
  }, [])

  useEffect(() => {
    sfxResults()
    // oxlint-disable-next-line
  }, [sfxResults])

  return (
    <section className="anim-show relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-2 px-4">
      {answerFeedback.type === "dotmocracy" ? (
        <div className="flex aspect-square max-h-52 w-full items-center justify-center text-[8rem] leading-none">
          🗳️
        </div>
      ) : correct ? (
        <CricleCheck className="aspect-square max-h-52 w-full" />
      ) : partial ? (
        <div className="flex aspect-square max-h-52 w-full items-center justify-center text-[10rem] leading-none">
          🟡
        </div>
      ) : (
        <CricleXmark className="aspect-square max-h-52 w-full" />
      )}

      <h2 className="text-4xl font-bold text-white drop-shadow-lg">
        {t(message)}
      </h2>

      <p className="text-xl font-bold text-white drop-shadow-lg">
        {t("game:resultTop")}
        {t(rankKey, { rank })}
        {aheadOfMe ? `${t("game:resultBehind")}${aheadOfMe}` : ""}
      </p>

      {correct && (
        <span className="rounded-lg bg-black/40 px-4 py-2 text-2xl font-bold text-white drop-shadow-lg">
          +{points}
        </span>
      )}

      {answerFeedback && (answerFeedback.type === "wordcloud" || answerFeedback.type === "dotmocracy" || !correct) && (
        <FeedbackPanel feedback={answerFeedback} />
      )}
    </section>
  )
}

export default Result
