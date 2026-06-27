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
import { useTranslation } from "react-i18next"

interface Props {
  data: PlayerStatusDataMap["WAIT"]
}

const Wait = ({ data: { text } }: Props) => {
  const { t } = useTranslation()
  const { socket } = useSocket()
  const { gameId, player, setPlayer } = usePlayerStore()
  const isPreGame = text === "game:waitingForPlayers"

  const handlePickMascot = (mascot: string) => {
    if (!gameId || !player) return
    socket.emit(EVENTS.PLAYER.CHANGE_MASCOT, { gameId, data: { mascot } })
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
    <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-2">
        <span className="text-8xl leading-none drop-shadow-lg">{player?.mascot}</span>
        <p className="text-lg font-bold text-white drop-shadow-md">
          {t("game:waitingForPlayers")}
        </p>
        <p className="text-sm text-white/70">{t("game:pickYourMascot")}</p>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {MASCOTS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => handlePickMascot(m)}
            className={clsx(
              "flex items-center justify-center rounded-xl p-2 text-3xl transition-all md:text-4xl",
              player?.mascot === m
                ? "bg-white/30 ring-2 ring-white scale-110"
                : "bg-black/20 hover:bg-white/20 hover:scale-105",
            )}
          >
            {m}
          </button>
        ))}
      </div>
    </section>
  )
}

export default Wait
