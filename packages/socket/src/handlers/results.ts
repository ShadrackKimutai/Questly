import { EVENTS } from "@questly/common/constants"
import type { SocketContext } from "@questly/socket/handlers/types"
import { deleteResult, getResultById } from "@questly/socket/services/config"
import manager, { emitConfig } from "@questly/socket/services/manager"

export const resultsSocketHandlers = ({ socket }: SocketContext) => {
  socket.on(
    EVENTS.RESULTS.GET,
    manager.withAuth(socket, (id) => {
      try {
        socket.emit(EVENTS.RESULTS.DATA, getResultById(id))
      } catch (error) {
        console.error("Failed to get result:", error)
      }
    }),
  )

  socket.on(
    EVENTS.RESULTS.DELETE,
    manager.withAuth(socket, (id) => {
      try {
        deleteResult(id)
        emitConfig(socket)
      } catch (error) {
        console.error("Failed to delete result:", error)
      }
    }),
  )
}
