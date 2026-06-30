import type { ManagerStatusDataMap } from "@questly/common/types/game/status"
import Fire from "@questly/web/features/game/components/icons/Fire"
import { AnimatePresence, motion, useSpring, useTransform } from "motion/react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

interface Props {
  data: ManagerStatusDataMap["SHOW_LEADERBOARD"]
}

const AnimatedPoints = ({ from, to }: { from: number; to: number }) => {
  const spring = useSpring(from, { stiffness: 1000, damping: 30 })
  const display = useTransform(spring, (value) => Math.round(value))
  const [displayValue, setDisplayValue] = useState(from)

  useEffect(() => {
    spring.set(to)
    const unsubscribe = display.on("change", (latest) => {
      setDisplayValue(latest)
    })

    return unsubscribe
  }, [to, spring, display])

  return <span className="drop-shadow-md">{displayValue}</span>
}

const StreakBadge = ({ streak }: { streak: number }) => (
  <AnimatePresence>
    {streak >= 2 && (
      <motion.div
        key="streak"
        initial={{ opacity: 0, scale: 0.5, x: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.5, x: -10 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="ml-2 flex items-center gap-1 rounded-full bg-amber-500 p-1 shadow-sm shadow-amber-900/40"
      >
        <Fire className="size-7" />
      </motion.div>
    )}
  </AnimatePresence>
)

const rankStyle = (index: number) => {
  if (index === 0) return "bg-linear-to-r from-yellow-500 to-amber-400 shadow-lg shadow-yellow-900/40"
  if (index === 1) return "bg-linear-to-r from-slate-400 to-gray-300 shadow-lg shadow-slate-900/30 text-gray-800"
  if (index === 2) return "bg-linear-to-r from-amber-700 to-orange-600 shadow-lg shadow-amber-900/40"
  return "bg-white/15 backdrop-blur-sm border border-white/20"
}

const rankLabel = (index: number) => {
  if (index === 0) return "🥇"
  if (index === 1) return "🥈"
  if (index === 2) return "🥉"
  return `${index + 1}`
}

const Leaderboard = ({ data: { oldLeaderboard, leaderboard } }: Props) => {
  const [displayedLeaderboard, setDisplayedLeaderboard] =
    useState(oldLeaderboard)
  const [isAnimating, setIsAnimating] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    setDisplayedLeaderboard(oldLeaderboard)
    setIsAnimating(false)

    const timer = setTimeout(() => {
      setIsAnimating(true)
      setDisplayedLeaderboard(leaderboard)
    }, 1600)

    return () => {
      clearTimeout(timer)
    }
  }, [oldLeaderboard, leaderboard])

  return (
    <section className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-2">
      <h2 className="mb-6 bg-linear-to-r from-yellow-300 to-orange-400 bg-clip-text text-5xl font-bold text-transparent drop-shadow-md">
        {t("game:leaderboard")}
      </h2>
      <div className="flex w-full flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {displayedLeaderboard.map(({ id, username, mascot, points, streak }, index) => (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, y: 50 }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 50,
                transition: { duration: 0.2 },
              }}
              transition={{
                layout: {
                  type: "spring",
                  stiffness: 350,
                  damping: 25,
                },
              }}
              className={`flex w-full items-center justify-between rounded-2xl p-3 text-3xl font-bold text-white ${rankStyle(index)}`}
            >
              <span className="flex items-center gap-3 drop-shadow-md">
                <span className="flex size-10 items-center justify-center rounded-xl bg-black/15 text-lg font-extrabold">
                  {rankLabel(index)}
                </span>
                <span className="text-3xl leading-none">{mascot}</span>
                {username}
                <StreakBadge streak={streak} />
              </span>
              {isAnimating ? (
                <AnimatedPoints
                  from={oldLeaderboard.find((u) => u.id === id)?.points ?? 0}
                  to={leaderboard.find((u) => u.id === id)?.points ?? 0}
                />
              ) : (
                <span className="drop-shadow-md">{points}</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default Leaderboard
