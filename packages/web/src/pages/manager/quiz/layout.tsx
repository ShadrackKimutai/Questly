import { EVENTS } from "@questly/common/constants"
import Loader from "@questly/web/components/Loader"
import {
  useEvent,
  useSocket,
} from "@questly/web/features/game/contexts/socket-context"
import { useManagerStore } from "@questly/web/features/game/stores/manager"
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

export const Route = createFileRoute("/manager/quiz")({
  component: RouteComponent,
})

function RouteComponent() {
  const { socket, isConnected } = useSocket()
  const { config, setConfig } = useManagerStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isConnected && !config) {
      socket.emit(EVENTS.MANAGER.GET_CONFIG)
    }
  }, [isConnected, config, socket])

  useEvent(EVENTS.MANAGER.CONFIG, (data) => {
    setConfig(data)
  })

  useEvent(EVENTS.MANAGER.UNAUTHORIZED, () => {
    navigate({ to: "/manager" })
  })

  if (!isConnected || !config) {
    return (
      <div className="flex h-svh items-center justify-center bg-gray-50">
        <Loader className="text-background max-h-23" />
      </div>
    )
  }

  return <Outlet />
}
