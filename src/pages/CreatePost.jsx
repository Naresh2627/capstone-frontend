import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation } from 'react-query'
import { postsAPI } from '../services/api'
import { Save, Eye } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const schema = yup.object({
  title: yup.string().min(1, 'Title is required').max(200, 'Title too long').required(),
  content: yup.string().min(1, 'Content is required').required()
})

const CreatePost = () => {
  const [isPublished, setIsPublished] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    resolver: yupResolver(schema)
  })

  const createPostMutation = useMutation(postsAPI.createPost, {
    onSuccess: (response) => {
      toast.success('Post created successfully!')
      navigate('/dashboard')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create post')
    }
  })

  const onSubmit = (data) => {
    createPostMutation.mutate({
      ...data,
      published: isPublished
    })
  }

  const watchedContent = watch('content', '')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
        <p className="text-gray-600 mt-1">Share your thoughts with the world</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6">
          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Post Title
            </label>
            <input
              {...register('title')}
              type="text"
              className={`input ${errors.title ? 'border-red-500' : ''}`}
              placeholder="Enter an engaging title for your post..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              {...register('content')}
              rows={15}
              className={`input resize-none ${errors.content ? 'border-red-500' : ''}`}
              placeholder="Write your post content here..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {watchedContent.length} characters
            </p>
          </div>

          {/* Publish Toggle */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                Publish immediately
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {isPublished 
                ? 'Your post will be visible to everyone immediately' 
                : 'Save as draft - you can publish it later'
              }
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            Cancel
          </button>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={createPostMutation.isLoading}
              className="btn btn-primary flex items-center space-x-2"
            >
              {createPostMutation.isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  {isPublished ? <Eye className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  <span>{isPublished ? 'Publish Post' : 'Save Draft'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreatePost