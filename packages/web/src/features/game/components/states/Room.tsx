import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { EVENTS } from "@questly/common/constants"
import type { Player } from "@questly/common/types/game"
import type { ManagerStatusDataMap } from "@questly/common/types/game/status"
import {
  useEvent,
  useSocket,
} from "@questly/web/features/game/contexts/socket-context"
import { useManagerStore } from "@questly/web/features/game/stores/manager"
import { useOnClickOutside } from "@questly/web/hooks/useOnClickOutside"
import { Lock, LockOpen, Maximize2, X } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"

interface Props {
  data: ManagerStatusDataMap["SHOW_ROOM"]
}

const Room = ({ data: { text, inviteCode } }: Props) => {
  const { gameId } = useManagerStore()
  const { socket } = useSocket()
  const webUrl = window.location.origin
  const { players } = useManagerStore()
  const [playerList, setPlayerList] = useState<Player[]>(players)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [qrOpen, setQrOpen] = useState(false)
  const [locked, setLocked] = useState(false)
  const qrContentRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  useOnClickOutside({ ref: qrContentRef, handler: () => setQrOpen(false) })

  useEvent(EVENTS.MANAGER.NEW_PLAYER, (player) => {
    setPlayerList([...playerList, player])
  })

  useEvent(EVENTS.MANAGER.REMOVE_PLAYER, (playerId) => {
    setPlayerList(playerList.filter((p) => p.id !== playerId))
  })

  useEvent(EVENTS.MANAGER.PLAYER_KICKED, (playerId) => {
    setPlayerList(playerList.filter((p) => p.id !== playerId))
  })

  useEvent(EVENTS.MANAGER.PLAYER_UPDATED, (updated) => {
    setPlayerList(playerList.map((p) => (p.id === updated.id ? updated : p)))
  })

  useEvent(EVENTS.GAME.TOTAL_PLAYERS, (total) => {
    setTotalPlayers(total)
  })

  const handleKick = (playerId: string) => () => {
    if (!gameId) {
      return
    }

    socket.emit(EVENTS.MANAGER.KICK_PLAYER, {
      gameId,
      playerId,
    })
  }

  const handleCloseQrCode = () => setQrOpen(false)

  const handleToggleLock = () => {
    if (!gameId) return
    const next = !locked
    socket.emit(EVENTS.MANAGER.SET_MAX_PLAYERS, {
      gameId,
      maxPlayers: next ? totalPlayers : null,
    })
    setLocked(next)
  }

  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-2">
      <div className="mb-10 flex flex-col-reverse items-center gap-3 md:flex-row md:items-stretch">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex flex-col items-center justify-center rounded-xl bg-white px-6 py-4 md:flex-row">
            <div>
              <p className="text-2xl font-bold">{t("game:joinInstruction")}</p>
              <p className="max-w-64 text-lg font-extrabold break-all">
                {webUrl}
              </p>
            </div>

            <div className="my-4 h-0.5 w-full bg-gray-300 md:mx-4 md:h-full md:w-0.5" />

            <div>
              <p className="text-2xl font-bold">{t("game:gamePinLabel")}</p>
              <p className="text-6xl font-extrabold">{inviteCode}</p>
            </div>
          </div>
        </div>

        <AlertDialog.Root open={qrOpen} onOpenChange={setQrOpen}>
          <AlertDialog.Trigger asChild>
            <div className="group relative flex h-40 shrink-0 cursor-pointer rounded-xl bg-white p-2">
              <QRCodeSVG
                className="h-auto w-auto"
                value={`${webUrl}?pin=${inviteCode}`}
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-xl opacity-0 transition-opacity group-hover:opacity-100">
                <div className="rounded-md bg-black/80 p-2">
                  <Maximize2 className="size-6 text-white" />
                </div>
              </div>
            </div>
          </AlertDialog.Trigger>

          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
            <AlertDialog.Content
              ref={qrContentRef}
              className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6"
            >
              <button
                type="button"
                title="Close"
                onClick={handleCloseQrCode}
                className="absolute -top-3 -right-3 rounded-full bg-white p-1.5 shadow-md hover:bg-gray-100"
              >
                <X className="size-6 text-gray-700" />
              </button>
              <QRCodeSVG
                className="size-56 md:size-70 lg:size-95"
                value={`${webUrl}?pin=${inviteCode}`}
              />
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>

      <h2 className="mb-4 text-4xl font-bold text-white drop-shadow-lg">
        {t(text)}
      </h2>

      <div className="mb-6 flex items-center justify-center gap-3">
        <div className="flex items-center justify-center rounded-lg bg-black/40 px-6 py-3">
          <span className="text-2xl font-bold text-white drop-shadow-md">
            {t("game:playersJoined")}
            {totalPlayers}
          </span>
        </div>
        <button
          type="button"
          title={locked ? t("game:unlockRoom") : t("game:lockRoom")}
          onClick={handleToggleLock}
          className={`flex items-center justify-center rounded-lg p-3 transition-colors ${
            locked
              ? "bg-red-500/80 hover:bg-red-500"
              : "bg-black/40 hover:bg-black/50"
          }`}
        >
          {locked ? (
            <Lock className="size-6 text-white" />
          ) : (
            <LockOpen className="size-6 text-white/80" />
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {playerList.map((player) => (
          <div
            key={player.id}
            className="bg-primary flex items-center gap-2 rounded-xl px-4 py-3 font-bold text-white"
            onClick={handleKick(player.id)}
          >
            <span className="text-3xl leading-none">{player.mascot}</span>
            <span className="cursor-pointer text-2xl drop-shadow-sm hover:line-through hover:decoration-3">
              {player.username}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Room
