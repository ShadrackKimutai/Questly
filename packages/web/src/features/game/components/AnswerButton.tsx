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
        "relative flex items-center gap-3 rounded-2xl px-4 py-6 text-left transition-all",
        selected && "ring-4 ring-white ring-inset",
        className,
      )}
      {...otherProps}
    >
      <span className="flex size-5 shrink-0 items-center justify-center rounded bg-black/20 text-sm font-bold sm:size-7 sm:rounded-md md:size-8 md:text-base">
        {label}
      </span>
      <p className="w-full flex-1 text-sm break-all drop-shadow-md md:text-lg">
        {children}
      </p>
      {showRadio && (
        selected
          ? <CircleDot className="size-5 shrink-0 stroke-[2.5] md:size-6" />
          : <Circle className="size-5 shrink-0 stroke-[2.5] opacity-60 md:size-6" />
      )}
      {showCheckbox && (
        selected
          ? <CheckSquare className="size-5 shrink-0 stroke-[2.5] md:size-6" />
          : <Square className="size-5 shrink-0 stroke-[2.5] opacity-60 md:size-6" />
      )}
      {correct !== undefined && (
        <CorrectIcon className="size-4 stroke-6 md:size-6" />
      )}
    </button>
  )
}

export default AnswerButton
