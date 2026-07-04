import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import { useSelector } from 'react-redux'
import { theme } from '../../theme/index.js'

const MainLayout = ({ children }) => {
  const { isDark } = useSelector((state) => state.theme)

  return (
    <div className={theme.pageBg}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area — offset by sidebar width */}
      <div className="ml-64">
        {/* Navbar */}
        <Navbar />

        {/* Page content — offset by navbar height */}
        <main className="pt-16 p-6 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout