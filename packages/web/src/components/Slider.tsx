import clsx from "clsx"

type Props = {
  value: number
  min: number
  max: number
  step?: number
  onChange: (_value: number) => void
  formatValue?: (_value: number) => string
  disabled?: boolean
  className?: string
  trackClassName?: string
  thumbClassName?: string
}

const Slider = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
  disabled,
  className,
  trackClassName,
  thumbClassName,
}: Props) => (
  <div className={clsx("flex flex-col gap-1.5", className)}>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={clsx(
        "h-2 w-full cursor-pointer appearance-none rounded-full outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "[&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-sm",
        "[&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-sm",
        trackClassName ?? "bg-white/20",
        thumbClassName ?? "[&::-moz-range-thumb]:bg-primary [&::-webkit-slider-thumb]:bg-primary",
      )}
    />
    {formatValue && (
      <div className="text-center text-sm font-bold text-white">
        {formatValue(value)}
      </div>
    )}
  </div>
)

export default Slider
