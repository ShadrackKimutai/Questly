import { EVENTS } from "@questly/common/constants"
import type { GameResult } from "@questly/common/types/game"
import { STATUS } from "@questly/common/types/game/status"
import GameWrapper from "@questly/web/features/game/components/GameWrapper"
import {
  socketClient,
  useEvent,
  useSocket,
} from "@questly/web/features/game/contexts/socket-context"
import { useManagerStore } from "@questly/web/features/game/stores/manager"
import { useQuestionStore } from "@questly/web/features/game/stores/question"
import {
  GAME_STATE_COMPONENTS_MANAGER,
  MANAGER_SKIP_EVENTS,
  isKeyOf,
} from "@questly/web/features/game/utils/constants"
import ResultModal from "@questly/web/features/manager/components/ResultModal"
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router"
import { useCallback, useState } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

const ManagerGamePage = () => {
  const navigate = useNavigate()
  const { gameId: gameIdParam } = useParams({ from: "/party/manager/$gameId" })
  const { socket } = useSocket()
  const { gameId, status, setGameId, setStatus, setPlayers, reset } =
    useManagerStore()
  const { setQuestionStates } = useQuestionStore()
  const { t } = useTranslation()
  const [gameResult, setGameResult] = useState<GameResult | null>(null)

  useEvent(EVENTS.GAME.STATUS, ({ name, data }) => {
    if (name in GAME_STATE_COMPONENTS_MANAGER) {
      setStatus(name, data)

      if (name === STATUS.FINISHED && "resultId" in data && data.resultId) {
        socket.emit(EVENTS.RESULTS.GET, data.resultId)
      }
    }
  })

  useEvent(
    EVENTS.RESULTS.DATA,
    useCallback((data: GameResult) => {
      setGameResult(data)
    }, []),
  )

  useEvent("connect", () => {
    if (gameIdParam) {
      socket.emit(EVENTS.MANAGER.RECONNECT, { gameId: gameIdParam })
    }
  })

  useEvent(
    EVENTS.MANAGER.SUCCESS_RECONNECT,
    ({
      gameId: reconnectGameId,
      status: reconnectStatus,
      players,
      currentQuestion,
    }) => {
      setGameId(reconnectGameId)
      setStatus(reconnectStatus.name, reconnectStatus.data)
      setPlayers(players)
      setQuestionStates(currentQuestion)
    },
  )

  useEvent(EVENTS.GAME.RESET, (message) => {
    navigate({ to: "/manager/config" })
    reset()
    setQuestionStates(null)
    toast.error(t(message))
  })

  const handleCloseResults = () => {
    setGameResult(null)
    navigate({ to: "/manager/config" })
    reset()
    setQuestionStates(null)
  }

  const handleSkip = () => {
    if (!status) {
      return
    }

    if (status.name === STATUS.FINISHED) {
      if (gameResult) {
        handleCloseResults()
      } else {
        navigate({ to: "/manager/config" })
        reset()
        setQuestionStates(null)
      }

      return
    }

    if (!gameId) {
      return
    }

    if (isKeyOf(MANAGER_SKIP_EVENTS, status.name)) {
      socket.emit(MANAGER_SKIP_EVENTS[status.name], { gameId })
    }
  }

  const handleBack = () => {
    navigate({ to: "/manager/config" })
    reset()
    setQuestionStates(null)
  }

  const CurrentComponent =
    status && isKeyOf(GAME_STATE_COMPONENTS_MANAGER, status.name)
      ? GAME_STATE_COMPONENTS_MANAGER[status.name]
      : null

  if (!status) {
    return null
  }

  return (
    <>
      <GameWrapper
        statusName={status.name}
        onNext={handleSkip}
        onBack={status.name === STATUS.SHOW_ROOM ? handleBack : undefined}
        manager
      >
        {CurrentComponent && <CurrentComponent data={status.data as never} />}
      </GameWrapper>

      {gameResult && (
        <ResultModal result={gameResult} onClose={handleCloseResults} />
      )}
    </>
  )
}

export const Route = createFileRoute("/party/manager/$gameId")({
  component: ManagerGamePage,
  onLeave: ({ params: { gameId } }) => {
    socketClient.emit(EVENTS.MANAGER.LEAVE, { gameId })
  },
})
