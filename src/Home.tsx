import { Link } from 'react-router-dom'
import './App.css'

function Home() {
  return (
    <div className="app">
      <h1>Welcome to Your App</h1>
      <div className="card">
        <p>This is the home page</p>
        <Link to="/login">
          <button>Go to Login</button>
        </Link>
      </div>
      <p className="info">
        Edit src/App.tsx and save to test hot module replacement
      </p>
    </div>
  )
}

export default Home
