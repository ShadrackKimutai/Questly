import background from "@questly/web/assets/background.png"
import QuestionEditorAnswers from "@questly/web/features/quiz/components/QuestionEditor/QuestionEditorAnswers"
import QuestionEditorConfig from "@questly/web/features/quiz/components/QuestionEditor/QuestionEditorConfig"
import QuestionEditorMedia from "@questly/web/features/quiz/components/QuestionEditor/QuestionEditorMedia"
import QuestionEditorTitle from "@questly/web/features/quiz/components/QuestionEditor/QuestionEditorTitle"

const QuestionEditor = () => (
  <div className="flex flex-1 overflow-hidden">
    <main className="mx-auto flex max-w-7xl flex-1 flex-col gap-4 overflow-y-auto p-6">
      <QuestionEditorTitle />
      <QuestionEditorMedia />
      <QuestionEditorAnswers />

      <div className="fixed top-0 left-0 h-full w-full">
        <img
          className="pointer-events-none h-full w-full object-cover select-none"
          src={background}
          alt="background"
        />
      </div>
    </main>
    <QuestionEditorConfig />
  </div>
)

export default QuestionEditor
