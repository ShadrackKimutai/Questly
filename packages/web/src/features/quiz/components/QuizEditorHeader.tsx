import { EVENTS } from "@questly/common/constants"
import Button from "@questly/web/components/Button"
import Input from "@questly/web/components/Input"
import {
  useEvent,
  useSocket,
} from "@questly/web/features/game/contexts/socket-context"
import { useQuizEditor } from "@questly/web/features/quiz/contexts/quiz-editor-context"
import { useNavigate } from "@tanstack/react-router"
import type { ChangeEvent } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

const QuizEditorHeader = () => {
  const { quizId, subject, setSubject, questions } = useQuizEditor()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleChangeSubject = (e: ChangeEvent<HTMLInputElement>) => {
    setSubject(e.target.value)
  }

  const handleSave = () => {
    if (quizId) {
      socket.emit(EVENTS.QUIZ.UPDATE, { id: quizId, subject, questions })
    } else {
      socket.emit(EVENTS.QUIZ.SAVE, { subject, questions })
    }
  }

  useEvent(EVENTS.QUIZ.SAVE_SUCCESS, () => {
    toast.success(t("quiz:quizSaved"))
    navigate({ to: "/manager/config" })
  })

  useEvent(EVENTS.QUIZ.UPDATE_SUCCESS, (_data) => {
    toast.success(t("quiz:quizUpdated"))
    navigate({ to: "/manager/config" })
  })

  useEvent(EVENTS.QUIZ.ERROR, (message) => {
    toast.error(t(message))
  })

  return (
    <header className="z-20 flex h-14 items-center justify-between gap-4 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-6">
        <Input
          variant="sm"
          className="w-64"
          value={subject}
          onChange={handleChangeSubject}
          placeholder={t("quiz:titleQuizPlaceholder")}
        />
      </div>

      <div className="flex gap-2">
        <Button
          className="text-md bg-gray-200 px-4 py-2 font-semibold text-gray-600"
          onClick={() => navigate({ to: "/manager" })}
        >
          {t("common:exit")}
        </Button>
        <Button className="bg-primary text-md px-4 py-2" onClick={handleSave}>
          {t("common:save")}
        </Button>
      </div>
    </header>
  )
}

export default QuizEditorHeader
