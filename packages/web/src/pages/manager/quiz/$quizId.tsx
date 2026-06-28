import { EVENTS } from "@questly/common/constants"
import type { QuizWithId } from "@questly/common/types/game"
import Loader from "@questly/web/components/Loader"
import {
  useEvent,
  useSocket,
} from "@questly/web/features/game/contexts/socket-context"
import QuestionEditor from "@questly/web/features/quiz/components/QuestionEditor"
import QuizEditorHeader from "@questly/web/features/quiz/components/QuizEditorHeader"
import QuizEditorSidebar from "@questly/web/features/quiz/components/QuizEditorSidebar"
import { QuizEditorProvider } from "@questly/web/features/quiz/contexts/quiz-editor-context"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"

const QuizEditPage = () => {
  const { quizId } = Route.useParams()
  const { socket } = useSocket()
  const [quiz, setQuiz] = useState<QuizWithId | null>(null)

  useEffect(() => {
    socket.emit(EVENTS.QUIZ.GET, quizId)
  }, [socket, quizId])

  useEvent(EVENTS.QUIZ.DATA, (data) => {
    if (data.id === quizId) {
      setQuiz(data)
    }
  })

  if (!quiz) {
    return (
      <div className="flex h-svh items-center justify-center bg-gray-50">
        <Loader className="text-background max-h-23" />
      </div>
    )
  }

  return (
    <QuizEditorProvider initialData={quiz}>
      <div className="relative flex h-svh flex-col bg-gray-50">
        <QuizEditorHeader />
        <div className="flex flex-1 overflow-hidden">
          <QuizEditorSidebar />
          <QuestionEditor />
        </div>
      </div>
    </QuizEditorProvider>
  )
}

export const Route = createFileRoute("/manager/quiz/$quizId")({
  component: QuizEditPage,
})
