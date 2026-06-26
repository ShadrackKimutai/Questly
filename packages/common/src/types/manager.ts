import type { GameResultMeta, QuizzMeta } from "@questly/common/types/game"

export interface ManagerConfig {
  quizz: QuizzMeta[]
  results: GameResultMeta[]
}
