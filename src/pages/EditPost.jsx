import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useQuery, useMutation } from 'react-query'
import { postsAPI } from '../services/api'
import { Save } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const schema = yup.object({
  title: yup.string().min(1, 'Title is required').max(200, 'Title too long').required(),
  content: yup.string().min(1, 'Content is required').required()
})

const EditPost = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isPublished, setIsPublished] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(schema)
  })

  // Fetch post data
  const { data, isLoading, error } = useQuery(
    ['user-posts', id],
    () => postsAPI.getPost(id),
    {
      enabled: !!id,
      onSuccess: (response) => {
        const post = response.data.post
        setValue('title', post.title)
        setValue('content', post.content)
        setIsPublished(post.published)
      }
    }
  )

  const updatePostMutation = useMutation(
    (postData) => postsAPI.updatePost(id, postData),
    {
      onSuccess: () => {
        toast.success('Post updated successfully!')
        navigate('/dashboard')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update post')
      }
    }
  )

  const onSubmit = (data) => {
    updatePostMutation.mutate({
      ...data,
      published: isPublished
    })
  }

  const watchedContent = watch('content', '')

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading post. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
        <p className="text-gray-600 mt-1">Update your post content</p>
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
                Published
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {isPublished 
                ? 'Your post is visible to everyone' 
                : 'Post is saved as draft'
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
              disabled={updatePostMutation.isLoading}
              className="btn btn-primary flex items-center space-x-2"
            >
              {updatePostMutation.isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Update Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EditPost