import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { documentApi } from '../api/documentApi'
import DocumentCard from '../components/DocumentCard'
import { Search as SearchIcon, Filter, X } from 'lucide-react'
import toast from 'react-hot-toast'

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    tags: searchParams.get('tags') || '',
    visibility: searchParams.get('visibility') || '',
    my: searchParams.get('my') === 'true'
  })

  useEffect(() => {
    if (searchParams.get('q') || searchParams.get('my') === 'true') {
      handleSearch()
    }
  }, [])

  const handleSearch = async (page = 0, append = false) => {
    setIsLoading(true)
    try {
      const params = {
        page,
        size: 12
      }

      if (filters.q.trim()) {
        params.q = filters.q.trim()
      }

      if (filters.tags.trim()) {
        params.tags = filters.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }

      if (filters.visibility) {
        params.visibility = filters.visibility
      }

      const response = filters.my 
        ? await documentApi.getMyDocuments(page, 12)
        : await documentApi.search(params)

      if (append) {
        setDocuments(prev => [...prev, ...response.content])
      } else {
        setDocuments(response.content)
      }

      setCurrentPage(response.number)
      setTotalPages(response.totalPages)
      setHasMore(!response.last)
    } catch (error) {
      toast.error('Không thể tìm kiếm tài liệu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setCurrentPage(0)
    updateSearchParams()
    handleSearch(0, false)
  }

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      handleSearch(currentPage + 1, true)
    }
  }

  const updateSearchParams = () => {
    const newParams = new URLSearchParams()
    
    if (filters.q.trim()) newParams.set('q', filters.q.trim())
    if (filters.tags.trim()) newParams.set('tags', filters.tags.trim())
    if (filters.visibility) newParams.set('visibility', filters.visibility)
    if (filters.my) newParams.set('my', 'true')

    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setFilters({
      q: '',
      tags: '',
      visibility: '',
      my: false
    })
    setSearchParams({})
    setDocuments([])
  }

  const hasActiveFilters = filters.q || filters.tags || filters.visibility || filters.my

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {filters.my ? 'Tài liệu của tôi' : 'Tìm kiếm tài liệu'}
        </h1>
        <p className="text-gray-600">
          {filters.my 
            ? 'Quản lý và xem tất cả tài liệu bạn đã upload'
            : 'Tìm kiếm tài liệu theo tiêu đề, tags hoặc nội dung'
          }
        </p>
      </div>

      {/* Search Form */}
      <div className="card mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={filters.q}
                  onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
                  placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                  className="input-field pl-10"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary px-6"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Tìm kiếm'
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                value={filters.tags}
                onChange={(e) => setFilters(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="Nhập tags cách nhau bởi dấu phẩy"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quyền truy cập
              </label>
              <select
                value={filters.visibility}
                onChange={(e) => setFilters(prev => ({ ...prev, visibility: e.target.value }))}
                className="input-field"
              >
                <option value="">Tất cả</option>
                <option value="PUBLIC">Công khai</option>
                <option value="GROUP">Nhóm</option>
                <option value="PRIVATE">Riêng tư</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="btn-secondary w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {documents.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Tìm thấy {documents.length} tài liệu
              </p>
              {hasActiveFilters && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Filter className="w-4 h-4" />
                  <span>Đang áp dụng bộ lọc</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Đang tải...</span>
                    </div>
                  ) : (
                    'Tải thêm'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="card text-center py-12">
            <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filters.my ? 'Chưa có tài liệu nào' : 'Không tìm thấy tài liệu'}
            </h3>
            <p className="text-gray-500 mb-4">
              {filters.my 
                ? 'Bạn chưa upload tài liệu nào. Hãy bắt đầu chia sẻ kiến thức!'
                : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
              }
            </p>
            {filters.my ? (
              <a href="/upload" className="btn-primary">
                Upload tài liệu đầu tiên
              </a>
            ) : (
              <button
                onClick={clearFilters}
                className="btn-secondary"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
