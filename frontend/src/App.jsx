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
            <span>Привет, {username} </span>
            <Link to="/" style={{ margin: 10 }}>Мои проекты</Link>
            <Link to="/profile" style={{ margin: 10 }}>Профиль</Link>
            <button onClick={logout}>Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ margin: 10 }}>Вход</Link>
            <Link to="/register" style={{ margin: 10 }}>Регистрация</Link>
          </>
        )}
      </nav>
      <div className="container">
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