import QuestionEditor from "@questly/web/features/quiz/components/QuestionEditor"
import QuizEditorHeader from "@questly/web/features/quiz/components/QuizEditorHeader"
import QuizEditorSidebar from "@questly/web/features/quiz/components/QuizEditorSidebar"
import { QuizEditorProvider } from "@questly/web/features/quiz/contexts/quiz-editor-context"
import { createFileRoute } from "@tanstack/react-router"

const QuizEditorPage = () => (
  <QuizEditorProvider>
    <div className="relative flex h-svh flex-col bg-gray-50">
      <QuizEditorHeader />
      <div className="flex flex-1 overflow-hidden">
        <QuizEditorSidebar />
        <QuestionEditor />
      </div>
    </div>
  </QuizEditorProvider>
)

export const Route = createFileRoute("/manager/quiz/")({
  component: QuizEditorPage,
})
