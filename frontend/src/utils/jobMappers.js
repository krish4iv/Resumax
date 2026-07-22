// jobspy's raw job -> the shape every card/detail-panel in the Jobs page expects
export function mapScrapedJob(job, i) {
  return {
    id: job.id || `${job.job_url || i}`,
    title: job.title,
    company: job.company,
    location: job.location,
    job_type: job.job_type,
    salary: job.min_amount
      ? `${job.min_amount}${job.max_amount ? ` - ${job.max_amount}` : ''}`
      : null,
    description: job.description,
    posted_at: job.date_posted,
    source_url: job.job_url,
    match_score: null,
    _min_amount: job.min_amount,
  }
}

// the recommend_jobs API returns a lighter shape — normalize it the same way
export function mapRecommendedJob(job, i) {
  return {
    id: job.id || `rec-${i}`,
    title: job.title,
    company: job.company,
    location: job.location,
    job_type: null,
    salary: null,
    description: job.description,
    posted_at: null,
    source_url: job.url,
    match_score: job.match_score ?? null,
  }
}