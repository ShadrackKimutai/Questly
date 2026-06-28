import { useResultModal } from "@questly/web/features/manager/contexts/result-modal-context"
import { Users } from "lucide-react"
import { useTranslation } from "react-i18next"

const ResultModalStats = () => {
  const { correctPct, answeredCount, totalPlayers, isWordCloud } = useResultModal()
  const { t } = useTranslation()

  const pct = isWordCloud
    ? (totalPlayers > 0 ? Math.round((answeredCount / totalPlayers) * 100) : 0)
    : correctPct
  const donutColor = isWordCloud ? "#6c47ff" : "#22c55e"
  const statLabel = isWordCloud
    ? t("manager:result.stats.participation")
    : t("manager:result.stats.correctAnswers")

  return (
    <div className="flex shrink-0 divide-x divide-gray-200 border-b border-gray-200 bg-gray-50">
      <div className="flex flex-1 items-center justify-between px-5 py-3">
        <p className="text-xs text-gray-500">{statLabel}</p>
        <div className="flex items-center gap-2">
          <div className="relative size-6">
            <svg className="size-6 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${94 - pct * 0.94 - 2} 94`}
                strokeDashoffset={`${-(pct * 0.94 + 1)}`}
              />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke={donutColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${pct * 0.94} 94`}
              />
            </svg>
          </div>
          <span className="text-sm font-semibold">{pct}%</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-between px-5 py-3">
        <p className="text-xs text-gray-500">
          {t("manager:result.stats.playersAnswered")}
        </p>
        <div className="flex items-center gap-2">
          <Users className="size-4 text-blue-500" />
          <span className="text-sm font-semibold">
            {answeredCount}/{totalPlayers}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ResultModalStats
