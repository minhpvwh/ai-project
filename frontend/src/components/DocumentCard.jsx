import { Link } from 'react-router-dom'
import { Calendar, User, Eye, Star, Tag } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const DocumentCard = ({ document }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getVisibilityColor = (visibility) => {
    switch (visibility) {
      case 'PUBLIC':
        return 'bg-green-100 text-green-800'
      case 'GROUP':
        return 'bg-yellow-100 text-yellow-800'
      case 'PRIVATE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getVisibilityText = (visibility) => {
    switch (visibility) {
      case 'PUBLIC':
        return 'Công khai'
      case 'GROUP':
        return 'Nhóm'
      case 'PRIVATE':
        return 'Riêng tư'
      default:
        return visibility
    }
  }

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {document.title}
        </h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getVisibilityColor(document.visibility)}`}>
          {getVisibilityText(document.visibility)}
        </span>
      </div>

      {document.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {document.description}
        </p>
      )}

      {document.tags && document.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {document.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
            >
              <Tag size={12} className="mr-1" />
              {tag}
            </span>
          ))}
          {document.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{document.tags.length - 3} khác</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <User size={14} />
            <span>{document.ownerName}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>
              {formatDistanceToNow(new Date(document.createdAt), { 
                addSuffix: true, 
                locale: vi 
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Eye size={14} />
          <span>{document.viewCount}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Star size={16} className="text-yellow-400 fill-current" />
          <span className="text-sm font-medium text-gray-700">
            {document.averageRating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">
            ({document.totalRatings} đánh giá)
          </span>
        </div>
        
        <div className="text-xs text-gray-500">
          {formatFileSize(document.fileSize)}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          to={`/document/${document.id}`}
          className="btn-primary w-full text-center block"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  )
}

export default DocumentCard
