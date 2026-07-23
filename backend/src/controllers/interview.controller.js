import { Op } from "sequelize"
import { InterviewQuestion, UserQuestionProgress, Company } from "../models/index.js"


async function fetchQuestionsWithProgress(user_id, { module, category, difficulty, list, company }) {
  const where = { module }
  if (category) where.category = category
  if (difficulty) where.difficulty = difficulty

  if (list === "blind75") {
    where["metadata.blind75"] = true
  } else if (list === "full150") {
    where["metadata.neetcode150"] = true
  }

  if (company) {
    where.company_tags = { [Op.contains]: [company] }
  }

  const questions = await InterviewQuestion.findAll({
    where,
    include: [
      {
        model: UserQuestionProgress,
        as: "progress", 
        where: { user_id },
        required: false, 
      },
    ],
    order: [
      ["category", "ASC"],
      ["title", "ASC"],
    ],
  })

  return questions.map((q) => {
    const json = q.toJSON()
    const status = json.progress?.[0]?.status || "todo"
    delete json.progress
    return { ...json, status }
  })
}

/**
 * GET /api/interview/questions?module=coding&category=&difficulty=&status=&list=full150|blind75&company=
 */
async function listQuestions(req, res) {
  try {
    const user_id = req.user.uid
    const { module, category, difficulty, status, list, company } = req.query

    if (!module) {
      return res.status(400).json({ message: "module is required" })
    }

    let results = await fetchQuestionsWithProgress(user_id, { module, category, difficulty, list, company })

    if (status) {
      results = results.filter((q) => q.status === status)
    }

    res.status(200).json(results)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * PATCH /api/interview/questions/:id/progress
 * body: { status: "todo" | "attempted" | "solved" }
 */
async function updateProgress(req, res) {
  try {
    const user_id = req.user.uid
    const { id } = req.params
    const { status } = req.body

    if (!["todo", "attempted", "solved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const question = await InterviewQuestion.findByPk(id)
    if (!question) return res.status(404).json({ message: "Question not found" })

    const [progress] = await UserQuestionProgress.findOrCreate({
      where: { user_id, question_id: id },
      defaults: { status },
    })

    if (progress.status !== status) {
      progress.status = status
      await progress.save()
    }

    res.status(200).json(progress)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * GET /api/interview/stats?module=coding
 * Same join as listQuestions — no separate full-table findAll anymore.
 */
async function getStats(req, res) {
  try {
    const user_id = req.user.uid
    const { module } = req.query
    if (!module) return res.status(400).json({ message: "module is required" })

    const questions = await fetchQuestionsWithProgress(user_id, { module })

    const solved = questions.filter((q) => q.status === "solved").length
    const attempted = questions.filter((q) => q.status === "attempted").length

    if (module === "coding") {
      const blind75Questions = questions.filter((q) => q.metadata?.blind75)
      const blind75Solved = blind75Questions.filter((q) => q.status === "solved").length
      const patterns = new Set(questions.map((q) => q.category))
      const patternsWithProgress = new Set(
        questions.filter((q) => q.status === "solved").map((q) => q.category)
      )

      return res.status(200).json({
        solved,
        attempted,
        blind75_solved: blind75Solved,
        blind75_total: blind75Questions.length,
        patterns_covered: patternsWithProgress.size,
        patterns_total: patterns.size,
      })
    }

    res.status(200).json({ solved, attempted, total: questions.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * GET /api/interview/companies
 */
async function listCompanies(req, res) {
  try {
    const companies = await Company.findAll({ order: [["name", "ASC"]] })
    res.status(200).json(companies)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export default {
  listQuestions,
  updateProgress,
  getStats,
  listCompanies,
  fetchQuestionsWithProgress,
}