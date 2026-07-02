import { useState } from 'react'
import { Box, Button, Input, FormControl, FormLabel, VStack, Text, Heading } from '@chakra-ui/react'
import { useSelector, useDispatch } from 'react-redux'
import { loginUser } from '../store/slice/authThunks.js'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/auth.layout.jsx'

const Login = () => {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const result = async () => {
    if (!email || !password) return

    const response = await dispatch(loginUser({ email, password }))
    if (loginUser.fulfilled.match(response)) {
      navigate('/dashboard')
      console.log('Login successful', response.payload)
    } else {
      console.log('Login failed', response.payload)
    }
  }

  return (
    <AuthLayout>
      <Box as="form" onSubmit={(e) => { e.preventDefault(); result() }}>
        <Heading size="lg" mb={2}>Welcome back</Heading>
        <Text color="whiteAlpha.500" mb={6} fontSize="sm">Sign in to continue</Text>

        {error && (
          <Box bg="rgba(245,101,101,0.1)" border="1px solid rgba(245,101,101,0.3)" borderRadius="xl" p={3} mb={4}>
            <Text color="red.300" fontSize="sm">{error}</Text>
          </Box>
        )}

        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel color="whiteAlpha.700" fontSize="sm">Email</FormLabel>
            <Input variant="glass" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel color="whiteAlpha.700" fontSize="sm">Password</FormLabel>
            <Input variant="glass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>

          <Button type="submit" variant="solid" isLoading={loading} mt={2}>
            Login
          </Button>

          <Text color="whiteAlpha.500" fontSize="sm" textAlign="center">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#4d97ff', fontWeight: 500 }}>Register</Link>
          </Text>
        </VStack>
      </Box>
    </AuthLayout>
  )
}

export default Login