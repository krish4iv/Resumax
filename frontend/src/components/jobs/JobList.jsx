import { Loader2 } from 'lucide-react'
import EmptyState from './EmptyState.jsx'
import JobListItem from './JobListItem.jsx'
import Pagination from '../Pagination.jsx'

const JobList = ({
  loading, activeTab, recError, list, pagedList,
  selectedId, onSelect, page, totalPages, onPageChange,
  search, location,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <Loader2 size={26} className="animate-spin text-cyan-400" />
      </div>
    )
  }

  if (activeTab === 'foryou' && recError === 'no-user') {
    return <EmptyState title="Sign in to see recommendations" body="We need your profile to match jobs to your skills." />
  }
  if (activeTab === 'foryou' && recError === 'failed') {
    return <EmptyState title="Couldn't load recommendations" body="Try again in a moment." />
  }

  if (list.length === 0) {
    const missingFields = !search || !location
    return (
      <EmptyState
        title={
          activeTab === 'foryou'
            ? 'No matches yet'
            : (missingFields ? 'Enter a job title and location to search' : 'No jobs found')
        }
        body={
          activeTab === 'foryou'
            ? 'Fill out your profile skills to get recommendations.'
            : (missingFields ? 'Both fields are required to search live job listings' : 'Try adjusting your search or filters')
        }
      />
    )
  }

  return (
    <>
      {pagedList.map(job => (
        <JobListItem
          key={job.id}
          job={job}
          isSelected={selectedId === job.id}
          isForYou={activeTab === 'foryou'}
          onSelect={onSelect}
        />
      ))}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
    </>
  )
}

export default JobList