import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { documentApi } from '../api/documentApi'
import { commentApi } from '../api/commentApi'
import { ratingApi } from '../api/ratingApi'
import { useAuthStore } from '../stores/authStore'
import CommentBox from '../components/CommentBox'
import RatingStars from '../components/RatingStars'
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  Tag, 
  Star,
  Edit,
  Trash2,
  FileText
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import toast from 'react-hot-toast'

const DocumentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [document, setDocument] = useState(null)
  const [comments, setComments] = useState([])
  const [userRating, setUserRating] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    fetchDocumentDetails()
    fetchComments()
    fetchUserRating()
  }, [id])

  const fetchDocumentDetails = async () => {
    try {
      const data = await documentApi.getById(id)
      setDocument(data)
      setIsOwner(data.ownerId === user?.username)
    } catch (error) {
      toast.error('Không thể tải thông tin tài liệu')
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await commentApi.getByDocument(id)
      setComments(response.content)
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const fetchUserRating = async () => {
    try {
      const data = await ratingApi.getUserRating(id)
      setUserRating(data.hasRating ? data.score : null)
    } catch (error) {
      console.error('Error fetching user rating:', error)
    }
  }

  const handleRatingChange = async (rating) => {
    try {
      await ratingApi.addOrUpdateRating(id, rating)
      setUserRating(rating)
      toast.success('Đánh giá đã được cập nhật')
      // Refresh document to get updated rating
      fetchDocumentDetails()
    } catch (error) {
      toast.error('Không thể cập nhật đánh giá')
    }
  }

  const handleCommentAdded = async (documentId, content) => {
    await commentApi.add(documentId, content)
    fetchComments()
  }

  const handleCommentUpdated = async (commentId, content) => {
    await commentApi.update(commentId, content)
    fetchComments()
  }

  const handleCommentDeleted = async (commentId) => {
    await commentApi.delete(commentId)
    fetchComments()
  }

  const handleDownload = async () => {
    try {
      const data = await documentApi.download(id)
      // In a real app, you would handle file download here
      toast.success('Tải file thành công')
    } catch (error) {
      toast.error('Không thể tải file')
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc muốn xóa tài liệu này?')) {
      try {
        await documentApi.delete(id)
        toast.success('Tài liệu đã được xóa')
        navigate('/')
      } catch (error) {
        toast.error('Không thể xóa tài liệu')
      }
    }
  }

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tài liệu không tồn tại</h3>
        <p className="text-gray-500 mb-4">Tài liệu bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Về trang chủ
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{document.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <User size={16} />
                <span>{document.ownerName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar size={16} />
                <span>
                  {formatDistanceToNow(new Date(document.createdAt), { 
                    addSuffix: true, 
                    locale: vi 
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye size={16} />
                <span>{document.viewCount} lượt xem</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getVisibilityColor(document.visibility)}`}>
              {getVisibilityText(document.visibility)}
            </span>
            
            {isOwner && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(`/edit/${id}`)}
                  className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="Xóa"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mô tả</h2>
            <p className="text-gray-700 leading-relaxed">{document.description}</p>
          </div>

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full"
                  >
                    <Tag size={14} className="mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <CommentBox
            documentId={id}
            comments={comments}
            onCommentAdded={handleCommentAdded}
            onCommentUpdated={handleCommentUpdated}
            onCommentDeleted={handleCommentDeleted}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* File Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin file</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tên file:</span>
                <span className="text-sm font-medium text-gray-900">{document.fileName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Loại file:</span>
                <span className="text-sm font-medium text-gray-900">{document.fileType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Kích thước:</span>
                <span className="text-sm font-medium text-gray-900">{formatFileSize(document.fileSize)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ngày tạo:</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(document.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleDownload}
              className="btn-primary w-full mt-4"
            >
              <Download className="w-4 h-4 mr-2" />
              Tải xuống
            </button>
          </div>

          {/* Rating */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Đánh giá</h3>
            
            <div className="text-center mb-4">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-2xl font-bold text-gray-900">
                  {document.averageRating.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {document.totalRatings} đánh giá
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Đánh giá của bạn:</p>
              <RatingStars
                rating={userRating || 0}
                onRatingChange={handleRatingChange}
                interactive={true}
                size="lg"
              />
            </div>
          </div>

          {/* Summary */}
          {document.summary && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{document.summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentDetail
