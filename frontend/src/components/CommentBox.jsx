import { useState } from 'react'
import { Send, MessageCircle, User, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import toast from 'react-hot-toast'

const CommentBox = ({ 
  documentId, 
  comments = [], 
  onCommentAdded, 
  onCommentUpdated, 
  onCommentDeleted 
}) => {
  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await onCommentAdded(documentId, newComment.trim())
      setNewComment('')
      toast.success('Bình luận đã được thêm')
    } catch (error) {
      toast.error('Không thể thêm bình luận')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return

    try {
      await onCommentUpdated(commentId, editContent.trim())
      setEditingComment(null)
      setEditContent('')
      toast.success('Bình luận đã được cập nhật')
    } catch (error) {
      toast.error('Không thể cập nhật bình luận')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Bạn có chắc muốn xóa bình luận này?')) {
      try {
        await onCommentDeleted(commentId)
        toast.success('Bình luận đã được xóa')
      } catch (error) {
        toast.error('Không thể xóa bình luận')
      }
    }
  }

  const startEdit = (comment) => {
    setEditingComment(comment.id)
    setEditContent(comment.content)
  }

  const cancelEdit = () => {
    setEditingComment(null)
    setEditContent('')
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Bình luận ({comments.length})
        </h3>
      </div>

      {/* Add new comment */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              className="input-field resize-none h-20"
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="btn-primary self-end disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
              {editingComment === comment.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="input-field resize-none h-20"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      className="btn-primary text-sm"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="btn-secondary text-sm"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {comment.authorName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>
                        {formatDistanceToNow(new Date(comment.createdAt), { 
                          addSuffix: true, 
                          locale: vi 
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{comment.content}</p>
                  
                  {comment.updatedAt !== comment.createdAt && (
                    <p className="text-xs text-gray-500 mb-2">
                      Đã chỉnh sửa {formatDistanceToNow(new Date(comment.updatedAt), { 
                        addSuffix: true, 
                        locale: vi 
                      })}
                    </p>
                  )}
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(comment)}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CommentBox
