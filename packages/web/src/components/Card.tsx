import clsx from "clsx"
import { type PropsWithChildren } from "react"
import { twMerge } from "tailwind-merge"

type Props = {
  className?: string
} & PropsWithChildren

const Card = ({ children, className }: Props) => (
  <div
    className={twMerge(
      clsx(
        "z-10 flex w-full max-w-80 flex-col rounded-2xl border border-white/20 bg-white/95 p-5 shadow-2xl shadow-black/30 backdrop-blur-md",
        className,
      ),
    )}
  >
    {children}
  </div>
)

export default Card
