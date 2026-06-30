import clsx from "clsx"
import { Check, CheckSquare, Circle, CircleDot, Square, X } from "lucide-react"
import type { ButtonHTMLAttributes, PropsWithChildren } from "react"

type Props = PropsWithChildren &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    label: string
    correct?: boolean
    selected?: boolean
    showCheckbox?: boolean
    showRadio?: boolean
  }

const AnswerButton = ({
  className,
  label,
  children,
  correct,
  selected,
  showCheckbox,
  showRadio,
  ...otherProps
}: Props) => {
  const CorrectIcon = correct ? Check : X

  return (
    <button
      className={clsx(
        "button relative flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-150 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] md:py-6",
        selected && "ring-4 ring-white/80 ring-inset scale-[1.02]",
        className,
      )}
      {...otherProps}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-black/20 text-sm font-extrabold sm:size-7 md:size-8 md:text-base">
        {label}
      </span>
      <p className="w-full flex-1 text-sm font-semibold break-all drop-shadow-sm md:text-lg">
        {children}
      </p>
      {showRadio && (
        selected
          ? <CircleDot className="size-5 shrink-0 stroke-[2.5] md:size-6" />
          : <Circle className="size-5 shrink-0 stroke-[2.5] opacity-50 md:size-6" />
      )}
      {showCheckbox && (
        selected
          ? <CheckSquare className="size-5 shrink-0 stroke-[2.5] md:size-6" />
          : <Square className="size-5 shrink-0 stroke-[2.5] opacity-50 md:size-6" />
      )}
      {correct !== undefined && (
        <CorrectIcon className="size-4 stroke-6 md:size-6" />
      )}
    </button>
  )
}

export default AnswerButton
