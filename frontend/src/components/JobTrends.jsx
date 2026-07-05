import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { theme } from '../theme/index.js'
import { Loader2 } from 'lucide-react'
import skillAnalysisService from '../services/skillAnalysis.service.js'

const JobTrends = () => {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skills = await skillAnalysisService.getTrendingSkills()
        // Transform string array to chart data
        const data = skills.map((skill, i) => ({
          name: skill,
          count: skills.length - i  // rank-based count
        }))
        setChartData(data)
      } catch (err) {
        console.error('Failed to fetch trending skills:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSkills()
  }, [])

  if (loading) return (
    <div className="flex justify-center py-8">
      <Loader2 size={24} className="animate-spin text-blue-500" />
    </div>
  )

  return (
    <div>
      <h3 className={`font-semibold mb-4 ${theme.heading}`}>Top Trending Skills</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
          />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <Tooltip
            contentStyle={{
              background: 'rgba(15,15,25,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#e2e8f0'
            }}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Frequency" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default JobTrends