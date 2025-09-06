import { Link, useLocation } from 'react-router-dom'
import { Home, Upload, Search, FileText, User } from 'lucide-react'
import clsx from 'clsx'

const Sidebar = () => {
  const location = useLocation()

  const menuItems = [
    { path: '/', label: 'Trang chủ', icon: Home },
    { path: '/upload', label: 'Upload tài liệu', icon: Upload },
    { path: '/search', label: 'Tìm kiếm', icon: Search },
  ]

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
