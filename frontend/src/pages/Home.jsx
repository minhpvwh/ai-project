import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { homeApi } from '../api/homeApi'
import DocumentCard from '../components/DocumentCard'
import { FileText, TrendingUp, Clock, User } from 'lucide-react'
import toast from 'react-hot-toast'

const Home = () => {
  const [dashboardData, setDashboardData] = useState({
    recentDocuments: [],
    popularDocuments: [],
    myRecentDocuments: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const data = await homeApi.getDashboard()
      setDashboardData(data)
    } catch (error) {
      toast.error('Không thể tải dữ liệu trang chủ')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Chào mừng đến với Knowledge Hub</h1>
        <p className="text-primary-100">
          Nền tảng chia sẻ kiến thức nội bộ của công ty. Tìm kiếm, chia sẻ và học hỏi cùng đồng nghiệp.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {dashboardData.recentDocuments.length}
          </h3>
          <p className="text-sm text-gray-600">Tài liệu mới</p>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {dashboardData.popularDocuments.length}
          </h3>
          <p className="text-sm text-gray-600">Tài liệu nổi bật</p>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3">
            <User className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {dashboardData.myRecentDocuments.length}
          </h3>
          <p className="text-sm text-gray-600">Tài liệu của tôi</p>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">24/7</h3>
          <p className="text-sm text-gray-600">Truy cập mọi lúc</p>
        </div>
      </div>

      {/* Recent Documents */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Tài liệu mới nhất</h2>
          </div>
          <Link
            to="/search"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Xem tất cả →
          </Link>
        </div>
        
        {dashboardData.recentDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.recentDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có tài liệu nào</p>
          </div>
        )}
      </section>

      {/* Popular Documents */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Tài liệu nổi bật</h2>
          </div>
          <Link
            to="/search"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Xem tất cả →
          </Link>
        </div>
        
        {dashboardData.popularDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.popularDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có tài liệu nổi bật nào</p>
          </div>
        )}
      </section>

      {/* My Recent Documents */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Tài liệu của tôi</h2>
          </div>
          <Link
            to="/search?my=true"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Xem tất cả →
          </Link>
        </div>
        
        {dashboardData.myRecentDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.myRecentDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Bạn chưa upload tài liệu nào</p>
            <Link to="/upload" className="btn-primary">
              Upload tài liệu đầu tiên
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
