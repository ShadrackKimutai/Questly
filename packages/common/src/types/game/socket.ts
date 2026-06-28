import { EVENTS } from "@questly/common/constants"
import type {
  GameResult,
  GameUpdateQuestion,
  Player,
  QuizWithId,
} from "@questly/common/types/game"
import type { Status, StatusDataMap } from "@questly/common/types/game/status"
import type { ManagerConfig } from "@questly/common/types/manager"
import { Server as ServerIO, Socket as SocketIO } from "socket.io"

export type Server = ServerIO<ClientToServerEvents, ServerToClientEvents>

export type Socket = SocketIO<ClientToServerEvents, ServerToClientEvents>

export interface Message<K extends keyof StatusDataMap = keyof StatusDataMap> {
  gameId?: string
  status: K
  data: StatusDataMap[K]
}

export interface MessageWithoutStatus<T = unknown> {
  gameId?: string
  data: T
}

export interface MessageGameId {
  gameId?: string
}

export interface ServerToClientEvents {
  connect: () => void

  // Game events
  [EVENTS.GAME.STATUS]: (_data: {
    name: Status
    data: StatusDataMap[Status]
  }) => void
  [EVENTS.GAME.SUCCESS_ROOM]: (_data: string) => void
  [EVENTS.GAME.SUCCESS_JOIN]: (_data: { gameId: string; mascot: string }) => void
  [EVENTS.GAME.TOTAL_PLAYERS]: (_count: number) => void
  [EVENTS.GAME.ERROR_MESSAGE]: (_message: string) => void
  [EVENTS.GAME.START_COOLDOWN]: () => void
  [EVENTS.GAME.COOLDOWN]: (_count: number) => void
  [EVENTS.GAME.RESET]: (_message: string) => void
  [EVENTS.GAME.UPDATE_QUESTION]: (_data: {
    current: number
    total: number
  }) => void
  [EVENTS.GAME.PLAYER_ANSWER]: (_count: number) => void

  // Player events
  [EVENTS.PLAYER.SUCCESS_RECONNECT]: (_data: {
    gameId: string
    status: { name: Status; data: StatusDataMap[Status] }
    player: { username: string; mascot: string; points: number }
    currentQuestion: GameUpdateQuestion
  }) => void
  [EVENTS.PLAYER.UPDATE_LEADERBOARD]: (_data: { leaderboard: Player[] }) => void

  // Manager events
  [EVENTS.MANAGER.SUCCESS_RECONNECT]: (_data: {
    gameId: string
    status: { name: Status; data: StatusDataMap[Status] }
    players: Player[]
    currentQuestion: GameUpdateQuestion
  }) => void
  [EVENTS.MANAGER.CONFIG]: (_config: ManagerConfig) => void
  [EVENTS.QUIZ.DATA]: (_quiz: QuizWithId) => void
  [EVENTS.MANAGER.GAME_CREATED]: (_data: {
    gameId: string
    inviteCode: string
  }) => void
  [EVENTS.MANAGER.STATUS_UPDATE]: (_data: {
    status: Status
    data: StatusDataMap[Status]
  }) => void
  [EVENTS.MANAGER.NEW_PLAYER]: (_player: Player) => void
  [EVENTS.MANAGER.REMOVE_PLAYER]: (_playerId: string) => void
  [EVENTS.MANAGER.ERROR_MESSAGE]: (_message: string) => void
  [EVENTS.MANAGER.PLAYER_KICKED]: (_playerId: string) => void
  [EVENTS.MANAGER.PLAYER_UPDATED]: (_player: Player) => void
  [EVENTS.PLAYER.MASCOT_CHANGED]: (_data: { mascot: string }) => void
  [EVENTS.MANAGER.UNAUTHORIZED]: () => void

  // Quiz events
  [EVENTS.QUIZ.SAVE_SUCCESS]: (_data: { id: string }) => void
  [EVENTS.QUIZ.UPDATE_SUCCESS]: (_data: { id: string }) => void
  [EVENTS.QUIZ.ERROR]: (_message: string) => void

  // Results events
  [EVENTS.RESULTS.DATA]: (_result: GameResult) => void
}

export interface ClientToServerEvents {
  // Manager actions
  [EVENTS.GAME.CREATE]: (_quizId: string) => void
  [EVENTS.MANAGER.AUTH]: (_password: string) => void
  [EVENTS.MANAGER.RECONNECT]: (_message: { gameId: string }) => void
  [EVENTS.MANAGER.LEAVE]: (_message: { gameId: string }) => void
  [EVENTS.MANAGER.KICK_PLAYER]: (_message: {
    gameId: string
    playerId: string
  }) => void
  [EVENTS.MANAGER.SET_MAX_PLAYERS]: (_message: { gameId: string; maxPlayers: number | null }) => void
  [EVENTS.MANAGER.START_GAME]: (_message: MessageGameId) => void
  [EVENTS.MANAGER.ABORT_QUIZ]: (_message: MessageGameId) => void
  [EVENTS.MANAGER.NEXT_QUESTION]: (_message: MessageGameId) => void
  [EVENTS.MANAGER.SHOW_LEADERBOARD]: (_message: MessageGameId) => void
  [EVENTS.MANAGER.GET_CONFIG]: () => void
  [EVENTS.MANAGER.LOGOUT]: () => void

  // Quiz actions
  [EVENTS.QUIZ.GET]: (_id: string) => void
  [EVENTS.QUIZ.SAVE]: (_quiz: unknown) => void
  [EVENTS.QUIZ.UPDATE]: (_data: QuizWithId) => void
  [EVENTS.QUIZ.DELETE]: (_id: string) => void

  // Player actions
  [EVENTS.PLAYER.JOIN]: (_inviteCode: string) => void
  [EVENTS.PLAYER.LOGIN]: (
    _message: MessageWithoutStatus<{ username: string; mascot: string }>,
  ) => void
  [EVENTS.PLAYER.RECONNECT]: (_message: { gameId: string }) => void
  [EVENTS.PLAYER.LEAVE]: (_message: { gameId: string }) => void
  [EVENTS.PLAYER.SELECTED_ANSWER]: (
    _message: MessageWithoutStatus<{ answerKey: number }>,
  ) => void
  [EVENTS.PLAYER.SELECTED_ANSWERS]: (
    _message: MessageWithoutStatus<{ answerKeys: number[] }>,
  ) => void
  [EVENTS.PLAYER.TEXT_ANSWER]: (
    _message: MessageWithoutStatus<{ answerText: string }>,
  ) => void
  [EVENTS.PLAYER.CHANGE_MASCOT]: (
    _message: MessageWithoutStatus<{ mascot: string }>,
  ) => void

  // Results actions
  [EVENTS.RESULTS.GET]: (_id: string) => void
  [EVENTS.RESULTS.DELETE]: (_id: string) => void

  // Common
  disconnect: () => void
}
