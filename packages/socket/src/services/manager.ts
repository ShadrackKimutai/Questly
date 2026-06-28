import { EVENTS } from "@questly/common/constants"
import type { Socket } from "@questly/common/types/game/socket"
import type { SocketContext } from "@questly/socket/handlers/types"
import { getQuizMeta, getResultsMeta } from "@questly/socket/services/config"

const getClientId = (socket: SocketContext["socket"]) =>
  socket.handshake.auth.clientId as string

export const emitConfig = (socket: SocketContext["socket"]) =>
  socket.emit(EVENTS.MANAGER.CONFIG, {
    quiz: getQuizMeta(),
    results: getResultsMeta(),
  })

class Manager {
  private loggedClients = new Set()

  isLogged(socket: Socket) {
    return this.loggedClients.has(getClientId(socket))
  }

  login(socket: Socket) {
    this.loggedClients.add(getClientId(socket))
  }

  logout(socket: Socket) {
    this.loggedClients.delete(getClientId(socket))
  }

  withAuth<T extends unknown[]>(
    socket: Socket,
    handler: (..._args: T) => void,
  ) {
    return (..._args: T) => {
      if (!this.isLogged(socket)) {
        socket.emit(EVENTS.MANAGER.UNAUTHORIZED)

        return
      }

      handler(..._args)
    }
  }
}

export default new Manager()
