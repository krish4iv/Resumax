// src/components/profile/constants.js

export const inputStyle = "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.07] transition-all"
export const labelStyle = "block text-xs font-medium text-slate-400 mb-1.5"

export const TABS = [
  { id: "overview", label: "Overview" },
  { id: "targeting", label: "Targeting" },
  { id: "skills", label: "Skills" },
]

/* ---------------------------------------------------------------
   Label maps — mirror the option lists in OnboardingWizard.jsx so
   the raw enum values saved to the DB (e.g. "first_job") render as
   the same human-readable copy the wizard showed at collection time.
----------------------------------------------------------------*/
export const GOAL_LABELS = {
  first_job: "Land my first job",
  switch_company: "Switch to a better company",
  level_up: "Level up, senior to staff",
  big_tech: "Break into big tech",
  exploring: "Just exploring for now",
}
export const SITUATION_LABELS = {
  employed_interviewing: "Employed, actively interviewing",
  employed_looking: "Employed, casually looking",
  searching_fulltime: "Searching full-time",
  student_new_grad: "Student or new grad",
  bootcamp: "Bootcamp or self-taught",
  switching_into_tech: "Switching into tech",
}
export const EXPERIENCE_LABELS = {
  intern: "Intern",
  new_grad: "New grad",
  "1_2_yrs": "1 to 2 yrs",
  "3_5_yrs": "3 to 5 yrs",
  "6_9_yrs": "6 to 9 yrs",
  "10_plus_yrs": "10+ yrs",
}
export const CRAFT_LABELS = {
  frontend: "Frontend",
  backend: "Backend",
  fullstack: "Full-stack",
  mobile: "Mobile",
  ml_ai: "ML / AI",
  data: "Data",
  devops: "DevOps / Platform",
  security: "Security",
  embedded: "Embedded",
  qa_sdet: "QA / SDET",
  engineering_manager: "Engineering manager",
}
export const WORK_MODE_LABELS = { remote: "Remote", hybrid: "Hybrid", onsite: "Onsite" }
export const WORK_AUTH_LABELS = {
  citizen_or_pr: "Citizen or permanent resident",
  need_sponsorship_now: "Needs sponsorship now",
  need_sponsorship_later: "Will need sponsorship later",
}
export const SEARCH_STATUS_LABELS = {
  not_started: "Not started applying yet",
  applying_no_response: "Applying, not hearing back",
  interviewing_no_offers: "Interviewing, no offers yet",
  have_offer: "Has an offer",
}
export const BLOCKER_LABELS = {
  resume_not_responding: "Resume isn't getting responses",
  cant_find_roles: "Can't find good roles",
  interview_performance: "Freezes or underperforms in interviews",
  feel_underqualified: "Feels underqualified",
  no_time_to_apply: "Doesn't have time to apply",
}
export const TIME_LABELS = {
  few_hours: "A few hours a week",
  "5_to_15_hours": "5 to 15 hours a week",
  "15_plus_hours": "15+ hours a week",
}