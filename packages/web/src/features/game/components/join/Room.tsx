import { EVENTS } from "@questly/common/constants"
import Button from "@questly/web/components/Button"
import Card from "@questly/web/components/Card"
import PinInput from "@questly/web/components/PinInput"
import {
  useEvent,
  useSocket,
} from "@questly/web/features/game/contexts/socket-context"
import { usePlayerStore } from "@questly/web/features/game/stores/player"
import { Link, useSearch } from "@tanstack/react-router"
import { PenLine } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

const Room = () => {
  const { socket, isConnected } = useSocket()
  const { join } = usePlayerStore()
  const [invitation, setInvitation] = useState("")
  const { pin } = useSearch({ from: "/(auth)/" })
  const hasJoinedRef = useRef(false)
  const { t } = useTranslation()

  const handleJoin = () => {
    socket.emit(EVENTS.PLAYER.JOIN, invitation.replace(/\s/gu, ""))
  }

  useEvent(EVENTS.GAME.SUCCESS_ROOM, (gameId) => {
    join(gameId)
  })

  useEffect(() => {
    if (!isConnected || !pin || hasJoinedRef.current) {
      return
    }

    socket.emit("player:join", pin)
    hasJoinedRef.current = true
  }, [pin, isConnected, socket])

  return (
    <div className="z-10 flex flex-col items-center gap-4">
      <Card>
        <p className="mb-2 text-lg font-semibold">{t("game:pinLabel")}</p>
        <PinInput value={invitation} onChange={setInvitation} />
        <Button className="mt-4" onClick={handleJoin}>
          {t("common:submit")}
        </Button>
      </Card>

      <Link
        to="/manager"
        className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
      >
        <PenLine className="size-4" />
        {t("common:makeQuiz")}
      </Link>
    </div>
  )
}

export default Room
