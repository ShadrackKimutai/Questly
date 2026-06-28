import { EVENTS } from "@questly/common/constants"
import Button from "@questly/web/components/Button"
import { useSocket } from "@questly/web/features/game/contexts/socket-context"
import { useConfig } from "@questly/web/features/manager/contexts/config-context"
import clsx from "clsx"
import { Check } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

const ConfigSelectQuiz = () => {
  const { socket } = useSocket()
  const { quiz: quizList } = useConfig()
  const [selected, setSelected] = useState<string | null>(null)
  const { t } = useTranslation()

  const handleSelect = (id: string) => () => {
    if (selected === id) {
      setSelected(null)
    } else {
      setSelected(id)
    }
  }

  const handleSubmit = () => {
    if (!selected) {
      toast.error(t("manager:quiz.pleaseSelect"))

      return
    }

    socket.emit(EVENTS.GAME.CREATE, selected)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {quizList.length > 0 && (
        <Button className="mb-4 shrink-0" onClick={handleSubmit}>
          {t("manager:quiz.startGame")}
        </Button>
      )}
      <div className="min-h-0 flex-1 space-y-2 overflow-auto p-0.5">
        {quizList.map((quiz) => (
          <button
            key={quiz.id}
            className="flex w-full items-center justify-between rounded-md p-3 outline outline-gray-300"
            onClick={handleSelect(quiz.id)}
          >
            {quiz.subject}

            <div
              className={clsx(
                "size-5 rounded p-0.5 outline outline-offset-3 outline-gray-300",
                selected === quiz.id && "bg-primary border-primary/80",
              )}
            >
              {selected === quiz.id && (
                <Check className="size-full stroke-4 text-white" />
              )}
            </div>
          </button>
        ))}
        {!quizList.length && (
          <div className="my-8 text-center text-gray-500">
            <p>{t("manager:quiz.notFound")}</p>
            <p className="text-sm">{t("manager:quiz.pleaseCreate")}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConfigSelectQuiz
