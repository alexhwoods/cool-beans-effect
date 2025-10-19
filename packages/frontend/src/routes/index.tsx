import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Route as RouteIcon,
  Server,
  Shield,
  Sparkles,
  UserPlus,
  Users,
  Waves,
  Zap,
} from 'lucide-react'
import { Effect } from 'effect'
import { listUsers } from '../rpc-client'
import type { User } from '@collector/shared'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [users, setUsers] = useState<Array<User>>([])
  const [loading, setLoading] = useState(true)

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await listUsers()
      setUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const features = [
    {
      icon: <Zap className="w-12 h-12 text-cyan-400" />,
      title: 'Powerful Server Functions',
      description:
        'Write server-side code that seamlessly integrates with your client components. Type-safe, secure, and simple.',
    },
    {
      icon: <Server className="w-12 h-12 text-cyan-400" />,
      title: 'Flexible Server Side Rendering',
      description:
        'Full-document SSR, streaming, and progressive enhancement out of the box. Control exactly what renders where.',
    },
    {
      icon: <RouteIcon className="w-12 h-12 text-cyan-400" />,
      title: 'API Routes',
      description:
        'Build type-safe API endpoints alongside your application. No separate backend needed.',
    },
    {
      icon: <Shield className="w-12 h-12 text-cyan-400" />,
      title: 'Strongly Typed Everything',
      description:
        'End-to-end type safety from server to client. Catch errors before they reach production.',
    },
    {
      icon: <Waves className="w-12 h-12 text-cyan-400" />,
      title: 'Full Streaming Support',
      description:
        'Stream data from server to client progressively. Perfect for AI applications and real-time updates.',
    },
    {
      icon: <Sparkles className="w-12 h-12 text-cyan-400" />,
      title: 'Next Generation Ready',
      description:
        'Built from the ground up for modern web applications. Deploy anywhere JavaScript runs.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>
        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-6 mb-6">
            <img
              src="/tanstack-circle-logo.png"
              alt="TanStack Logo"
              className="w-24 h-24 md:w-32 md:h-32"
            />
            <h1 className="text-6xl md:text-7xl font-bold text-white">
              <span className="text-gray-300">TANSTACK</span>{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                START
              </span>
            </h1>
          </div>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
            With Effect RPC Integration
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
            Full-stack framework powered by TanStack Router for React and Solid.
            Build modern applications with server functions, streaming, and type
            safety. Now featuring Effect RPC for type-safe backend
            communication.
          </p>
          <div className="flex flex-col items-center gap-4">
            <a
              href="https://tanstack.com/start"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50"
            >
              Documentation
            </a>
            <p className="text-gray-400 text-sm mt-2">
              Begin your TanStack Start journey by editing{' '}
              <code className="px-2 py-1 bg-slate-700 rounded text-cyan-400">
                /src/routes/index.tsx
              </code>
            </p>
          </div>
        </div>
      </section>

      {/* Effect RPC Demo Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-500/30 rounded-2xl p-8 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-purple-400" />
            <h2 className="text-3xl font-bold text-white">
              Effect RPC Live Demo
            </h2>
          </div>
          <p className="text-gray-300 mb-8">
            This demo showcases type-safe RPC communication between the TanStack
            Start frontend and an Effect-powered backend. All requests use
            Effect Schema for validation and type safety.
          </p>

          {/* Create User Form */}
          <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-semibold text-white">
                Create New User
              </h3>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-slate-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Users List</h3>
              <button
                onClick={loadUsers}
                disabled={loading}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            {loading ? (
              <p className="text-gray-400">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-gray-400">No users found.</p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-cyan-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">
                        ID: {user.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
