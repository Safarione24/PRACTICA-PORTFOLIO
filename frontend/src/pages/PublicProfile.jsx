import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'

export default function PublicProfile() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/u/${username}/`)
      .then(res => setProfile(res.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [username])

  if (loading) return <p className="container">Загрузка...</p>
  if (!profile) return <p className="container">Профиль не найден 😢</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <button onClick={() => window.print()} style={{ background: '#1e293b' }}>
          🖨 Сохранить в PDF
        </button>
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        {profile.avatar && (
          <img 
            src={profile.avatar.startsWith('http') ? profile.avatar : `http://127.0.0.1:8000${profile.avatar}`} 
            alt="avatar" 
            style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%', border: '4px solid #e0e7ff', marginBottom: 15 }} 
          />
        )}
        <h2 style={{ margin: '0 0 10px 0' }}>{profile.full_name || profile.user?.username}</h2>
        <p style={{ color: '#94a3b8', margin: '0 0 15px 0' }}>👁 Просмотров портфолио: {profile.views || 0}</p>
        <p style={{ color: '#475569', whiteSpace: 'pre-wrap', maxWidth: 600, margin: '0 auto' }}>{profile.bio}</p>
      </div>

      <h2>🚀 Проекты</h2>
      {profile.projects?.length === 0 ? (
        <p style={{ color: '#64748b' }}>Проектов пока нет.</p>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {profile.projects?.map(p => (
            <div key={p.id} className="card">
              <h3 style={{ marginTop: 0 }}>{p.title}</h3>
              <a href={p.link} target="_blank" rel="noreferrer" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>{p.link}</a>
              {p.description && <p style={{ color: '#475569' }}>{p.description}</p>}
              
              <div style={{ marginTop: 15 }}>
                {p.skills?.map(s => (
                  <span key={s.id} style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', marginRight: 5, borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2>🛠 Навыки</h2>
      <div className="card">
        {profile.skills?.length === 0 ? (
          <p style={{ color: '#64748b' }}>Навыков пока нет.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {profile.skills?.map(s => (
              <li key={s.id} style={{ background: '#f1f5f9', padding: '8px 16px', borderRadius: 20, fontWeight: 500, color: '#334155' }}>
                {s.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}