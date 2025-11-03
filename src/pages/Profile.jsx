import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { usersAPI } from '../services/api'
import { formatDistanceToNow } from 'date-fns'
import { Calendar, User, FileText } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const Profile = () => {
  const { id } = useParams()

  const { data: userData, isLoading: userLoading } = useQuery(
    ['user', id],
    () => usersAPI.getUser(id),
    {
      enabled: !!id
    }
  )

  const { data: postsData, isLoading: postsLoading } = useQuery(
    ['user-posts', id],
    () => usersAPI.getUserPosts(id, { page: 1, limit: 10 }),
    {
      enabled: !!id
    }
  )

  const user = userData?.data?.user
  const posts = postsData?.data?.posts || []

  if (userLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h2>
        <p className="text-gray-600">The user profile you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="card p-8 mb-8">
        <div className="flex items-start space-x-6">
          {user.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.name}
              className="h-24 w-24 rounded-full"
            />
          ) : (
            <div className="h-24 w-24 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-gray-600" />
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
            
            <div className="flex items-center text-gray-600 mb-4">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</span>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center text-gray-600">
                <FileText className="h-4 w-4 mr-1" />
                <span>{user.postsCount || 0} posts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Posts</h2>
        </div>

        {postsLoading ? (
          <div className="p-12 text-center">
            <LoadingSpinner size="md" />
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No posts published yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post.id} className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {post.content.substring(0, 150)}...
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile