import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false) // Состояние для глазика
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    if (password !== passwordConfirm) {
      setErrors({ password_confirm: 'Пароли не совпадают' })
      return
    }
    try {
      // 1. Регистрация
      await api.post('/auth/register/', {
        username,
        email,
        password,
        password_confirm: passwordConfirm,
      })
      
      // 2. Сразу вход
      const loginRes = await api.post('/auth/login/', { username, password })
      
      // 3. Сохранение токенов
      localStorage.setItem('access', loginRes.data.access)
      localStorage.setItem('refresh', loginRes.data.refresh)
      localStorage.setItem('username', username)
      
      // 4. Переход на главную
      navigate('/')
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data
        if (typeof data === 'object' && !Array.isArray(data)) {
          setErrors(data)
        } else {
          setErrors({ general: JSON.stringify(data) })
        }
      } else {
        setErrors({ general: 'Ошибка сети' })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2 style={{ textAlign: 'center' }}>Регистрация</h2>
      {errors.general && <p style={{ color: 'red', textAlign: 'center' }}>{errors.general}</p>}

      <div style={{ marginBottom: 15 }}>
        <input
          placeholder="Логин (3-30, латиница/цифры/_)"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          autoComplete="off"
        />
        {errors.username && <span style={{ color: 'red', fontSize: 14 }}>{errors.username}</span>}
      </div>

      <div style={{ marginBottom: 15 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="off"
        />
        {errors.email && <span style={{ color: 'red', fontSize: 14 }}>{errors.email}</span>}
      </div>

      <div style={{ marginBottom: 15, position: 'relative' }}>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Пароль (мин. 8 символов)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
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
        {errors.password && <span style={{ color: 'red', fontSize: 14 }}>{errors.password}</span>}
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Подтвердите пароль"
          value={passwordConfirm}
          onChange={e => setPasswordConfirm(e.target.value)}
          required
          autoComplete="new-password"
        />
        {errors.password_confirm && <span style={{ color: 'red', fontSize: 14 }}>{errors.password_confirm}</span>}
      </div>

      <button type="submit" style={{ width: '100%' }}>Зарегистрироваться</button>
      <p style={{ textAlign: 'center', marginTop: 15, fontSize: 14 }}>
        Есть аккаунт? <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none' }}>Войти</Link>
      </p>
    </form>
  )
}