import { useEffect, useState } from 'react'
import api from '../api'

export default function ProfileForm() {
  const [profile, setProfile] = useState({ full_name: '', bio: '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = () => {
    api.get('/profile/')
      .then(res => setProfile(res.data))
      .catch(() => alert('Не удалось загрузить профиль'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const save = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('full_name', profile.full_name || '')
    formData.append('bio', profile.bio || '')
    
    if (avatarFile) formData.append('avatar', avatarFile)
    if (resumeFile) formData.append('resume', resumeFile)

    try {
      await api.put('/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('Сохранено')
      loadProfile()
    } catch (err) {
      alert('Ошибка сохранения: ' + JSON.stringify(err.response?.data || err.message))
    }
  }

  // Функция для удаления аватара
    const deleteAvatar = async () => {
    if (!confirm('Удалить аватар?')) return
    try {
      const formData = new FormData()
      formData.append('avatar', '') // Отправляем пустоту
      await api.put('/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      loadProfile()
    } catch (err) {
      alert('Ошибка удаления: ' + JSON.stringify(err.response?.data || err.message))
    }
  }

  if (loading) return <p className="container">Загрузка...</p>

  return (
    <form onSubmit={save} className="card" style={{ maxWidth: 500 }}>
      <h2>Профиль</h2>
      
      {profile.avatar ? (
        <div style={{ marginBottom: 20 }}>
          <p>Текущий аватар:</p>
          <img 
            src={profile.avatar} 
            alt="avatar" 
            style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '50%', marginBottom: 10 }} 
          />
          <br />
          <button type="button" className="danger" onClick={deleteAvatar}>Удалить аватар</button>
        </div>
      ) : (
        <p style={{ color: '#888' }}>Аватар не загружен</p>
      )}

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: 'block', marginBottom: 5 }}>Полное имя:</label>
        <input
          value={profile.full_name || ''}
          onChange={e => setProfile({ ...profile, full_name: e.target.value })}
        />
      </div>
      
      <div style={{ marginBottom: 15 }}>
        <label style={{ display: 'block', marginBottom: 5 }}>О себе:</label>
        <textarea
          value={profile.bio || ''}
          onChange={e => setProfile({ ...profile, bio: e.target.value })}
          style={{ minHeight: 100 }}
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: 'block', marginBottom: 5 }}>Загрузить аватар (jpg/png):</label>
        <input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files[0])} style={{ padding: 5 }} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 5 }}>Загрузить резюме (PDF):</label>
        <input type="file" accept=".pdf" onChange={e => setResumeFile(e.target.files[0])} style={{ padding: 5 }} />
      </div>

      <button type="submit" style={{ width: '100%' }}>Сохранить</button>
    </form>
  )
}