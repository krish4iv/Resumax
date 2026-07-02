import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Spinner, Box } from '@chakra-ui/react'

const ProtectedRoutes = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth)
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    )
  }
  
  return user ? children : <Navigate to="/login" />
}

export default ProtectedRoutes