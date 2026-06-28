import { EVENTS } from "@questly/common/constants"
import type { SocketContext } from "@questly/socket/handlers/types"
import {
  deleteQuiz,
  getQuizById,
  saveQuiz,
  updateQuiz,
} from "@questly/socket/services/config"
import manager, { emitConfig } from "@questly/socket/services/manager"

export const quizSocketHandlers = ({ socket }: SocketContext) => {
  socket.on(
    EVENTS.QUIZ.GET,
    manager.withAuth(socket, (id) => {
      try {
        const quiz = getQuizById(id)

        socket.emit(EVENTS.QUIZ.DATA, quiz)
      } catch (error) {
        console.error("Failed to get quiz:", error)
        socket.emit(EVENTS.QUIZ.ERROR, "errors:quiz.notFound")
      }
    }),
  )

  socket.on(
    EVENTS.QUIZ.SAVE,
    manager.withAuth(socket, (data) => {
      try {
        const { id } = saveQuiz(data)

        socket.emit(EVENTS.QUIZ.SAVE_SUCCESS, { id })
        emitConfig(socket)
      } catch (error) {
        console.error("Failed to save quiz:", error)
        const message =
          error instanceof Error ? error.message : "errors:quiz.failedToSave"
        socket.emit(EVENTS.QUIZ.ERROR, message)
      }
    }),
  )

  socket.on(
    EVENTS.QUIZ.DELETE,
    manager.withAuth(socket, (id) => {
      try {
        deleteQuiz(id)

        emitConfig(socket)
      } catch (error) {
        console.error("Failed to delete quiz:", error)
        socket.emit(EVENTS.QUIZ.ERROR, "errors:quiz.failedToDelete")
      }
    }),
  )

  socket.on(
    EVENTS.QUIZ.UPDATE,
    manager.withAuth(socket, ({ id, ...data }) => {
      try {
        const { id: newId } = updateQuiz(id, data)

        socket.emit(EVENTS.QUIZ.UPDATE_SUCCESS, { id: newId })
        emitConfig(socket)
      } catch (error) {
        console.error("Failed to update quiz:", error)
        const message =
          error instanceof Error ? error.message : "errors:quiz.failedToUpdate"
        socket.emit(EVENTS.QUIZ.ERROR, message)
      }
    }),
  )
}
