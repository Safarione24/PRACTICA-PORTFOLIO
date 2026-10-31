import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ProfileList from './pages/ProfileList'
import ProfileForm from './pages/ProfileForm'
import PublicProfile from './pages/PublicProfile'

function App() {
  const navigate = useNavigate()
  const token = localStorage.getItem('access')
  const username = localStorage.getItem('username')

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('username')
    navigate('/login')
  }

  return (
    <div>
      <nav className="navbar">
        {token ? (
          <>
            <span style={{ fontWeight: 'bold' }}>Привет, {username} 👋</span>
            <div>
              <Link to="/">📁 Проекты</Link>
              <Link to="/profile">👤 Профиль</Link>
              <button onClick={logout} style={{ padding: '8px 16px', fontSize: 14, marginLeft: 10 }}>
                🚪 Выйти
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login">Вход</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </nav>
      <div className="container animate-fade">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={token ? <ProfileList /> : <Login />} />
          <Route path="/profile" element={token ? <ProfileForm /> : <Login />} />
          <Route path="/u/:username" element={<PublicProfile />} />
        </Routes>
      </div>
    </div>
  )
}

export default App