import { useEffect, useState } from 'react'
import api from '../services/api.service.js'
import { Box, Heading, Text, VStack, SimpleGrid, Spinner } from '@chakra-ui/react'
import MainLayout from '../components/layout/MainLayout.jsx'
import { useSelector } from 'react-redux'
import { auth } from '../config/firebase.js'

const glassStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '16px'
}

const Dashboard = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Guard — wait for Firebase to restore currentUser
        if (!auth.currentUser) return
        const token = await auth.currentUser.getIdToken()
        const response = await api.get('/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setJobs(response.data)
      } catch (error) {
        console.error('Failed to fetch jobs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [user]) // re-fetch when user changes

  return (
    <MainLayout>
      <Box p={4}>
        <Heading>Dashboard</Heading>
        <Text>Welcome back {user?.name || user?.email}</Text>
        <SimpleGrid columns={3} spacing={4} mt={6}>
          <Box sx={glassStyle}>
            <Text color="whiteAlpha.600" fontSize="sm">Jobs Applied</Text>
            <Heading size="lg">12</Heading>
          </Box>
          <Box sx={glassStyle}>
            <Text color="whiteAlpha.600" fontSize="sm">Saved Jobs</Text>
            <Heading size="lg">5</Heading>
          </Box>
          <Box sx={glassStyle}>
            <Text color="whiteAlpha.600" fontSize="sm">Profile Views</Text>
            <Heading size="lg">48</Heading>
          </Box>
        </SimpleGrid>
        <VStack spacing={4} mt={4}>
          {loading ? (
            <Spinner />
          ) : (
            jobs.length === 0
              ? <Text color="whiteAlpha.500">No jobs found</Text>
              : jobs.map((job) => (
                <Box key={job.id} sx={glassStyle}>
                  <Heading size="md">{job.title}</Heading>
                  <Text>{job.company}</Text>
                </Box>
              ))
          )}
        </VStack>
      </Box>
    </MainLayout>
  )
}

export default Dashboard