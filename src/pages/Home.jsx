import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { postsAPI } from '../services/api'
import { formatDistanceToNow } from 'date-fns'
import { Search, User, Calendar, Eye } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const Home = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useQuery(
    ['posts', { page, search }],
    async () => {
      console.log('React Query: Fetching posts...')
      try {
        const result = await postsAPI.getAllPosts({ page, limit: 10, search })
        console.log('React Query: Posts fetched successfully:', result)
        return result
      } catch (err) {
        console.error('React Query: Error fetching posts:', err)
        throw err
      }
    },
    {
      keepPreviousData: true,
      onError: (err) => {
        console.error('React Query onError:', err)
      }
    }
  )

  const posts = data?.data?.posts || []
  const pagination = data?.data?.pagination

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
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
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to BlogApp
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover amazing stories and share your own thoughts with the world
        </p>
        
        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 pr-4"
            />
          </div>
        </form>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No posts found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {post.users?.avatar_url ? (
                    <img 
                      src={post.users.avatar_url} 
                      alt={post.users.name}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{post.users?.name}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>

              <Link to={`/post/${post.id}`} className="block group">
                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.content.substring(0, 200)}...
                </p>
              </Link>

              <div className="flex items-center justify-between">
                <Link 
                  to={`/post/${post.id}`}
                  className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Read more
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
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
      )}
    </div>
  )
}

export default Home