import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, user } = useAuth()
  const navigate = useNavigate()

  if (user) {
    navigate('/')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(username, password, rememberMe)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: '#f5f5f5'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'white',
        padding: '2.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: '600',
          marginBottom: '2rem',
          color: '#1a1a1a',
          textAlign: 'center'
        }}>
          Sign In
        </h2>

        {error && (
          <div style={{
            padding: '0.75rem',
            background: '#fee',
            color: '#c33',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#333',
              fontSize: '0.875rem'
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#666'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#333',
              fontSize: '0.875rem'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  paddingRight: '2.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#666'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  fontSize: '1.25rem',
                  color: '#666'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: '#555'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  marginRight: '0.5rem',
                  cursor: 'pointer',
                  width: '16px',
                  height: '16px'
                }}
              />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: loading ? '#999' : '#1a1a1a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#333'
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#1a1a1a'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          color: '#666',
          fontSize: '0.875rem'
        }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: '#1a1a1a',
              fontWeight: '600',
              textDecoration: 'none'
            }}
          >
            Register now
          </Link>
        </p>
      </div>
    </div>
  )
}
