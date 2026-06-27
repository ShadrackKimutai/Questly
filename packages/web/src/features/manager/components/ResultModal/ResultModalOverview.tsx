import { useResultModal } from "@questly/web/features/manager/contexts/result-modal-context"
import clsx from "clsx"
import { ChevronRight, Trophy, Users } from "lucide-react"
import { useTranslation } from "react-i18next"

const ResultModalOverview = () => {
  const { result, totalPlayers, questionCorrectPct, goToQuestion, goToPlayer } =
    useResultModal()
  const { t } = useTranslation()

  const overallPct =
    result.questions.length > 0
      ? Math.round(
          result.questions.reduce((sum, _, i) => sum + questionCorrectPct(i), 0) /
            result.questions.length,
        )
      : 0

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {/* summary strip */}
      <div className="flex shrink-0 divide-x divide-gray-200 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-1 items-center justify-between px-5 py-3">
          <p className="text-xs text-gray-500">
            {t("manager:result.overview.overallAccuracy")}
          </p>
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
                  strokeDasharray={`${94 - overallPct * 0.94 - 2} 94`}
                  strokeDashoffset={`${-(overallPct * 0.94 + 1)}`}
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${overallPct * 0.94} 94`}
                />
              </svg>
            </div>
            <span className="text-sm font-semibold">{overallPct}%</span>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-between px-5 py-3">
          <p className="text-xs text-gray-500">
            {t("manager:result.overview.players")}
          </p>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-blue-500" />
            <span className="text-sm font-semibold">{totalPlayers}</span>
          </div>
        </div>
      </div>

      {/* questions */}
      <div className="shrink-0 border-b border-gray-200">
        <p className="px-5 pt-3 pb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">
          {t("manager:result.overview.questions")}
        </p>
        {result.questions.map((q, i) => {
          const pct = questionCorrectPct(i)
          return (
            <button
              key={i}
              type="button"
              onClick={() => goToQuestion(i)}
              className="flex w-full items-center gap-3 px-5 py-2.5 text-left hover:bg-gray-50"
            >
              <span className="shrink-0 text-xs font-bold text-gray-400 w-6">
                Q{i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700">
                {q.question}
              </span>
              <div className="shrink-0 flex items-center gap-2 w-28">
                <div className="flex-1 h-1.5 rounded-full bg-gray-200">
                  <div
                    className={clsx(
                      "h-1.5 rounded-full",
                      pct >= 60 ? "bg-green-500" : pct >= 30 ? "bg-amber-400" : "bg-red-400",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-500 w-8 text-right">
                  {pct}%
                </span>
              </div>
              <ChevronRight className="size-4 shrink-0 text-gray-300" />
            </button>
          )
        })}
      </div>

      {/* players */}
      <div>
        <p className="px-5 pt-3 pb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">
          {t("manager:result.overview.leaderboard")}
        </p>
        {result.players.map((p) => (
          <button
            key={p.username}
            type="button"
            onClick={() => goToPlayer(p.username)}
            className="flex w-full items-center gap-3 px-5 py-2.5 text-left hover:bg-gray-50"
          >
            <Trophy
              className={clsx(
                "size-4 shrink-0",
                p.rank === 1
                  ? "text-yellow-400"
                  : p.rank === 2
                    ? "text-gray-400"
                    : p.rank === 3
                      ? "text-amber-600"
                      : "text-gray-200",
              )}
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700">
              {p.username}
            </span>
            <span className="shrink-0 text-sm font-semibold text-gray-500">
              {p.points} pts
            </span>
            <ChevronRight className="size-4 shrink-0 text-gray-300" />
          </button>
        ))}
      </div>
    </div>
  )
}

export default ResultModalOverview
