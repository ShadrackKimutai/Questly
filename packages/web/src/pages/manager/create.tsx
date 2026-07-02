import { EVENTS } from "@questly/common/constants"
import Background from "@questly/web/components/Background"
import Loader from "@questly/web/components/Loader"
import LanguageSwitcher from "@questly/web/components/LanguageSwitcher"
import {
  useEvent,
  useSocket,
} from "@questly/web/features/game/contexts/socket-context"
import { useManagerStore } from "@questly/web/features/game/stores/manager"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Gamepad2, LogOut, Presentation } from "lucide-react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

const ManagerCreatePage = () => {
  const { isConnected, socket } = useSocket()
  const { config, setConfig, reset } = useManagerStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEvent(EVENTS.MANAGER.CONFIG, (data) => {
    setConfig(data)
  })

  const handleLogout = () => {
    socket.emit(EVENTS.MANAGER.LOGOUT)
    reset()
    navigate({ to: "/manager" })
  }

  const handlePresentation = () => {
    toast(t("manager:create.presentationToast"))
  }

  if (!isConnected) {
    return (
      <Background>
        <Loader className="h-23" />
      </Background>
    )
  }

  if (!config) {
    return navigate({ to: "/manager/login" })
  }

  return (
    <Background>
      <div className="z-10 flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg md:text-3xl">
            {t("manager:create.title")}
          </h1>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
              onClick={handleLogout}
              title={t("manager:logout")}
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate({ to: "/manager/config" })}
            className="group flex flex-col items-start gap-3 rounded-2xl border border-white/20 bg-white/95 p-6 text-left shadow-2xl shadow-black/30 backdrop-blur-md transition-transform hover:-translate-y-1"
          >
            <div className="gradient-primary flex size-12 items-center justify-center rounded-xl">
              <Gamepad2 className="size-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {t("manager:create.quizTitle")}
            </h2>
            <p className="text-sm text-gray-500">
              {t("manager:create.quizDescription")}
            </p>
            <span className="text-primary mt-auto text-sm font-bold">
              {t("manager:create.quizAction")} →
            </span>
          </button>

          <button
            type="button"
            onClick={handlePresentation}
            className="group relative flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/50 p-6 text-left opacity-80 shadow-xl shadow-black/20 backdrop-blur-md transition-transform hover:-translate-y-1"
          >
            <span className="absolute top-4 right-4 rounded-full bg-gray-800/80 px-2.5 py-1 text-xs font-bold text-white">
              {t("manager:create.presentationComingSoon")}
            </span>
            <div className="flex size-12 items-center justify-center rounded-xl bg-gray-400">
              <Presentation className="size-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-700">
              {t("manager:create.presentationTitle")}
            </h2>
            <p className="text-sm text-gray-500">
              {t("manager:create.presentationDescription")}
            </p>
          </button>
        </div>
      </div>
    </Background>
  )
}

export const Route = createFileRoute("/manager/create")({
  component: ManagerCreatePage,
})
