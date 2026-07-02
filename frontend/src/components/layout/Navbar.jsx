import { Flex, Box, Text, Button, HStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slice/authThunks.js'

const Navbar = () => {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    
    const handleLogout = () => {
        dispatch(logoutUser())
    }
    
    return (
        <Flex justify="space-between" align="center" p={4} position="sticky" top={0} zIndex={100} px={8} py={4}
  sx={{
    background: 'rgba(10, 10, 15, 0.8)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  }} color="white">
            <Box>
                <Text fontSize="xl" fontWeight="bold" className="gradient-text">Resumax</Text>
            </Box>
            <HStack spacing={4}>
                {user ? (
                    <>
                        <Button as={RouterLink} to="/dashboard" variant="glass">Dashboard</Button>
                        <Button as={RouterLink} to="/jobs" variant="glass">Jobs</Button>
                        <Text fontSize="sm" color="whiteAlpha.600">{user.email}</Text>
                        <Button onClick={handleLogout} variant="glass">Logout</Button>
                    </>
                    ) : (
                    <>
                        <Button as={RouterLink} to="/login" variant="glass">Login</Button>
                        <Button as={RouterLink} to="/register" variant="glass">Register</Button>
                    </>
                    )}
            </HStack>
        </Flex>
    )
}

export default Navbar