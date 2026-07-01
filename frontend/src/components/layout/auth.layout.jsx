import { Box } from '@chakra-ui/react'

const AuthLayout = ({ children }) => {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
      bgGradient="linear(to-br, gray.900, purple.900, gray.900)"
      px={4}
    >
      {/* Ambient glow orbs */}
      <Box
        position="absolute"
        top="-10%"
        left="-10%"
        w="500px"
        h="500px"
        borderRadius="full"
        bg="purple.500"
        filter="blur(150px)"
        opacity={0.25}
      />
      <Box
        position="absolute"
        bottom="-10%"
        right="-10%"
        w="500px"
        h="500px"
        borderRadius="full"
        bg="blue.500"
        filter="blur(150px)"
        opacity={0.25}
      />

      {/* Glass card */}
      <Box
        position="relative"
        zIndex={1}
        bg="rgba(255, 255, 255, 0.05)"
        backdropFilter="blur(20px) saturate(180%)"
        border="1px solid rgba(255, 255, 255, 0.1)"
        borderRadius="20px"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.37)"
        padding="40px"
        width="400px"
        maxW="90vw"
      >
        {children}
      </Box>
    </Box>
  )
}

export default AuthLayout