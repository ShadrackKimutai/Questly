import type { Question, QuestionType, QuizWithId } from "@questly/common/types/game"
import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react"
import { v7 as uuid } from "uuid"

export type QuestionWithId = Question & {
  id: string
}

interface QuizEditorContextType {
  quizId: string | null
  subject: string
  setSubject: (_subject: string) => void
  questions: QuestionWithId[]
  currentIndex: number
  currentQuestion: QuestionWithId
  setCurrentIndex: (_index: number) => void
  addQuestion: () => void
  removeQuestion: (_index: number) => void
  reorderQuestions: (_from: number, _to: number) => void
  updateQuestion: (_index: number, _updates: Partial<QuestionWithId>) => void
}

const QuizEditorContext = createContext<QuizEditorContextType | null>(null)

const defaultQuestion = (): QuestionWithId => ({
  id: uuid(),
  question: "",
  answers: ["", ""],
  solutions: [0],
  cooldown: 5,
  time: 20,
  type: "single",
})

const inferType = (q: Question): QuestionType => {
  if (q.type) return q.type
  if (q.formula) return "calculated"
  if (q.textSolutions && q.textSolutions.length > 0) return "shortanswer"
  if (q.solutions.length > 1) return "multiple"
  return "single"
}

const toQuestionWithId = (q: Question): QuestionWithId => ({
  type: inferType(q),
  ...q,
  id: uuid(),
})

type QuizEditorProviderProps = PropsWithChildren<{
  initialData?: QuizWithId
}>

export const QuizEditorProvider = ({
  children,
  initialData,
}: QuizEditorProviderProps) => {
  const [subject, setSubject] = useState(
    initialData?.subject ?? "Untitled Quiz",
  )
  const [questions, setQuestions] = useState<QuestionWithId[]>(
    initialData
      ? initialData.questions.map(toQuestionWithId)
      : [defaultQuestion()],
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentQuestion = questions[currentIndex]

  const addQuestion = () => {
    setQuestions((prev) => [...prev, defaultQuestion()])
    setCurrentIndex(questions.length)
  }

  const removeQuestion = (index: number) => {
    const next = questions.filter((_, i) => i !== index)
    setQuestions(next)
    setCurrentIndex((current) =>
      Math.min(
        Math.max(0, current >= index ? current - 1 : current),
        next.length - 1,
      ),
    )
  }

  const reorderQuestions = (from: number, to: number) => {
    setQuestions((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)

      return next
    })
    setCurrentIndex(to)
  }

  const updateQuestion = (index: number, updates: Partial<QuestionWithId>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...updates } : q)),
    )
  }

  return (
    <QuizEditorContext.Provider
      value={{
        quizId: initialData?.id ?? null,
        subject,
        setSubject,
        questions,
        currentIndex,
        currentQuestion,
        setCurrentIndex,
        addQuestion,
        removeQuestion,
        reorderQuestions,
        updateQuestion,
      }}
    >
      {children}
    </QuizEditorContext.Provider>
  )
}

export const useQuizEditor = () => {
  const ctx = useContext(QuizEditorContext)

  if (!ctx) {
    throw new Error("useQuizEditor must be used inside QuizEditorProvider")
  }

  return ctx
}
