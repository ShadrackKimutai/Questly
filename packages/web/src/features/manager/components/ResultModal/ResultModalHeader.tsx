import { useResultModal } from "@questly/web/features/manager/contexts/result-modal-context"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useTranslation } from "react-i18next"

const ResultModalHeader = () => {
  const {
    result,
    view,
    questionIndex,
    total,
    goNext,
    goPrev,
    goToOverview,
    onClose,
  } = useResultModal()
  const { t } = useTranslation()

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 px-5 py-3">
      {view.type !== "overview" && (
        <button
          type="button"
          onClick={goToOverview}
          className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-100"
          title={t("manager:result.backToOverview")}
        >
          <ChevronLeft className="size-5" />
        </button>
      )}

      <h2 className="flex-1 truncate text-base font-bold text-gray-900">
        {view.type === "overview"
          ? result.subject
          : view.type === "player"
            ? view.name
            : result.subject}
      </h2>

      {view.type === "question" && (
        <div className="flex shrink-0 items-center gap-1">
          <span className="text-sm text-gray-400">
            {questionIndex + 1}
            {t("manager:result.paginationOf")}
            {total}
          </span>
          <button
            disabled={questionIndex === 0}
            onClick={goPrev}
            type="button"
            title={t("manager:result.prevQuestion")}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            disabled={questionIndex === total - 1}
            onClick={goNext}
            type="button"
            title={t("manager:result.nextQuestion")}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}

      <button
        type="button"
        title={t("manager:result.closeResults")}
        onClick={onClose}
        className="ml-1 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <X className="size-5" />
      </button>
    </div>
  )
}

export default ResultModalHeader
