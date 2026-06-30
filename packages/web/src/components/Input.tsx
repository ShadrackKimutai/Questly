import clsx from "clsx"
import React from "react"

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  variant?: "sm" | "md"
}

const Input = ({
  className,
  type = "text",
  variant = "md",
  ...otherProps
}: Props) => (
  <input
    type={type}
    className={clsx(
      "rounded-xl border-2 border-gray-200 bg-gray-50 font-semibold text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:bg-white focus:shadow-sm focus:shadow-primary/20",
      variant === "md" && "p-3 text-lg",
      variant === "sm" && "px-3 py-2 text-sm",
      className,
    )}
    {...otherProps}
  />
)

export default Input
