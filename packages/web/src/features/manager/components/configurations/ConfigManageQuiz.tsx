import { EVENTS } from "@questly/common/constants"
import AlertDialog from "@questly/web/components/AlertDialog"
import Button from "@questly/web/components/Button"
import {
  useEvent,
  useSocket,
} from "@questly/web/features/game/contexts/socket-context"
import { useConfig } from "@questly/web/features/manager/contexts/config-context"
import { useNavigate } from "@tanstack/react-router"
import { SquarePen, Trash2, Upload } from "lucide-react"
import { type ChangeEvent, useRef } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

const ConfigManageQuiz = () => {
  const { quiz } = useConfig()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()

  useEvent(EVENTS.QUIZ.ERROR, (message) => {
    toast.error(t(message))
  })

  const handleDelete = (id: string) => () => {
    socket.emit(EVENTS.QUIZ.DELETE, id)
    toast.success(t("manager:quiz.deleted"))
  }

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data: unknown = JSON.parse(event.target?.result as string)
        socket.emit(EVENTS.QUIZ.SAVE, data)
      } catch {
        toast.error("Invalid JSON file")
      }
    }

    reader.readAsText(file)
    e.target.value = ""
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex shrink-0 gap-2">
        <Button
          className="flex-1"
          onClick={() => navigate({ to: "/manager/quiz" })}
        >
          {t("manager:quiz.create")}
        </Button>
        <Button
          className="aspect-square bg-gray-200 px-3 text-gray-600"
          onClick={() => fileInputRef.current?.click()}
          title={t("manager:quiz.import")}
        >
          <Upload className="size-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-auto p-0.5">
        {quiz.map((q) => (
          <div
            key={q.id}
            className="flex h-12 w-full items-center justify-between rounded-md pr-1.5 pl-3 outline outline-gray-300"
          >
            <p className="truncate">{q.subject}</p>
            <div className="flex gap-0.5">
              <button
                className="rounded-sm p-2 text-gray-600 hover:bg-gray-600/10"
                onClick={() =>
                  navigate({
                    to: "/manager/quiz/$quizId",
                    params: { quizId: q.id },
                  })
                }
              >
                <SquarePen className="size-4" />
              </button>

              <AlertDialog
                trigger={
                  <button className="rounded-sm p-2 hover:bg-red-600/10">
                    <Trash2 className="size-4 stroke-red-500" />
                  </button>
                }
                title={t("manager:quiz.delete")}
                description={t("manager:quiz.deleteConfirm", {
                  name: q.subject,
                })}
                confirmLabel={t("common:delete")}
                onConfirm={handleDelete(q.id)}
              />
            </div>
          </div>
        ))}
        {quiz.length === 0 && (
          <p className="my-8 text-center text-gray-500">
            {t("manager:quiz.none")}
          </p>
        )}
      </div>
    </div>
  )
}

export default ConfigManageQuiz
