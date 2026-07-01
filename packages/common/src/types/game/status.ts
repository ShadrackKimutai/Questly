import type { Player, QuestionMedia, QuestionType } from "@questly/common/types/game"

export type AnswerFeedback =
  | { type: "shortanswer"; playerText: string | null; correctOptions: string[] }
  | { type: "choice"; items: { text: string; selectedByPlayer: boolean; isCorrect: boolean }[] }
  | { type: "wordcloud"; playerText: string | null }
  | {
      type: "calculated"
      playerAnswer: number | null
      correctAnswer: number
      playerVariables: Record<string, number>
      resultTier: "full" | "partial" | "wrong"
    }
  | { type: "dotmocracy"; votes: number[]; options: string[] }
  | { type: "grid2x2"; items: { label: string; x: number | null; y: number | null }[] }

export const STATUS = {
  SHOW_ROOM: "SHOW_ROOM",
  SHOW_START: "SHOW_START",
  SHOW_PREPARED: "SHOW_PREPARED",
  SHOW_QUESTION: "SHOW_QUESTION",
  SELECT_ANSWER: "SELECT_ANSWER",
  SHOW_RESULT: "SHOW_RESULT",
  SHOW_RESPONSES: "SHOW_RESPONSES",
  SHOW_LEADERBOARD: "SHOW_LEADERBOARD",
  FINISHED: "FINISHED",
  WAIT: "WAIT",
} as const

export type Status = (typeof STATUS)[keyof typeof STATUS]

export interface CommonStatusDataMap {
  SHOW_START: { time: number; subject: string }
  SHOW_PREPARED: { totalAnswers: number; questionNumber: number; type?: QuestionType }
  SHOW_QUESTION: {
    question: string
    media?: QuestionMedia
    cooldown: number
  }
  SELECT_ANSWER: {
    question: string
    answers: string[]
    media?: QuestionMedia
    time: number
    totalPlayer: number
    type?: QuestionType
    playerVariables?: Record<string, number>
    dotType?: 'single' | 'multiple'
    gridXLabel?: string
    gridYLabel?: string
  }
  SHOW_RESULT: {
    correct: boolean
    partial?: boolean
    message: string
    points: number
    myPoints: number
    rank: number
    aheadOfMe: string | null
    answerFeedback: AnswerFeedback
  }
  WAIT: { text: string }
  FINISHED: { subject: string; top: Player[]; rank?: number; resultId?: string }
}

interface ManagerExtraStatus {
  SHOW_ROOM: { text: string; inviteCode?: string }
  SHOW_RESPONSES: {
    question: string
    responses: Record<number, number>
    solutions: number[]
    answers: string[]
    media?: QuestionMedia
    type?: QuestionType
    wordResponses?: Record<string, number>
    calculatedSummary?: { full: number; partial: number; wrong: number }
    dotVotes?: Record<number, number>
    gridPlacements?: { itemIndex: number; x: number; y: number }[]
    gridXLabel?: string
    gridYLabel?: string
  }
  SHOW_LEADERBOARD: { oldLeaderboard: Player[]; leaderboard: Player[] }
}

export type PlayerStatusDataMap = CommonStatusDataMap

export type ManagerStatusDataMap = CommonStatusDataMap & ManagerExtraStatus

export type StatusDataMap = PlayerStatusDataMap & ManagerStatusDataMap
