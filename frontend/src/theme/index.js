import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: '#0a0a0f',
        color: '#e2e8f0',
        minHeight: '100vh',
      },
      '*': {
        boxSizing: 'border-box',
      },
      '::-webkit-scrollbar': {
        width: '6px',
      },
      '::-webkit-scrollbar-track': {
        bg: '#0a0a0f',
      },
      '::-webkit-scrollbar-thumb': {
        bg: 'rgba(255,255,255,0.15)',
        borderRadius: '3px',
      },
    },
  },
  colors: {
    brand: {
      50:  '#e8f4ff',
      100: '#c3ddff',
      200: '#9cc6ff',
      300: '#74aeff',
      400: '#4d97ff',
      500: '#2563eb',  // primary blue
      600: '#1d4ed8',
      700: '#1e40af',
      800: '#1e3a8a',
      900: '#172554',
    },
    glass: {
      bg:     'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 255, 255, 0.10)',
      hover:  'rgba(255, 255, 255, 0.08)',
    },
  },
  fonts: {
    heading: `'Inter', sans-serif`,
    body:    `'Inter', sans-serif`,
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 600,
        borderRadius: 'xl',
      },
      variants: {
        glass: {
          bg: 'rgba(255,255,255,0.08)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(10px)',
          _hover: {
            bg: 'rgba(255,255,255,0.15)',
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 25px rgba(37,99,235,0.3)',
          },
          _active: { transform: 'translateY(0)' },
          transition: 'all 0.2s ease',
        },
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 25px rgba(37,99,235,0.4)',
          },
          transition: 'all 0.2s ease',
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          borderRadius: '2xl',
          transition: 'all 0.2s ease',
          _hover: {
            border: '1px solid rgba(37,99,235,0.4)',
            transform: 'translateY(-2px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          },
        },
      },
    },
    Input: {
      variants: {
        glass: {
          field: {
            bg: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 'xl',
            color: 'white',
            _placeholder: { color: 'whiteAlpha.400' },
            _focus: {
              border: '1px solid',
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px #2563eb',
              bg: 'rgba(255,255,255,0.08)',
            },
          },
        },
      },
    },
  },
})

export default theme