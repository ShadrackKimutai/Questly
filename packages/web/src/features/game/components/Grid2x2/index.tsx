import clsx from "clsx"
import { useRef } from "react"

export const GRID_DOT_COLORS = [
  "bg-[#3B82F6]",
  "bg-[#EF4444]",
  "bg-[#0F172A]",
  "bg-[#818CF8]",
  "bg-[#10B981]",
  "bg-[#F59E0B]",
]

export interface Grid2x2Point {
  index: number
  label: string
  x: number
  y: number
}

interface Props {
  xLabel?: string
  yLabel?: string
  points: Grid2x2Point[]
  onPlace?: (_x: number, _y: number) => void
  disabled?: boolean
}

const Grid2x2 = ({ xLabel, yLabel, points, onPlace, disabled }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onPlace || disabled || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
    onPlace(x, y)
  }

  return (
    <div className="flex w-full items-stretch gap-2">
      {yLabel && (
        <div className="flex shrink-0 items-center justify-center">
          <span className="text-xs font-bold whitespace-nowrap text-white/70 [writing-mode:vertical-rl] rotate-180">
            {yLabel}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-1">
        <div
          ref={containerRef}
          onClick={handleClick}
          className={clsx(
            "relative aspect-square w-full overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm",
            onPlace && !disabled && "cursor-crosshair",
          )}
        >
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/25" />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/25" />

          {points.map((point, i) => (
            <div
              key={`${point.index}-${i}`}
              title={point.label}
              className={clsx(
                "absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/80 text-xs font-bold text-white shadow-lg",
                GRID_DOT_COLORS[point.index % GRID_DOT_COLORS.length],
              )}
              style={{
                left: `${point.x * 100}%`,
                top: `${(1 - point.y) * 100}%`,
              }}
            >
              {point.index + 1}
            </div>
          ))}
        </div>

        {xLabel && (
          <span className="text-center text-xs font-bold text-white/70">
            {xLabel}
          </span>
        )}
      </div>
    </div>
  )
}

export default Grid2x2
