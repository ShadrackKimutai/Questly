import type { StatusDataMap } from "@questly/common/types/game/status"
import {
  createStatus,
  type Status,
} from "@questly/web/features/game/utils/createStatus"
import { create } from "zustand"

interface PlayerState {
  username?: string
  mascot?: string
  points?: number
}

export interface AnswerHistoryEntry {
  question: string
  correct: boolean
  points: number
  participated?: boolean
}

interface PlayerStore<T> {
  gameId: string | null
  player: PlayerState | null
  status: Status<T> | null
  pendingQuestion: string | null
  history: AnswerHistoryEntry[]

  setGameId: (_gameId: string | null) => void

  setPlayer: (_state: PlayerState) => void
  login: (_username: string, _mascot: string) => void
  join: (_username: string) => void
  updatePoints: (_points: number) => void

  setStatus: <K extends keyof T>(_name: K, _data: T[K]) => void

  setPendingQuestion: (_question: string) => void
  appendHistory: (_entry: AnswerHistoryEntry) => void

  reset: () => void
}

const initialState = {
  gameId: null,
  player: null,
  status: null,
  pendingQuestion: null,
  history: [],
}

export const usePlayerStore = create<PlayerStore<StatusDataMap>>((set) => ({
  ...initialState,

  setGameId: (gameId) => set({ gameId }),

  setPlayer: (player: PlayerState) => set({ player }),
  login: (username, mascot) =>
    set((state) => ({
      player: { ...state.player, username, mascot },
    })),

  join: (gameId) => {
    set((state) => ({
      gameId,
      player: { ...state.player, points: 0 },
    }))
  },

  updatePoints: (points) =>
    set((state) => ({
      player: { ...state.player, points },
    })),

  setStatus: (name, data) => set({ status: createStatus(name, data) }),

  setPendingQuestion: (question) => set({ pendingQuestion: question }),

  appendHistory: (entry) =>
    set((state) => ({ history: [...state.history, entry] })),

  reset: () => set(initialState),
}))
