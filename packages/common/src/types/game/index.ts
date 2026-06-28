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

export type QuestionType = 'single' | 'multiple' | 'truefalse' | 'shortanswer' | 'wordcloud'

export interface Question {
  question: string
  media?: QuestionMedia
  answers: string[]
  solutions: number[]
  textSolutions?: string[]
  cooldown: number
  time: number
  type?: QuestionType
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
}

export type QuestionResult = Question & {
  playerAnswers: PlayerAnswerRecord[]
}

export interface GameResultPlayer {
  username: string
  points: number
  rank: number
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
