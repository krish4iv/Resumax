import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Spinner, Box } from '@chakra-ui/react'

const ProtectedRoutes = ({ children }) => {
  const { user, initialized } = useSelector((state) => state.auth)

  if (!initialized) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" color="blue.500" />
      </Box>
    )
  }

  return user ? children : <Navigate to="/login" />
}

export default ProtectedRoutes