// src/pages/Document.jsx
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout.jsx"
import { getResumes } from "../services/resume.service.js"
import TabBar from "../components/documents/Tabbar.jsx"
import OverviewTab from "../components/documents/Overview.jsx"
import ResumesTab from "../components/documents/ResumesTab.jsx"
import AIReviewTab from "../components/documents/AIReviewTab.jsx"

export default function Documents() {
  const navigate = useNavigate()
  const [active, setActive] = useState("overview")
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchResumes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getResumes()
      setResumes(Array.isArray(data) ? data : data.resumes ?? [])
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Could not load your resumes.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResumes()
  }, [fetchResumes])

  return (
    <MainLayout>
      <div className="p-10 py-2 items-center justify-center h-full w-full animate-fade-in">
        <TabBar active={active} onChange={setActive} />

        {active === "overview" && (
          <OverviewTab
            resumes={resumes}
            loading={loading}
            error={error}
            onNewResume={() => navigate('/resume-builder/new')}
          />
        )}
        {active === "resumes" && (
          <ResumesTab resumes={resumes} loading={loading} error={error} onRefresh={fetchResumes} />
        )}
        {active === "ai-review" && <AIReviewTab onSaved={fetchResumes} />}
      </div>
    </MainLayout>
  )
}