import type { MEDIA_TYPES } from "@questly/common/constants"

export interface Player {
  id: string
  clientId: string
  connected: boolean
  username: string
  mascot: string
  points: number
  streak: number
}

export interface Answer {
  playerId: string
  answerId: number | number[] | string
  points: number
}

export type QuestionMediaType =
  | (typeof MEDIA_TYPES)[keyof typeof MEDIA_TYPES]
  | undefined

export interface QuestionMedia {
  type?: QuestionMediaType
  url: string
}

export type QuestionType =
  | 'single'
  | 'multiple'
  | 'truefalse'
  | 'shortanswer'
  | 'wordcloud'
  | 'calculated'
  | 'dotmocracy'
  | 'estimate'

export interface CalculatedVariable {
  name: string
  min: number
  max: number
  decimals: number
}

export interface EstimateVariable {
  name: string
  value: number
}

export interface Question {
  question: string
  media?: QuestionMedia
  answers: string[]
  solutions: number[]
  textSolutions?: string[]
  cooldown: number
  time: number
  type?: QuestionType
  // calculated / estimate question fields (shared)
  formula?: string
  answerDecimals?: number
  // calculated-only fields
  calculatedVariables?: CalculatedVariable[]
  toleranceBase?: number
  tolerancePartial?: number
  // estimate-only fields — variables are fixed values (no randomized range)
  estimateVariables?: EstimateVariable[]
  estimateTolerancePercent?: number
  // dotmocracy fields
  dotType?: 'single' | 'multiple'
}

export interface Quiz {
  subject: string
  questions: Question[]
}

export type QuizWithId = Quiz & { id: string }

export interface QuizMeta {
  id: string
  subject: string
}

export interface GameUpdateQuestion {
  current: number
  total: number
}

export interface PlayerAnswerRecord {
  playerName: string
  answerId: number | number[] | string | null
  // estimate-only fields, populated at scoring time
  numericAnswer?: number
  offset?: number
  accuracyFraction?: number
}

export type QuestionResult = Question & {
  playerAnswers: PlayerAnswerRecord[]
  // estimate-only: the single correct answer rolled for this question, shared by all players
  estimateCorrectAnswer?: number
}

export interface GameResultPlayer {
  username: string
  points: number
  rank: number
  mascot: string
}

export interface GameResult {
  id: string
  subject: string
  date: string
  players: GameResultPlayer[]
  questions: QuestionResult[]
}

export interface GameResultMeta {
  id: string
  subject: string
  date: string
  playerCount: number
}
