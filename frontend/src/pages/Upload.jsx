import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { documentApi } from '../api/documentApi'
import toast from 'react-hot-toast'
import { Upload as UploadIcon, File, X, Check } from 'lucide-react'

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm()

  const visibility = watch('visibility')

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 10MB')
        return
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Chỉ hỗ trợ file PDF, DOC, DOCX, JPG, PNG')
        return
      }

      setSelectedFile(file)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
  }

  const onSubmit = async (data) => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file để upload')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('visibility', data.visibility)
      
      if (data.tags) {
        const tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        tags.forEach(tag => formData.append('tags', tag))
      }

      await documentApi.upload(formData)
      
      toast.success('Upload tài liệu thành công!')
      reset()
      setSelectedFile(null)
      navigate('/')
    } catch (error) {
      toast.error('Upload thất bại. Vui lòng thử lại.')
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload tài liệu mới</h1>
        <p className="text-gray-600">
          Chia sẻ kiến thức với đồng nghiệp bằng cách upload tài liệu mới
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* File Upload */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn file</h3>
          
          {!selectedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-3"
              >
                <UploadIcon className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Kéo thả file vào đây hoặc click để chọn
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Hỗ trợ: PDF, DOC, DOCX, JPG, PNG (tối đa 10MB)
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <File className="w-8 h-8 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Document Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài liệu</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề *
              </label>
              <input
                {...register('title', { 
                  required: 'Tiêu đề là bắt buộc',
                  minLength: { value: 3, message: 'Tiêu đề phải có ít nhất 3 ký tự' }
                })}
                type="text"
                className="input-field"
                placeholder="Nhập tiêu đề tài liệu"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả *
              </label>
              <textarea
                {...register('description', { 
                  required: 'Mô tả là bắt buộc',
                  minLength: { value: 10, message: 'Mô tả phải có ít nhất 10 ký tự' }
                })}
                rows={4}
                className="input-field resize-none"
                placeholder="Mô tả nội dung tài liệu..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                {...register('tags')}
                type="text"
                className="input-field"
                placeholder="Nhập tags cách nhau bởi dấu phẩy (ví dụ: hướng dẫn, quy trình, training)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Tags giúp tài liệu dễ tìm kiếm hơn
              </p>
            </div>

            <div>
              <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
                Quyền truy cập *
              </label>
              <select
                {...register('visibility', { required: 'Vui lòng chọn quyền truy cập' })}
                className="input-field"
              >
                <option value="PRIVATE">Riêng tư (chỉ tôi)</option>
                <option value="GROUP">Nhóm (đồng nghiệp)</option>
                <option value="PUBLIC">Công khai (mọi người)</option>
              </select>
              {errors.visibility && (
                <p className="mt-1 text-sm text-red-600">{errors.visibility.message}</p>
              )}
              
              <div className="mt-2 text-sm text-gray-600">
                {visibility === 'PRIVATE' && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <X className="w-4 h-4" />
                    <span>Chỉ bạn có thể xem tài liệu này</span>
                  </div>
                )}
                {visibility === 'GROUP' && (
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <X className="w-4 h-4" />
                    <span>Đồng nghiệp có thể xem tài liệu này</span>
                  </div>
                )}
                {visibility === 'PUBLIC' && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Check className="w-4 h-4" />
                    <span>Mọi người đều có thể xem tài liệu này</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary flex-1"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Đang upload...</span>
              </div>
            ) : (
              'Upload tài liệu'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Upload
