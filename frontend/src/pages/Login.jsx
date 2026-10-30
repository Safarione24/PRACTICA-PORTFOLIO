import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/auth/login/', { username, password })
      localStorage.setItem('access', res.data.access)
      localStorage.setItem('refresh', res.data.refresh)
      localStorage.setItem('username', username)
      navigate('/')
    } catch (err) {
      setError('Неверный логин или пароль')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2 style={{ textAlign: 'center' }}>Вход</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      
      <div style={{ marginBottom: 15 }}>
        <input
          placeholder="Логин"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          autoComplete="off"
        />
      </div>

      <div style={{ marginBottom: 20, position: 'relative' }}>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={{ paddingRight: 40 }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute', right: 5, top: 5, background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 18, padding: 5, color: '#666'
          }}
          title={showPassword ? "Скрыть пароль" : "Показать пароль"}
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>

      <button type="submit" style={{ width: '100%' }}>Войти</button>
      
      <p style={{ textAlign: 'center', marginTop: 15, fontSize: 14 }}>
        Нет аккаунта? <Link to="/register" style={{ color: '#6366f1', textDecoration: 'none' }}>Зарегистрироваться</Link>
      </p>
    </form>
  )
}