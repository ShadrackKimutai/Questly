import { MASCOTS } from "@questly/common/constants"

const KEY = "questly_mascot"

export const getOrAssignMascot = (): string => {
  const stored = localStorage.getItem(KEY)
  if (stored && (MASCOTS as readonly string[]).includes(stored)) return stored
  const mascot = MASCOTS[Math.floor(Math.random() * MASCOTS.length)]
  localStorage.setItem(KEY, mascot)
  return mascot
}

export const saveMascot = (mascot: string): void => {
  localStorage.setItem(KEY, mascot)
}
