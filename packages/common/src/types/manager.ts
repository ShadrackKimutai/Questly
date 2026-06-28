import type { GameResultMeta, QuizMeta } from "@questly/common/types/game"

export interface ManagerConfig {
  quiz: QuizMeta[]
  results: GameResultMeta[]
}
