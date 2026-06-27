import type { CommonStatusDataMap } from "@questly/common/types/game/status"
import { usePlayerStore } from "@questly/web/features/game/stores/player"
import clsx from "clsx"
import { Check, ChevronRight, X } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

interface Props {
  data: CommonStatusDataMap["FINISHED"]
}

const PlayerFinished = ({ data: { rank, subject } }: Props) => {
  const { player, history } = usePlayerStore()
  const { t } = useTranslation()
  const [reviewing, setReviewing] = useState(history.length > 0)

  const rankKeyMap: Record<number, string> = {
    1: "game:rank.1",
    2: "game:rank.2",
    3: "game:rank.3",
  }
  const rankKey =
    typeof rank === "number" ? (rankKeyMap[rank] ?? "game:rank.other") : null

  if (reviewing) {
    return (
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-white/20 px-4 py-3">
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            <h2 className="text-lg font-bold text-white drop-shadow">
              {t("game:reviewTitle")}
            </h2>
            <button
              type="button"
              onClick={() => setReviewing(false)}
              className="flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/30"
            >
              {t("game:reviewSkip")}
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <div className="mx-auto max-w-2xl space-y-2">
            {history.map((entry, i) => (
              <div
                key={i}
                className={clsx(
                  "flex items-start gap-3 rounded-xl p-3",
                  entry.correct ? "bg-green-500/20" : "bg-red-500/20",
                )}
              >
                <div
                  className={clsx(
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                    entry.correct ? "bg-green-500" : "bg-red-500",
                  )}
                >
                  {entry.correct ? (
                    <Check className="size-3.5 text-white" />
                  ) : (
                    <X className="size-3.5 text-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug text-white drop-shadow">
                    Q{i + 1}: {entry.question}
                  </p>
                  {entry.correct && (
                    <p className="mt-0.5 text-xs font-bold text-green-300">
                      +{entry.points} pts
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 px-4 py-3">
          <div className="mx-auto max-w-2xl">
            <button
              type="button"
              onClick={() => setReviewing(false)}
              className="bg-primary w-full rounded-2xl py-3 text-base font-bold text-white shadow-lg"
            >
              {t("game:reviewContinue")}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 px-4">
      <span className="text-9xl leading-none drop-shadow-lg">{player?.mascot}</span>

      <p className="text-center text-4xl font-bold text-white drop-shadow-lg md:text-5xl">
        {subject}
      </p>

      <p className="text-center text-3xl font-bold text-white drop-shadow-lg md:text-4xl">
        {rankKey !== null ? t(rankKey, { rank }) : "—"}
      </p>

      <p className="mt-2 rounded bg-black/40 px-6 py-2 text-2xl font-bold text-white">
        {player?.points ?? 0} pts
      </p>

      {history.length > 0 && (
        <button
          type="button"
          onClick={() => setReviewing(true)}
          className="mt-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30"
        >
          {t("game:reviewTitle")}
        </button>
      )}
    </div>
  )
}

export default PlayerFinished
