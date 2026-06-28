import type { Server } from "@questly/common/types/game/socket"
import { gameSocketHandlers } from "@questly/socket/handlers/game"
import { managerSocketHandlers } from "@questly/socket/handlers/manager"
import { quizSocketHandlers } from "@questly/socket/handlers/quiz"
import { resultsSocketHandlers } from "@questly/socket/handlers/results"
import type { SocketHandler } from "@questly/socket/handlers/types"
import { initConfig } from "@questly/socket/services/config"
import Registry from "@questly/socket/services/registry"
import { Server as ServerIO } from "socket.io"

const WS_PORT = 3001

const io: Server = new ServerIO({
  path: "/ws",
})
initConfig()

console.log(`Socket server running on port ${WS_PORT}`)
io.listen(WS_PORT)

const socketHandlers: SocketHandler[] = [
  managerSocketHandlers,
  quizSocketHandlers,
  gameSocketHandlers,
  resultsSocketHandlers,
]

io.on("connection", (socket) => {
  console.log(
    `A user connected: socketId: ${socket.id}, clientId: ${socket.handshake.auth.clientId}`,
  )

  socketHandlers.forEach((handler) => {
    handler({ io, socket })
  })
})

process.on("SIGINT", () => {
  Registry.getInstance().cleanup()
  process.exit(0)
})

process.on("SIGTERM", () => {
  Registry.getInstance().cleanup()
  process.exit(0)
})
