import { EVENTS } from "@questly/common/constants"
import Button from "@questly/web/components/Button"
import Card from "@questly/web/components/Card"
import PinInput from "@questly/web/components/PinInput"
import {
  useEvent,
  useSocket,
} from "@questly/web/features/game/contexts/socket-context"
import { usePlayerStore } from "@questly/web/features/game/stores/player"
import { useSearch } from "@tanstack/react-router"
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
    <Card>
      <p className="mb-2 text-lg font-semibold">{t("game:pinLabel")}</p>
      <PinInput value={invitation} onChange={setInvitation} />
      <Button className="mt-4" onClick={handleJoin}>
        {t("common:submit")}
      </Button>
    </Card>
  )
}

export default Room
