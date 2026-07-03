import type { GameResult } from "@questly/common/types/game"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const isAnswerCorrect = (
  answer: number | number[] | string | null,
  solutions: number[],
  textSolutions?: string[],
  type?: string,
): boolean => {
  if (answer === null) return false
  if (type === "wordcloud" || type === "dotmocracy") {
    return typeof answer === "string" && answer.trim().length > 0
  }
  if (typeof answer === "string") {
    return (
      textSolutions?.some((s) => s.toLowerCase().trim() === answer.toLowerCase().trim()) ??
      false
    )
  }
  if (Array.isArray(answer)) {
    const sortedA = [...answer].sort((a, b) => a - b)
    const sortedB = [...solutions].sort((a, b) => a - b)
    return JSON.stringify(sortedA) === JSON.stringify(sortedB)
  }
  return solutions.includes(answer)
}

export const exportResultPdf = (result: GameResult) => {
  const doc = new jsPDF()
  const totalPlayers = result.players.length

  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(result.subject, 14, 18)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(120)
  doc.text(
    `${new Date(result.date).toLocaleString()}  ·  ${totalPlayers} player${totalPlayers === 1 ? "" : "s"}  ·  ${result.questions.length} questions`,
    14,
    25,
  )
  doc.setTextColor(0)

  autoTable(doc, {
    startY: 32,
    head: [["Rank", "Player", "Points"]],
    body: result.players.map((p) => [String(p.rank), p.username, String(p.points)]),
    headStyles: { fillColor: [255, 107, 0] },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  })

  // oxlint-disable-next-line no-explicit-any, no-unsafe-member-access
  const afterLeaderboardY = (doc as any).lastAutoTable.finalY as number

  autoTable(doc, {
    startY: afterLeaderboardY + 10,
    head: [["#", "Question", "Correct", "Answered"]],
    body: result.questions.map((q, i) => {
      const correctCount = q.playerAnswers.filter((pa) =>
        isAnswerCorrect(pa.answerId, q.solutions, q.textSolutions, q.type),
      ).length
      const answeredCount = q.playerAnswers.filter((pa) => pa.answerId !== null).length
      const pct = totalPlayers > 0 ? Math.round((correctCount / totalPlayers) * 100) : 0

      return [
        String(i + 1),
        q.question,
        `${pct}%`,
        `${answeredCount}/${totalPlayers}`,
      ]
    }),
    headStyles: { fillColor: [255, 107, 0] },
    styles: { fontSize: 10 },
    columnStyles: { 1: { cellWidth: 100 } },
    margin: { left: 14, right: 14 },
  })

  const fileSafeSubject = result.subject.replace(/[^a-z0-9]+/giu, "-").toLowerCase()
  doc.save(`${fileSafeSubject || "quiz-results"}.pdf`)
}
