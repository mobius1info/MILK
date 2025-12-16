import './App.css'

interface HomeProps {
  onNavigateToLogin: () => void
}

function Home({ onNavigateToLogin }: HomeProps) {
  return (
    <div className="app">
      <h1>Welcome to Your App</h1>
      <div className="card">
        <p>This is the home page</p>
        <button onClick={onNavigateToLogin}>Go to Login</button>
      </div>
      <p className="info">
        Edit src/App.tsx and save to test hot module replacement
      </p>
    </div>
  )
}

export default Home
