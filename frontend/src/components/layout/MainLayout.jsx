import Sidebar from "./Sidebar"
import { useSelector } from 'react-redux'

const MainLayout = ({ children }) => {
  const { sidebarCollapsed } = useSelector(state => state.theme)

  return (
    <div className="min-h-screen bg-[#05060c]">
      <Sidebar />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[76px]' : 'ml-64'}`}>
        <main className="p-6 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout