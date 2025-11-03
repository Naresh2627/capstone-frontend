import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { postsAPI } from '../services/api'
import { formatDistanceToNow } from 'date-fns'
import { Calendar, User, ArrowLeft } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const PostDetail = () => {
  const { id } = useParams()

  const { data, isLoading, error } = useQuery(
    ['post', id],
    () => postsAPI.getPost(id),
    {
      enabled: !!id
    }
  )

  const post = data?.data?.post

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
        <p className="text-gray-600 mb-6">The post you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to posts
        </Link>
      </div>

      {/* Post Content */}
      <article className="card p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              {post.users?.avatar_url ? (
                <img 
                  src={post.users.avatar_url} 
                  alt={post.users.name}
                  className="h-12 w-12 rounded-full"
                />
              ) : (
                <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
              )}
              <div>
                <Link 
                  to={`/profile/${post.users?.id}`}
                  className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
                >
                  {post.users?.name}
                </Link>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  Published {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  {post.updated_at !== post.created_at && (
                    <span className="ml-2">
                      • Updated {formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {post.content}
          </div>
        </div>
      </article>

      {/* Related Actions */}
      <div className="mt-8 text-center">
        <Link 
          to="/" 
          className="btn btn-secondary"
        >
          Read More Posts
        </Link>
      </div>
    </div>
  )
}

export default PostDetail