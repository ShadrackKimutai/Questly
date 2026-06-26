import type {
  GameResult,
  PlayerAnswerRecord,
  QuestionResult,
} from "@questly/common/types/game"
import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react"

interface ResultModalContextType {
  result: GameResult
  questionResult: QuestionResult
  questionIndex: number
  total: number
  totalPlayers: number
  answeredCount: number
  correctCount: number
  correctPct: number
  maxAnswerCount: number
  getAnswerCount: (_answerIndex: number) => number
  isAnswerCorrect: (_answer: PlayerAnswerRecord["answerId"]) => boolean
  getPlayerPoints: (_name: string) => number
  goNext: () => void
  goPrev: () => void
  onClose: () => void
}

const ResultModalContext = createContext<ResultModalContextType | null>(null)

const sorted = (values: number[]) => [...values].sort((a, b) => a - b)

const isSameAnswerSet = (left: number[], right: number[]) =>
  JSON.stringify(sorted(left)) === JSON.stringify(sorted(right))

type Props = PropsWithChildren<{
  result: GameResult
  onClose: () => void
}>

export const ResultModalProvider = ({ children, result, onClose }: Props) => {
  const [questionIndex, setQuestionIndex] = useState(0)

  const questionResult = result.questions[questionIndex]
  const total = result.questions.length
  const totalPlayers = result.players.length

  const answeredCount = questionResult.playerAnswers.filter(
    (pa) => pa.answerId !== null,
  ).length

  const isAnswerCorrect = (answer: PlayerAnswerRecord["answerId"]) => {
    if (answer === null) {
      return false
    }

    if (typeof answer === "string") {
      return (
        questionResult.textSolutions?.some(
          (solution) =>
            solution.toLowerCase().trim() === answer.toLowerCase().trim(),
        ) ?? false
      )
    }

    if (Array.isArray(answer)) {
      return isSameAnswerSet(answer, questionResult.solutions)
    }

    return questionResult.solutions.includes(answer)
  }

  const correctCount = questionResult.playerAnswers.filter((pa) =>
    isAnswerCorrect(pa.answerId),
  ).length

  const correctPct =
    totalPlayers > 0 ? Math.round((correctCount / totalPlayers) * 100) : 0

  const getAnswerCount = (answerIndex: number) =>
    questionResult.playerAnswers.filter(({ answerId }) => {
      if (Array.isArray(answerId)) {
        return answerId.includes(answerIndex)
      }

      return answerId === answerIndex
    }).length

  const maxAnswerCount = Math.max(
    1,
    ...questionResult.answers.map((_, ai) => getAnswerCount(ai)),
  )

  const getPlayerPoints = (name: string) =>
    result.players.find((p) => p.username === name)?.points ?? 0

  const goNext = () => setQuestionIndex((i) => Math.min(i + 1, total - 1))

  const goPrev = () => setQuestionIndex((i) => Math.max(i - 1, 0))

  return (
    <ResultModalContext.Provider
      value={{
        result,
        questionResult,
        questionIndex,
        total,
        totalPlayers,
        answeredCount,
        correctCount,
        correctPct,
        maxAnswerCount,
        getAnswerCount,
        isAnswerCorrect,
        getPlayerPoints,
        goNext,
        goPrev,
        onClose,
      }}
    >
      {children}
    </ResultModalContext.Provider>
  )
}

export const useResultModal = () => {
  const ctx = useContext(ResultModalContext)

  if (!ctx) {
    throw new Error("useResultModal must be used inside ResultModalProvider")
  }

  return ctx
}
