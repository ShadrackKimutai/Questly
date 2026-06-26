import {
  ANSWERS_COLORS,
  ANSWERS_LABELS,
} from "@questly/web/features/game/utils/constants"
import { useResultModal } from "@questly/web/features/manager/contexts/result-modal-context"
import clsx from "clsx"
import { Check, X } from "lucide-react"
import { useTranslation } from "react-i18next"

const ResultModalTable = () => {
  const { questionResult, getPlayerPoints, isAnswerCorrect } = useResultModal()
  const { t } = useTranslation()

  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 shadow-sm">
        <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
          <th className="px-5 py-2.5">{t("manager:result.table.player")}</th>
          <th className="px-4 py-2.5">{t("manager:result.table.answered")}</th>
          <th className="px-4 py-2.5">
            {t("manager:result.table.correctIncorrect")}
          </th>
          <th className="px-4 py-2.5 text-right">
            {t("manager:result.table.points")}
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {questionResult.playerAnswers.map((pa, i) => {
          const isCorrect = isAnswerCorrect(pa.answerId)

          const answer =
            typeof pa.answerId === "number"
              ? {
                  label: ANSWERS_LABELS[pa.answerId % 4],
                  color: ANSWERS_COLORS[pa.answerId % 4],
                  text: questionResult.answers[pa.answerId],
                }
              : Array.isArray(pa.answerId)
                ? {
                    label: pa.answerId
                      .map((answerId) => ANSWERS_LABELS[answerId % 4])
                      .join(", "),
                    color: "bg-gray-700",
                    text: pa.answerId
                      .map((answerId) => questionResult.answers[answerId])
                      .join(", "),
                  }
                : typeof pa.answerId === "string"
                  ? {
                      label: null,
                      color: "bg-gray-700",
                      text: pa.answerId,
                    }
                  : null

          return (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-5 py-2.5 font-medium">{pa.playerName}</td>
              <td className="px-4 py-2.5">
                {answer ? (
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white",
                      answer.color,
                    )}
                  >
                    {answer.label && (
                      <span className="font-bold">{answer.label}</span>
                    )}
                    <span className="max-w-30 truncate">{answer.text}</span>
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-2.5">
                {isCorrect ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <Check className="size-3.5" />{" "}
                    {t("manager:result.table.correct")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-500">
                    <X className="size-3.5" />{" "}
                    {t("manager:result.table.incorrect")}
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5 text-right font-semibold text-gray-700">
                {getPlayerPoints(pa.playerName)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default ResultModalTable
