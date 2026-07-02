import { Input, Select, SimpleGrid, Box } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import MainLayout from '../components/layout/MainLayout.jsx'

const Jobs = () => {
  const [search, setSearch] = useState('')
  const [jobType, setJobType] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs()
    }, 500)
    return () => clearTimeout(timer)
  }, [search, jobType])

  const fetchJobs = () => {
    console.log('Fetching jobs...', search, jobType)
  }

  return (
    <MainLayout>
      <Box p={4}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Input placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select placeholder="Job Type" value={jobType} onChange={(e) => setJobType(e.target.value)}>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
          </Select>
        </SimpleGrid>
      </Box>
    </MainLayout>
  )
}

export default Jobs