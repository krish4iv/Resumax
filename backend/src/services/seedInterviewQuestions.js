/**
 * Seeds:
 *   1. interview_questions (module="coding") from NeetCode's own dataset
 *   2. companies, from the list shown in the My Plan picker
 *
 * Run with: node scripts/seedInterviewQuestions.js
 * (add "type": "module" in package.json if not already set, or rename to .mjs)
 */

import axios from "axios"
import { InterviewQuestion, Company, sequelize } from "../models/index.js"

const NEETCODE_DATA_URL =
  "https://raw.githubusercontent.com/neetcode-gh/leetcode/main/.problemSiteData.json"

// Companies visible in the My Plan screenshot. Extend freely — slug is
// used for company_tags matching later, name/logo for display.
const COMPANIES = [
  "Adobe", "Airbnb", "Amazon", "Anthropic", "Apple", "Block", "Bloomberg",
  "ByteDance", "Cloudflare", "Coinbase", "Databricks", "Datadog", "DoorDash",
  "Dropbox", "Figma", "Google", "LinkedIn", "Meta", "Microsoft", "Netflix",
  "Notion",
].map((name) => ({
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
}))

async function seedCompanies() {
  console.log(`Seeding ${COMPANIES.length} companies...`)
  for (const c of COMPANIES) {
    await Company.findOrCreate({ where: { slug: c.slug }, defaults: c })
  }
  console.log("Companies done.")
}

async function seedCodingQuestions() {
  console.log("Fetching NeetCode problem dataset...")
  const { data } = await axios.get(NEETCODE_DATA_URL)

  if (!Array.isArray(data)) {
    throw new Error("Unexpected response shape from NeetCode dataset")
  }

  console.log(`Fetched ${data.length} problems. Upserting...`)

  let created = 0
  let skipped = 0

  for (const p of data) {
    if (!p.problem || !p.pattern || !p.difficulty) {
      skipped++
      continue
    }

    const [, wasCreated] = await InterviewQuestion.findOrCreate({
      where: {
        module: "coding",
        title: p.problem,
      },
      defaults: {
        module: "coding",
        category: p.pattern,
        title: p.problem,
        description: null, // NeetCode's dataset doesn't include problem statements
        difficulty: p.difficulty,
        company_tags: [], // populated by a separate company-tag ingestion pass
        metadata: {
          pattern: p.pattern,
          neetcode150: Boolean(p.neetcode150),
          blind75: Boolean(p.blind75),
          leetcode_slug: p.link || null,
          leetcode_url: p.link ? `https://leetcode.com/problems/${p.link}` : null,
          neetcode_url: p.link
            ? `https://neetcode.io/problems/${p.link.replace(/\/$/, "")}?list=neetcode150`
            : null,
          video_id: p.video || null,
          premium: Boolean(p.premium),
          free_link: p.freeLink || null,
        },
      },
    })

    if (wasCreated) created++
  }

  console.log(`Coding questions: ${created} created, ${skipped} skipped (missing fields).`)
}

async function main() {
  try {
    await seedCompanies()
    await seedCodingQuestions()
    console.log("Seed complete.")
  } catch (err) {
    console.error("Seed failed:", err)
    process.exitCode = 1
  } finally {
    await sequelize.close()
  }
}

main()