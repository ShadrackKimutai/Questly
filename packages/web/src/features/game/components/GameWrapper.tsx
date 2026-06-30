import { EVENTS } from "@questly/common/constants"
import type { Status } from "@questly/common/types/game/status"
import background from "@questly/web/assets/background.png"
import Button from "@questly/web/components/Button"
import Loader from "@questly/web/components/Loader"
import {
  useEvent,
  useSocket,
} from "@questly/web/features/game/contexts/socket-context"
import { usePlayerStore } from "@questly/web/features/game/stores/player"
import { useQuestionStore } from "@questly/web/features/game/stores/question"
import { MANAGER_SKIP_BTN } from "@questly/web/features/game/utils/constants"
import clsx from "clsx"
import { type PropsWithChildren, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

type Props = PropsWithChildren & {
  statusName: Status | undefined
  onNext?: () => void
  onBack?: () => void
  manager?: boolean
}

const GameWrapper = ({
  children,
  statusName,
  onNext,
  onBack,
  manager,
}: Props) => {
  const { isConnected } = useSocket()
  const { player } = usePlayerStore()
  const { questionStates, setQuestionStates } = useQuestionStore()
  const { t } = useTranslation()
  const [isDisabled, setIsDisabled] = useState(false)
  const next = statusName ? MANAGER_SKIP_BTN[statusName] : null

  useEvent(EVENTS.GAME.UPDATE_QUESTION, ({ current, total }) => {
    setQuestionStates({
      current,
      total,
    })
  })

  useEvent(EVENTS.GAME.ERROR_MESSAGE, (message) => {
    toast.error(t(message))
    console.log(t(message))
    setIsDisabled(false)
  })

  useEffect(() => {
    setIsDisabled(false)
  }, [statusName])

  const handleNext = () => {
    setIsDisabled(true)
    onNext?.()
  }

  return (
    <section className="relative flex min-h-dvh">
      <div className="fixed top-0 left-0 h-full w-full">
        <img
          className="pointer-events-none h-full w-full object-cover select-none"
          src={background}
          alt="background"
        />
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="z-10 flex w-full flex-1 flex-col justify-between overflow-hidden">
        {!isConnected && !statusName ? (
          <div className="flex h-full w-full flex-1 flex-col items-center justify-center">
            <Loader className="h-30" />
            <h1 className="mt-4 text-4xl font-bold text-white drop-shadow-lg">
              {t("common:connecting")}
            </h1>
          </div>
        ) : (
          <>
            <div className="flex w-full items-center justify-between p-4">
              {questionStates && (
                <div className="gradient-purple flex items-center gap-1.5 rounded-xl px-4 py-2 text-base font-bold text-white shadow-lg shadow-purple-900/40">
                  <span className="opacity-70">{questionStates.current}</span>
                  <span className="opacity-40">/</span>
                  <span>{questionStates.total}</span>
                </div>
              )}

              {manager && next && (
                <Button
                  className={clsx(
                    "bg-white/15 border border-white/30 px-5 text-white backdrop-blur-sm hover:bg-white/25 shadow-none",
                    {
                      "pointer-events-none opacity-60": isDisabled,
                    },
                  )}
                  onClick={handleNext}
                >
                  {t(next)}
                </Button>
              )}

              {manager && onBack && (
                <Button
                  onClick={onBack}
                  className="bg-white/15 border border-white/30 px-5 text-white backdrop-blur-sm hover:bg-white/25 shadow-none"
                >
                  {t("common:exit")}
                </Button>
              )}
            </div>

            {children}

            {!manager && (
              <div className="z-50 flex items-center justify-between border-t border-white/10 bg-black/40 px-4 py-2 backdrop-blur-sm">
                <span className="text-4xl leading-none drop-shadow-md">{player?.mascot}</span>
                <div className="gradient-primary rounded-xl px-4 py-1.5 text-lg font-bold text-white shadow-md shadow-orange-900/40">
                  {player?.points}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default GameWrapper
