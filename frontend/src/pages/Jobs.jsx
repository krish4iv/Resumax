import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Sparkles } from 'lucide-react'
import MainLayout from '../components/layout/MainLayout.jsx'

import TabBar from '../components/jobs/TabBar.jsx'
import BrowseFilters from '../components/jobs/BrowseFilters.jsx'
import JobList from '../components/jobs/JobList.jsx'
import JobDetailPanel from '../components/jobs/JobDetailPanel.jsx'
import PipelineBoard from '../components/jobs/PipelineBoard.jsx'

import useBrowseJobs from '../hooks/useBrowseJobs.js'
import useRecommendedJobs from '../hooks/useRecommendedJobs.js'
import useApplications from '../hooks/useApplications.js'
import useSavedJobs from '../hooks/useSavedJobs.js'
import usePagination from '../hooks/usePagination.js'

const PAGE_SIZE = 10

const Jobs = () => {
  const { user } = useSelector((state) => state.auth)
  const uid = user?.firebase_uid

  const [activeTab, setActiveTab] = useState('browse')
  const isForYou = activeTab === 'foryou'

  const browse = useBrowseJobs()
  const recommended = useRecommendedJobs(uid, isForYou)
  const applications = useApplications(activeTab === 'pipeline')
  const { saving, savedIds, saveJobToList } = useSavedJobs()

  const [selectedBrowseId, setSelectedBrowseId] = useState(null)
  const [selectedRecId, setSelectedRecId]       = useState(null)

  // jump to the first result whenever a fresh list comes in, per tab
  // (matches the original behavior — see conversation notes on this tradeoff)
  useEffect(() => {
    setSelectedBrowseId(browse.jobs[0]?.id ?? null)
  }, [browse.jobs])

  useEffect(() => {
    setSelectedRecId(recommended.jobs[0]?.id ?? null)
  }, [recommended.jobs])

  const list        = isForYou ? recommended.jobs : browse.jobs
  const listLoading = isForYou ? recommended.loading : browse.loading
  const selectedId    = isForYou ? selectedRecId : selectedBrowseId
  const setSelectedId = isForYou ? setSelectedRecId : setSelectedBrowseId
  const selectedJob = list.find(j => j.id === selectedId) || null

  const { page, setPage, totalPages, paged: pagedList } = usePagination(list, PAGE_SIZE)

  return (
    <MainLayout>
      <div className="space-y-5 animate-fade-in max-w-7xl">

        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-500 mb-1">
              JOB SEARCH
            </p>
            <h1 className="text-3xl font-bold text-white">Jobs</h1>
          </div>
        </div>

        <TabBar activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'browse' && (
          <BrowseFilters
            filters={browse.filters}
            setters={browse.setters}
            hasFilters={browse.hasFilters}
            onClear={browse.clearFilters}
          />
        )}

        {isForYou && (
          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            <Sparkles size={14} className="text-cyan-400" />
            Matched to your profile — skills, preferred role, and location.
          </p>
        )}

        {activeTab === 'pipeline' && (
          <PipelineBoard loading={applications.loading} applications={applications.applications} />
        )}

        {activeTab !== 'pipeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 items-start">
            <div className="space-y-3">
              <JobList
                loading={listLoading}
                activeTab={activeTab}
                recError={recommended.error}
                list={list}
                pagedList={pagedList}
                selectedId={selectedId}
                onSelect={setSelectedId}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                search={browse.filters.search}
                location={browse.filters.location}
              />
            </div>

            <JobDetailPanel
              job={selectedJob}
              saving={saving}
              savedIds={savedIds}
              applying={applications.applying}
              appliedIds={applications.appliedIds}
              onSave={saveJobToList}
              onApply={applications.applyToJob}
            />
          </div>
        )}

      </div>
    </MainLayout>
  )
}

export default Jobs