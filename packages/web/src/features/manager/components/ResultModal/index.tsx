import type { GameResult } from "@questly/common/types/game"
import ResultModalAnswers from "@questly/web/features/manager/components/ResultModal/ResultModalAnswers"
import ResultModalHeader from "@questly/web/features/manager/components/ResultModal/ResultModalHeader"
import ResultModalOverview from "@questly/web/features/manager/components/ResultModal/ResultModalOverview"
import ResultModalPlayerDetail from "@questly/web/features/manager/components/ResultModal/ResultModalPlayerDetail"
import ResultModalStats from "@questly/web/features/manager/components/ResultModal/ResultModalStats"
import ResultModalTable from "@questly/web/features/manager/components/ResultModal/ResultModalTable"
import { ResultModalProvider, useResultModal } from "@questly/web/features/manager/contexts/result-modal-context"
import { useEffect } from "react"

interface Props {
  result: GameResult
  onClose: () => void
}

const ResultModalContent = () => {
  const { view } = useResultModal()

  if (view.type === "overview") {
    return <ResultModalOverview />
  }

  if (view.type === "player") {
    return <ResultModalPlayerDetail playerName={view.name} />
  }

  return (
    <>
      <ResultModalAnswers />
      <ResultModalStats />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ResultModalTable />
      </div>
    </>
  )
}

const ResultModal = ({ result, onClose }: Props) => {
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <ResultModalProvider result={result} onClose={onClose}>
          <ResultModalHeader />
          <ResultModalContent />
        </ResultModalProvider>
      </div>
    </div>
  )
}

export default ResultModal
