import type { EstimatePlayerGuess } from "@questly/common/types/game/status"
import clsx from "clsx"
import { Minus, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  guesses: EstimatePlayerGuess[]
  correctAnswer: number
  tolerancePercent: number
  noAnswerCount?: number
  /** Use on dark/translucent backgrounds (e.g. the live in-game view) instead of the default light panel styling */
  dark?: boolean
}

type Pin = EstimatePlayerGuess & {
  tier: "full" | "partial" | "wrong"
  leftPercent: number
}

const TIER_COLORS: Record<Pin["tier"], string> = {
  full: "#10b981",
  partial: "#f59e0b",
  wrong: "#ef4444",
}

const tierOf = (fraction: number): Pin["tier"] =>
  fraction >= 0.8 ? "full" : fraction > 0 ? "partial" : "wrong"

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const formatTick = (value: number) => (Math.round(value * 100) / 100).toString()

const PinMarker = ({ pin, left, zIndex, stackCount, onClick }: {
  pin: Pin
  left: number
  zIndex: number
  stackCount: number
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    style={{ left: `${left}%`, zIndex }}
    className="absolute bottom-0 flex w-[88px] -translate-x-1/2 flex-col items-center transition-[left] duration-700 ease-out"
    title={pin.playerName}
  >
    {stackCount > 1 && (
      <span className="absolute -top-3 -right-3 z-10 flex size-10 items-center justify-center rounded-full bg-black/70 text-xl font-bold text-white">
        ×{stackCount}
      </span>
    )}
    {/* tip of the teardrop sits at the bottom of this box, which lines up with the number line below */}
    <div className="relative size-[88px]">
      <svg viewBox="0 0 24 32" className="size-[88px] drop-shadow-lg">
        <path
          d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z"
          fill={TIER_COLORS[pin.tier]}
          fillOpacity={0.78}
          stroke={TIER_COLORS[pin.tier]}
          strokeWidth={1}
        />
        <circle cx="12" cy="12" r="7.5" fill="white" fillOpacity={0.92} />
      </svg>
      <span className="absolute top-[34%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl leading-none">
        {pin.mascot}
      </span>
    </div>
  </button>
)

const EstimateResultPlot = ({ guesses, correctAnswer, tolerancePercent, noAnswerCount = 0, dark = false }: Props) => {
  const { t } = useTranslation()
  const [scale, setScale] = useState(1)
  const [expandedBucket, setExpandedBucket] = useState<number | null>(null)

  const toleranceAbsolute =
    correctAnswer === 0 ? 1 : Math.abs(correctAnswer) * (tolerancePercent / 100)
  const halfWidth = Math.max(toleranceAbsolute * 2.5, 1)
  const lineMin = correctAnswer - halfWidth
  const lineMax = correctAnswer + halfWidth

  const pins: Pin[] = guesses.map((guess) => {
    const clamped = clamp(guess.numericAnswer, lineMin, lineMax)
    return {
      ...guess,
      tier: tierOf(guess.accuracyFraction),
      leftPercent: ((clamped - lineMin) / (lineMax - lineMin)) * 100,
    }
  })

  // Pins start at a random position and settle into their real spot once on load
  const [entryPositions] = useState<Map<string, number>>(
    () => new Map(pins.map((pin) => [pin.playerName, Math.random() * 100])),
  )
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const bucketSize = Math.max(0.5, 3 / scale)
  const buckets = new Map<number, Pin[]>()
  pins.forEach((pin) => {
    const key = Math.round(pin.leftPercent / bucketSize)
    const list = buckets.get(key) ?? []
    list.push(pin)
    buckets.set(key, list)
  })

  // z-index by rank (closest-to-correct on top), not raw offset — offset scales with the
  // magnitude of the answer, so for large numbers "100 - offset" went deeply negative and
  // pushed pins behind the panel's own background, making them invisible
  const bucketEntries = Array.from(buckets.entries()).map(([key, bucket]) => ({
    key,
    sorted: [...bucket].sort((a, b) => Math.abs(a.offset) - Math.abs(b.offset)),
  }))
  const rankedByCloseness = [...bucketEntries].sort(
    (a, b) => Math.abs(a.sorted[0].offset) - Math.abs(b.sorted[0].offset),
  )
  const zIndexByKey = new Map(
    rankedByCloseness.map(({ key }, i) => [key, rankedByCloseness.length - i]),
  )

  const correctLeftPercent = ((correctAnswer - lineMin) / (lineMax - lineMin)) * 100

  const TICK_COUNT = 5
  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const value = lineMin + (i / (TICK_COUNT - 1)) * (lineMax - lineMin)
    return { value, leftPercent: (i / (TICK_COUNT - 1)) * 100 }
  })

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <div className="flex items-center justify-between">
        <p className={clsx("text-sm font-semibold", dark ? "text-white/80" : "text-gray-600")}>
          {t("manager:result.estimate.correctAnswer", { answer: correctAnswer })}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Zoom out"
            onClick={() => setScale((s) => Math.max(1, s - 1))}
            disabled={scale <= 1}
            className={clsx(
              "flex size-7 items-center justify-center rounded-lg disabled:opacity-40",
              dark ? "bg-white/15 text-white hover:bg-white/25" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            <Minus className="size-4" />
          </button>
          <button
            type="button"
            title="Zoom in"
            onClick={() => setScale((s) => Math.min(8, s + 1))}
            disabled={scale >= 8}
            className={clsx(
              "flex size-7 items-center justify-center rounded-lg disabled:opacity-40",
              dark ? "bg-white/15 text-white hover:bg-white/25" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div
        className={clsx(
          "overflow-x-auto rounded-xl py-4",
          dark ? "bg-white/10 backdrop-blur-sm" : "bg-gray-50",
        )}
      >
        <div className="flex flex-col" style={{ width: `${scale * 100}%`, minWidth: "100%" }}>
          {/* pins — anchored to the bottom of this row so their tip touches the line below */}
          <div className="relative h-24">
            {bucketEntries.map(({ key, sorted }) => {
              const top = sorted[0]
              const left = entered
                ? top.leftPercent
                : (entryPositions.get(top.playerName) ?? top.leftPercent)
              return (
                <PinMarker
                  key={key}
                  pin={top}
                  left={left}
                  zIndex={zIndexByKey.get(key) ?? 1}
                  stackCount={sorted.length}
                  onClick={() => setExpandedBucket(expandedBucket === key ? null : key)}
                />
              )
            })}
          </div>

          {/* the number line itself */}
          <div className={clsx("relative h-1 rounded-full", dark ? "bg-white/25" : "bg-gray-300")}>
            <div
              className={clsx(
                "absolute -top-1.5 -bottom-1.5 w-0.5 -translate-x-1/2",
                dark ? "bg-white/70" : "bg-gray-500",
              )}
              style={{ left: `${clamp(correctLeftPercent, 0, 100)}%` }}
            />
          </div>

          {/* tick marks + value labels */}
          <div className="relative h-8">
            {ticks.map((tick, i) => (
              <div
                key={i}
                className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${tick.leftPercent}%` }}
              >
                <div className={clsx("h-1.5 w-px", dark ? "bg-white/30" : "bg-gray-300")} />
                <span
                  className={clsx(
                    "mt-1 text-[10px] font-medium whitespace-nowrap",
                    dark ? "text-white/50" : "text-gray-400",
                  )}
                >
                  {formatTick(tick.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {expandedBucket !== null && buckets.get(expandedBucket) && (
        <div className={clsx("flex flex-col gap-1.5 rounded-xl p-3", dark ? "bg-white/10 backdrop-blur-sm" : "bg-gray-50")}>
          {[...buckets.get(expandedBucket)!]
            .sort((a, b) => Math.abs(a.offset) - Math.abs(b.offset))
            .map((pin) => (
              <div key={pin.playerName} className="flex items-center justify-between gap-3 text-sm">
                <span className={clsx("flex items-center gap-1.5 font-medium", dark ? "text-white" : "text-gray-700")}>
                  <span className="text-base leading-none">{pin.mascot}</span>
                  {pin.playerName}
                </span>
                <span className={dark ? "text-white/70" : "text-gray-600"}>
                  {pin.numericAnswer} ({pin.offset > 0 ? "+" : ""}
                  {pin.offset.toFixed(2).replace(/\.?0+$/, "")})
                </span>
              </div>
            ))}
        </div>
      )}

      {noAnswerCount > 0 && (
        <p className={clsx("text-xs", dark ? "text-white/50" : "text-gray-400")}>
          {t("manager:result.estimate.noAnswerCount", { count: noAnswerCount })}
        </p>
      )}
    </div>
  )
}

export default EstimateResultPlot
