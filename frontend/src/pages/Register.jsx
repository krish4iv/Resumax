import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../store/slice/authThunks.js'
import { useState } from 'react'
import { Box, Button, Input, FormControl, FormLabel, VStack, Text, Heading } from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/auth.layout.jsx'

const Register = () => {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.auth)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const result = async () => {
    const response = await dispatch(registerUser({ email, password, name }))
    if (registerUser.fulfilled.match(response)) {
      navigate('/dashboard')
    } else {
      console.log('Register failed', response.payload)
    }
  }

  return (
    <AuthLayout>
      <Box as="form" onSubmit={(e) => { e.preventDefault(); result() }}>
        <Heading size="lg" mb={2}>Create account</Heading>
        <Text color="whiteAlpha.500" mb={6} fontSize="sm">Get started for free</Text>

        {error && (
          <Box bg="rgba(245,101,101,0.1)" border="1px solid rgba(245,101,101,0.3)" borderRadius="xl" p={3} mb={4}>
            <Text color="red.300" fontSize="sm">{error}</Text>
          </Box>
        )}

        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel color="whiteAlpha.700" fontSize="sm">Name</FormLabel>
            <Input variant="glass" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel color="whiteAlpha.700" fontSize="sm">Email</FormLabel>
            <Input variant="glass" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel color="whiteAlpha.700" fontSize="sm">Password</FormLabel>
            <Input variant="glass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>

          <Button type="submit" variant="solid" isLoading={loading} mt={2}>
            Register
          </Button>

          <Text color="whiteAlpha.500" fontSize="sm" textAlign="center">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4d97ff', fontWeight: 500 }}>Login</Link>
          </Text>
        </VStack>
      </Box>
    </AuthLayout>
  )
}

export default Register