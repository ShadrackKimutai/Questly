import { EVENTS } from "@questly/common/constants"
import type { ManagerConfig } from "@questly/common/types/manager"
import Card from "@questly/web/components/Card"
import LanguageSwitcher from "@questly/web/components/LanguageSwitcher"
import { useSocket } from "@questly/web/features/game/contexts/socket-context"
import { useManagerStore } from "@questly/web/features/game/stores/manager"
import ConfigManageQuiz from "@questly/web/features/manager/components/configurations/ConfigManageQuiz"
import ConfigResults from "@questly/web/features/manager/components/configurations/ConfigResults"
import ConfigSelectQuiz from "@questly/web/features/manager/components/configurations/ConfigSelectQuiz"
import ConfigTabButton from "@questly/web/features/manager/components/configurations/ConfigTabButton"
import { ConfigProvider } from "@questly/web/features/manager/contexts/config-context"
import { LogOut } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

const tabs = [
  {
    nameKey: "manager:tabs.play",
    component: ConfigSelectQuiz,
  },
  {
    nameKey: "manager:tabs.quiz",
    component: ConfigManageQuiz,
  },
  {
    nameKey: "manager:tabs.results",
    component: ConfigResults,
  },
]

interface Props {
  data: ManagerConfig
}

const Configurations = ({ data }: Props) => {
  const [selectedTab, setSelectedTab] = useState(0)
  const { reset } = useManagerStore()
  const { socket } = useSocket()
  const { t } = useTranslation()
  const TabComponent = tabs[selectedTab].component

  const handleSelect = (index: number) => () => {
    setSelectedTab(index)
  }

  const handleLogout = () => {
    socket.emit(EVENTS.MANAGER.LOGOUT)
    reset()
  }

  return (
    <ConfigProvider data={data}>
      <Card className="max-h-[80svh] w-full max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-lg font-semibold">
            {t("manager:configurationsTitle")}
          </p>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              className="rounded-sm p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              onClick={handleLogout}
              title={t("manager:logout")}
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
        <div className="flex shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
          {tabs.map((tab, index) => (
            <ConfigTabButton
              key={tab.nameKey}
              active={index === selectedTab}
              onClick={handleSelect(index)}
            >
              {t(tab.nameKey)}
            </ConfigTabButton>
          ))}
        </div>
        <hr className="my-4 text-gray-100" />
        <div className="flex min-h-0 flex-1 flex-col">
          <TabComponent />
        </div>
      </Card>
    </ConfigProvider>
  )
}

export default Configurations
