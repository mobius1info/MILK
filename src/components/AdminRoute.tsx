import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profile?.role !== 'admin') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '1rem'
      }}>
        <h1>Access Denied</h1>
        <p>You do not have permission to access this page.</p>
        <a href="/" style={{ color: '#007bff' }}>Go to Home</a>
      </div>
    )
  }

  return <>{children}</>
}
