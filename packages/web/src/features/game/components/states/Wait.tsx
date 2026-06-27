import * as Dialog from "@radix-ui/react-dialog"
import { EVENTS, MASCOTS } from "@questly/common/constants"
import type { PlayerStatusDataMap } from "@questly/common/types/game/status"
import Loader from "@questly/web/components/Loader"
import {
  useEvent,
  useSocket,
} from "@questly/web/features/game/contexts/socket-context"
import { usePlayerStore } from "@questly/web/features/game/stores/player"
import { saveMascot } from "@questly/web/features/game/utils/mascot"
import clsx from "clsx"
import { X } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

interface Props {
  data: PlayerStatusDataMap["WAIT"]
}

const Wait = ({ data: { text } }: Props) => {
  const { t } = useTranslation()
  const { socket } = useSocket()
  const { gameId, player, setPlayer } = usePlayerStore()
  const [open, setOpen] = useState(false)
  const isPreGame = text === "game:waitingForPlayers"

  const handlePickMascot = (mascot: string) => {
    if (!gameId || !player) return
    socket.emit(EVENTS.PLAYER.CHANGE_MASCOT, { gameId, data: { mascot } })
    setOpen(false)
  }

  useEvent(EVENTS.PLAYER.MASCOT_CHANGED, ({ mascot }) => {
    saveMascot(mascot)
    setPlayer({ ...player, mascot })
  })

  if (!isPreGame) {
    return (
      <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center">
        <Loader className="h-30" />
        <h2 className="mt-5 text-center text-3xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl">
          {t(text)}
        </h2>
      </section>
    )
  }

  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-4 px-4">
      <Loader className="h-24" />

      <h2 className="text-center text-3xl font-bold text-white drop-shadow-lg md:text-4xl">
        {t(text)}
      </h2>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="flex flex-col items-center gap-2 rounded-2xl bg-black/30 px-8 py-4 transition-colors hover:bg-black/40"
          >
            <span className="text-7xl leading-none">{player?.mascot}</span>
            <span className="text-base font-bold text-white drop-shadow">{player?.username}</span>
            <span className="text-xs font-semibold text-white/60">{t("game:tapToChangeMascot")}</span>
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Title className="text-lg font-bold text-gray-800">
                {t("game:chooseMascot")}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  title="Close"
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="size-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="mb-4 flex flex-col items-center gap-1">
              <span className="text-6xl leading-none">{player?.mascot}</span>
              <p className="text-sm font-semibold text-gray-500">{player?.username}</p>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {MASCOTS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handlePickMascot(m)}
                  className={clsx(
                    "flex items-center justify-center rounded-xl p-2 text-3xl transition-all",
                    player?.mascot === m
                      ? "bg-primary/10 ring-2 ring-primary scale-110"
                      : "hover:bg-gray-100 hover:scale-105",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  )
}

export default Wait
