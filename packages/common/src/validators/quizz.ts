import { MEDIA_TYPES } from "@razzia/common/constants"
import { z } from "zod"

export const questionMediaValidator = z.object({
  type: z
    .enum([MEDIA_TYPES.IMAGE, MEDIA_TYPES.VIDEO, MEDIA_TYPES.AUDIO])
    .optional(),
  url: z.url("errors:quizz.invalidMediaUrl"),
})

const questionValidator = z.object({
  question: z.string().min(1, "errors:quizz.questionEmpty"),
  media: questionMediaValidator.optional(),
  answers: z.array(z.string().min(1, "errors:quizz.answerEmpty")),
  solutions: z
    .union([z.number().int().min(0), z.array(z.number().int().min(0)).min(0)])
    .transform((v) => (Array.isArray(v) ? v : [v])),
  textSolutions: z.array(z.string().min(1, "errors:quizz.answerEmpty")).optional(),
  cooldown: z.number().int().min(3).max(15),
  time: z.number().int().min(-1),
  type: z.enum(["single", "multiple", "truefalse", "shortanswer"]).optional(),
}).superRefine((data, ctx) => {
  if (data.type === "shortanswer") {
    if (!data.textSolutions || data.textSolutions.length === 0) {
      ctx.addIssue({ code: "custom", message: "errors:quizz.noTextSolutions", path: ["textSolutions"] })
    }
  } else {
    if (data.answers.length < 2) {
      ctx.addIssue({ code: "custom", message: "errors:quizz.tooFewAnswers", path: ["answers"] })
    }
    if (data.answers.length > 4) {
      ctx.addIssue({ code: "custom", message: "errors:quizz.tooManyAnswers", path: ["answers"] })
    }
  }
})

export const quizzValidator = z.object({
  subject: z.string().min(1, "errors:quizz.subjectEmpty"),
  questions: z.array(questionValidator).min(1, "errors:quizz.noQuestions"),
})

export type QuizzValidated = z.infer<typeof quizzValidator>
