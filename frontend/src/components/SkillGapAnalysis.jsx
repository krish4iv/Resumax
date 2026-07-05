import { useEffect, useState } from 'react'
import { theme } from '../theme/index.js'
import { Loader2, ExternalLink } from 'lucide-react'
import skillAnalysisService from '../services/skillAnalysis.service.js'

const SkillTag = ({ label, color = 'blue' }) => {
  const colors = {
    blue:   `${theme.badge} ${theme.badgeBlue}`,
    purple: `${theme.badge} ${theme.badgePurple}`,
    red:    `${theme.badge} bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300`,
  }
  return <span className={colors[color]}>{label}</span>
}

const SkillGapAnalysis = ({ uid }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!uid) return
    const fetch = async () => {
      try {
        const result = await skillAnalysisService.getSkillGapAnalysis(uid)
        setData(result)
      } catch (err) {
        setError('Failed to load skill analysis')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [uid])

  if (loading) return (
    <div className="flex justify-center py-8">
      <Loader2 size={24} className="animate-spin text-blue-500" />
    </div>
  )

  if (error) return <p className="text-red-400 text-sm text-center py-4">{error}</p>

  if (!data) return null

  const { user_skills, trending_skills, missing_skills, recommended_courses } = data

  return (
    <div className="space-y-6">

      {/* Your Skills */}
      <div>
        <h3 className={`font-semibold mb-3 ${theme.heading}`}>Your Skills</h3>
        {user_skills?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user_skills.map(skill => <SkillTag key={skill} label={skill} color="blue" />)}
          </div>
        ) : (
          <p className={theme.subtext}>No skills found — update your profile!</p>
        )}
      </div>

      {/* Trending Skills */}
      <div>
        <h3 className={`font-semibold mb-3 ${theme.heading}`}>Trending Skills</h3>
        {trending_skills?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {trending_skills.map(skill => <SkillTag key={skill} label={skill} color="purple" />)}
          </div>
        ) : (
          <p className={theme.subtext}>No trending skills found</p>
        )}
      </div>

      {/* Missing Skills */}
      <div>
        <h3 className={`font-semibold mb-3 ${theme.heading}`}>Skills to Learn</h3>
        {missing_skills?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {missing_skills.map(skill => <SkillTag key={skill} label={skill} color="red" />)}
          </div>
        ) : (
          <p className="text-green-400 text-sm">🎉 You have all trending skills!</p>
        )}
      </div>

      {/* Recommended Courses */}
      {recommended_courses?.length > 0 && (
        <div>
          <h3 className={`font-semibold mb-3 ${theme.heading}`}>Recommended Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommended_courses.map((course, i) => (
              <div key={i} className={theme.card}>
                <p className={`font-medium text-sm ${theme.heading} mb-1`}>{course.name}</p>
                <div className="flex items-center gap-2 mb-3">
                  {course.rating && (
                    <span className={`${theme.badge} ${theme.badgeOrange}`}>
                      ⭐ {course.rating}
                    </span>
                  )}
                  {course.difficulty && (
                    <span className={`${theme.badge} ${theme.badgeBlue}`}>
                      {course.difficulty}
                    </span>
                  )}
                  {course.for_skill && (
                    <span className={`${theme.badge} bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300`}>
                      For: {course.for_skill}
                    </span>
                  )}
                </div>
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${theme.btnGlass} text-xs py-1.5 px-3 flex items-center gap-1 w-fit`}
                >
                  <ExternalLink size={11} /> View Course
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SkillGapAnalysis