import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Home() {
  const { profile, signOut } = useAuth()

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      background: '#f5f5f5'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem',
          padding: '1.5rem',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1a1a1a',
              margin: 0
            }}>
              Welcome, {profile?.username || 'User'}
            </h1>
            <p style={{
              margin: '0.25rem 0 0 0',
              color: '#666',
              fontSize: '0.875rem'
            }}>
              Role: {profile?.role}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {profile?.role === 'admin' && (
              <Link
                to="/admin"
                style={{
                  padding: '0.5rem 1rem',
                  background: '#1a1a1a',
                  color: 'white',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Admin Panel
              </Link>
            )}
            <button
              onClick={signOut}
              style={{
                padding: '0.5rem 1rem',
                background: 'white',
                color: '#1a1a1a',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        <main style={{
          padding: '2rem',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '1rem'
          }}>
            Dashboard
          </h2>
          <p style={{
            color: '#666',
            lineHeight: '1.6'
          }}>
            This is your main dashboard. You have successfully logged in to the application.
          </p>
        </main>
      </div>
    </div>
  )
}
