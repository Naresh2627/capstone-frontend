import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PenTool, User, LogOut, Home, Plus } from 'lucide-react'

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <PenTool className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">BlogApp</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/create-post" 
                  className="flex items-center space-x-1 btn btn-primary"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Post</span>
                </Link>
                
                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {user?.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {user?.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar