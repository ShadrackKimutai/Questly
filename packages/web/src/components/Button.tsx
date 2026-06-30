import clsx from "clsx"
import type { ButtonHTMLAttributes, PropsWithChildren } from "react"
import { twMerge } from "tailwind-merge"

type Size = "sm" | "md" | "lg"

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  PropsWithChildren & {
    size?: Size
    classNameContent?: string
  }

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-lg",
  lg: "px-6 py-3.5 text-xl",
}

const Button = ({
  children,
  className,
  classNameContent,
  size = "md",
  ...otherProps
}: Props) => (
  <button
    className={twMerge(
      clsx(
        "gradient-primary rounded-xl font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/50 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        sizeClasses[size],
        className,
      ),
    )}
    {...otherProps}
  >
    <div
      className={twMerge(
        clsx("flex items-center justify-center gap-2", classNameContent),
      )}
    >
      {children}
    </div>
  </button>
)

export default Button
