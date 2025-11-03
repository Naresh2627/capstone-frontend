import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { postsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery(
    ['user-posts', page],
    () => postsAPI.getUserPosts({ page, limit: 10 }),
    {
      keepPreviousData: true
    }
  )

  const deletePostMutation = useMutation(postsAPI.deletePost, {
    onSuccess: () => {
      queryClient.invalidateQueries(['user-posts'])
      toast.success('Post deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete post')
    }
  })

  const togglePublishMutation = useMutation(postsAPI.togglePublish, {
    onSuccess: () => {
      queryClient.invalidateQueries(['user-posts'])
      toast.success('Post status updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update post')
    }
  })

  const posts = data?.data?.posts || []
  const pagination = data?.data?.pagination

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate(postId)
    }
  }

  const handleTogglePublish = (postId) => {
    togglePublishMutation.mutate(postId)
  }

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
        <p className="text-red-600">Error loading posts. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
        </div>
        <Link to="/create-post" className="btn btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Post</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Posts</h3>
          <p className="text-3xl font-bold text-primary-600">{pagination?.total || 0}</p>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Published</h3>
          <p className="text-3xl font-bold text-green-600">
            {posts.filter(post => post.published).length}
          </p>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Drafts</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {posts.filter(post => !post.published).length}
          </p>
        </div>
      </div>

      {/* Posts List */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Posts</h2>
        </div>

        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 mb-4">You haven't created any posts yet.</p>
            <Link to="/create-post" className="btn btn-primary">
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {post.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        post.published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {post.content.substring(0, 150)}...
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      Created {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      {post.updated_at !== post.created_at && (
                        <span className="ml-2">
                          • Updated {formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {post.published && (
                      <Link
                        to={`/post/${post.id}`}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View post"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    )}
                    
                    <button
                      onClick={() => handleTogglePublish(post.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title={post.published ? 'Unpublish' : 'Publish'}
                      disabled={togglePublishMutation.isLoading}
                    >
                      {post.published ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>

                    <Link
                      to={`/edit-post/${post.id}`}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      title="Edit post"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>

                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete post"
                      disabled={deletePostMutation.isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="flex items-center px-4 py-2 text-gray-700">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard