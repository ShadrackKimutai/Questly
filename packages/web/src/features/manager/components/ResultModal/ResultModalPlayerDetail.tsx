import {
  ANSWERS_COLORS,
  ANSWERS_LABELS,
} from "@questly/web/features/game/utils/constants"
import { useResultModal } from "@questly/web/features/manager/contexts/result-modal-context"
import clsx from "clsx"
import { Check, Minus, Trophy, X } from "lucide-react"
import { useTranslation } from "react-i18next"

interface Props {
  playerName: string
}

const ResultModalPlayerDetail = ({ playerName }: Props) => {
  const { result, getPlayerPoints, getPlayerRank, questionCorrectPct } =
    useResultModal()
  const { t } = useTranslation()

  const rank = getPlayerRank(playerName)
  const points = getPlayerPoints(playerName)

  const overallPct =
    result.questions.length > 0
      ? Math.round(
          result.questions.reduce((sum, _, i) => sum + questionCorrectPct(i), 0) /
            result.questions.length,
        )
      : 0

  type AnswerStatus = "correct" | "incorrect" | "participated"

  const getAnswerStatusForQuestion = (
    answerId: number | number[] | string | null,
    q: (typeof result.questions)[0],
  ): AnswerStatus => {
    if (q.type === "wordcloud" || q.type === "dotmocracy") {
      return typeof answerId === "string" && answerId.trim().length > 0
        ? "participated"
        : "incorrect"
    }
    if (answerId === null) return "incorrect"
    if (typeof answerId === "string") {
      return (q.textSolutions?.some(
        (s) => s.toLowerCase().trim() === answerId.toLowerCase().trim(),
      ) ?? false) ? "correct" : "incorrect"
    }
    if (Array.isArray(answerId)) {
      const sorted = (arr: number[]) => [...arr].sort((a, b) => a - b)
      return JSON.stringify(sorted(answerId)) === JSON.stringify(sorted(q.solutions))
        ? "correct"
        : "incorrect"
    }
    return q.solutions.includes(answerId) ? "correct" : "incorrect"
  }

  const isAnswerCorrectForQuestion = (
    answerId: number | number[] | string | null,
    q: (typeof result.questions)[0],
  ) => getAnswerStatusForQuestion(answerId, q) === "correct"

  const playerCorrect = result.questions.filter((q) => {
    const pa = q.playerAnswers.find((a) => a.playerName === playerName)
    return pa ? isAnswerCorrectForQuestion(pa.answerId, q) : false
  }).length

  const playerPct =
    result.questions.length > 0
      ? Math.round((playerCorrect / result.questions.length) * 100)
      : 0

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {/* player summary strip */}
      <div className="flex shrink-0 divide-x divide-gray-200 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-1 items-center justify-between px-5 py-3">
          <p className="text-xs text-gray-500">
            {t("manager:result.player.accuracy")}
          </p>
          <div className="flex items-center gap-2">
            <div className="relative size-6">
              <svg className="size-6 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${94 - playerPct * 0.94 - 2} 94`} strokeDashoffset={`${-(playerPct * 0.94 + 1)}`} />
                <circle cx="18" cy="18" r="15" fill="none" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${playerPct * 0.94} 94`} />
              </svg>
            </div>
            <span className="text-sm font-semibold">{playerPct}%</span>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-between px-5 py-3">
          <p className="text-xs text-gray-500">
            {t("manager:result.player.rank")}
          </p>
          <div className="flex items-center gap-2">
            <Trophy className={clsx("size-4", rank <= 3 ? "text-yellow-400" : "text-gray-300")} />
            <span className="text-sm font-semibold">#{rank} · {points} pts</span>
          </div>
        </div>
      </div>

      {/* vs class note */}
      <div className="shrink-0 border-b border-gray-100 bg-blue-50 px-5 py-2">
        <p className="text-xs text-blue-600">
          {t("manager:result.player.vsClass", { playerPct, overallPct })}
        </p>
      </div>

      {/* per-question breakdown */}
      <table className="w-full text-sm">
        <thead className="sticky top-0 shadow-sm">
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
            <th className="px-5 py-2.5">#</th>
            <th className="px-4 py-2.5">{t("manager:result.table.answered")}</th>
            <th className="px-4 py-2.5">{t("manager:result.table.correctIncorrect")}</th>
            <th className="px-4 py-2.5 text-right">{t("manager:result.overview.class")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {result.questions.map((q, i) => {
            const pa = q.playerAnswers.find((a) => a.playerName === playerName)
            const answerId = pa?.answerId ?? null
            const status = pa ? getAnswerStatusForQuestion(answerId, q) : "incorrect"
            const classPct = questionCorrectPct(i)

            const answerDisplay =
              typeof answerId === "number"
                ? {
                    label: ANSWERS_LABELS[answerId % 4],
                    color: ANSWERS_COLORS[answerId % 4],
                    text: q.answers[answerId],
                  }
                : Array.isArray(answerId)
                  ? {
                      label: answerId.map((id) => ANSWERS_LABELS[id % 4]).join(", "),
                      color: "bg-gray-700",
                      text: answerId.map((id) => q.answers[id]).join(", "),
                    }
                  : typeof answerId === "string" && q.type === "dotmocracy"
                    ? (() => {
                        try {
                          const votes = JSON.parse(answerId) as number[]
                          const text = votes.map((n, i) => `${ANSWERS_LABELS[i % 4]}:${n}`).join(" ")
                          return { label: "🗳️", color: "bg-violet-600", text }
                        } catch {
                          return { label: null, color: "bg-violet-600", text: answerId }
                        }
                      })()
                  : typeof answerId === "string"
                    ? { label: null, color: "bg-gray-700", text: answerId }
                    : null

            return (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-5 py-2.5">
                  <p className="text-xs font-bold text-gray-400">Q{i + 1}</p>
                  <p className="max-w-36 truncate text-xs text-gray-500">{q.question}</p>
                </td>
                <td className="px-4 py-2.5">
                  {answerDisplay ? (
                    <span className={clsx("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white", answerDisplay.color)}>
                      {answerDisplay.label && <span className="font-bold">{answerDisplay.label}</span>}
                      <span className="max-w-24 truncate">{answerDisplay.text}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {status === "correct" ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <Check className="size-3.5" /> {t("manager:result.table.correct")}
                    </span>
                  ) : status === "participated" ? (
                    <span className="flex items-center gap-1 text-violet-500">
                      <Minus className="size-3.5" /> {t("manager:result.table.participated")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500">
                      <X className="size-3.5" /> {t("manager:result.table.incorrect")}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className={clsx("text-xs font-semibold", classPct >= 60 ? "text-green-600" : classPct >= 30 ? "text-amber-500" : "text-red-500")}>
                    {classPct}%
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ResultModalPlayerDetail
