import { useState } from 'react'
import Home from './Home'
import Login from './Login'

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'login'>('home')

  return (
    <>
      {currentPage === 'home' && <Home onNavigateToLogin={() => setCurrentPage('login')} />}
      {currentPage === 'login' && <Login onNavigateToHome={() => setCurrentPage('home')} />}
    </>
  )
}

export default App
