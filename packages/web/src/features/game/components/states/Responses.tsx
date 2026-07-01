import type { ManagerStatusDataMap } from "@questly/common/types/game/status"
import AnswerButton from "@questly/web/features/game/components/AnswerButton"
import Grid2x2, { GRID_DOT_COLORS } from "@questly/web/features/game/components/Grid2x2"
import {
  ANSWERS_COLORS,
  ANSWERS_LABELS,
  SFX,
} from "@questly/web/features/game/utils/constants"
import { calculatePercentages } from "@questly/web/features/game/utils/score"
import clsx from "clsx"
import { useEffect, useState } from "react"
import useSound from "use-sound"

interface Props {
  data: ManagerStatusDataMap["SHOW_RESPONSES"]
}

const WORD_COLORS = [
  "text-yellow-300", "text-sky-300", "text-emerald-300",
  "text-pink-300", "text-violet-300", "text-orange-300",
]

const WordCloud = ({ wordResponses }: { wordResponses: Record<string, number> }) => {
  const entries = Object.entries(wordResponses).sort((a, b) => b[1] - a[1])
  const maxCount = entries[0]?.[1] ?? 1

  return (
    <div className="flex w-full max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-6">
      {entries.map(([word, count], i) => {
        const ratio = count / maxCount
        const size = Math.round(16 + ratio * 40)
        return (
          <span
            key={word}
            className={clsx("font-bold drop-shadow-md transition-all", WORD_COLORS[i % WORD_COLORS.length])}
            style={{ fontSize: `${size}px`, lineHeight: 1.2 }}
          >
            {word}
            {count > 1 && (
              <sup className="ml-0.5 text-xs font-semibold opacity-70">{count}</sup>
            )}
          </span>
        )
      })}
    </div>
  )
}

const Responses = ({
  data: { question, answers, responses, solutions, type, wordResponses, calculatedSummary, dotVotes, gridPlacements, gridXLabel, gridYLabel },
}: Props) => {
  const [percentages, setPercentages] = useState<Record<string, string>>({})
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)

  const [sfxResults] = useSound(SFX.RESULTS_SOUND, {
    volume: 0.2,
  })

  const [playMusic, { stop: stopMusic }] = useSound(SFX.ANSWERS.MUSIC, {
    volume: 0.2,
    onplay: () => {
      setIsMusicPlaying(true)
    },
    onend: () => {
      setIsMusicPlaying(false)
    },
  })

  useEffect(() => {
    stopMusic()
    sfxResults()
    setPercentages(calculatePercentages(responses))
  }, [responses, playMusic, stopMusic, sfxResults])

  useEffect(() => {
    if (!isMusicPlaying) {
      playMusic()
    }
  }, [isMusicPlaying, playMusic])

  useEffect(() => {
    stopMusic()
  }, [playMusic, stopMusic])

  const isWordCloud = type === "wordcloud"
  const isCalculated = type === "calculated"
  const isDotmocracy = type === "dotmocracy"
  const isGrid2x2 = type === "grid2x2"

  return (
    <div className="flex h-full flex-1 flex-col justify-between">
      <div className="mx-auto inline-flex h-full w-full max-w-7xl flex-1 flex-col items-center justify-center gap-5">
        <h2 className="text-center text-2xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl">
          {question}
        </h2>

        {isDotmocracy ? (
          <div className="mt-6 flex w-full max-w-3xl flex-wrap justify-center gap-4 px-4">
            {answers.map((label, i) => {
              const count = dotVotes?.[i] ?? 0
              return (
                <div
                  key={i}
                  className="flex min-w-24 flex-col items-center gap-2 rounded-2xl border border-violet-500/40 bg-violet-500/20 p-5 backdrop-blur-sm"
                >
                  <span className="text-4xl font-bold text-violet-300">{count}</span>
                  <span className="text-sm font-semibold text-violet-200/80">{label}</span>
                </div>
              )
            })}
          </div>
        ) : isGrid2x2 ? (
          <div className="mt-6 flex w-full max-w-md flex-col gap-4 px-4">
            <Grid2x2
              xLabel={gridXLabel}
              yLabel={gridYLabel}
              points={(gridPlacements ?? []).map((p) => ({
                index: p.itemIndex,
                label: answers[p.itemIndex],
                x: p.x,
                y: p.y,
              }))}
              disabled
            />
            <div className="flex flex-wrap justify-center gap-3">
              {answers.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white",
                      GRID_DOT_COLORS[i % GRID_DOT_COLORS.length],
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-white/80">{label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : isCalculated ? (
          <div className="mt-8 flex w-full max-w-xl flex-col gap-4 px-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/20 p-5 backdrop-blur-sm">
                <span className="text-4xl font-bold text-emerald-300">
                  {calculatedSummary?.full ?? 0}
                </span>
                <span className="text-sm font-semibold text-emerald-200/80">Full Credit</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/20 p-5 backdrop-blur-sm">
                <span className="text-4xl font-bold text-amber-300">
                  {calculatedSummary?.partial ?? 0}
                </span>
                <span className="text-sm font-semibold text-amber-200/80">Partial</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/20 p-5 backdrop-blur-sm">
                <span className="text-4xl font-bold text-red-300">
                  {calculatedSummary?.wrong ?? 0}
                </span>
                <span className="text-sm font-semibold text-red-200/80">Wrong</span>
              </div>
            </div>
          </div>
        ) : isWordCloud ? (
          <WordCloud wordResponses={wordResponses ?? {}} />
        ) : (
          <div
            className="mt-8 grid h-40 w-full max-w-3xl gap-4 px-2"
            style={{ gridTemplateColumns: `repeat(${answers.length}, 1fr)` }}
          >
            {answers.map((_, key) => (
              <div
                key={key}
                className={clsx(
                  "flex flex-col justify-end self-end overflow-hidden rounded-md",
                  ANSWERS_COLORS[key],
                )}
                style={{ height: percentages[key] }}
              >
                <span className="w-full bg-black/10 text-center text-lg font-bold text-white drop-shadow-md">
                  {responses[key] || 0}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isWordCloud && !isCalculated && !isDotmocracy && !isGrid2x2 && (
        <div>
          <div className="mx-auto mb-4 grid w-full max-w-7xl grid-cols-2 gap-1 rounded-full px-2 text-lg font-bold text-white md:text-xl">
            {answers.map((answer, key) => (
              <AnswerButton
                key={key}
                className={clsx(ANSWERS_COLORS[key], {
                  // oxlint-disable-next-line typescript/no-unnecessary-condition
                  "opacity-65": responses && !solutions.includes(key),
                })}
                label={ANSWERS_LABELS[key]}
                correct={solutions.includes(key)}
              >
                {answer}
              </AnswerButton>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Responses
