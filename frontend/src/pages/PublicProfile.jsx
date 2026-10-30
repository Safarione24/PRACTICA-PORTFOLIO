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
  if (!profile) return <p className="container">Профиль не найден</p>

  return (
    <div>
      <div className="card">
        <h2>{profile.full_name || profile.user?.username}</h2>
        <p style={{ color: '#555', whiteSpace: 'pre-wrap' }}>{profile.bio}</p>
        {profile.avatar && (
          <img 
            src={profile.avatar} 
            alt="avatar" 
            style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginTop: 10 }} 
          />
        )}
      </div>

      <h2>Проекты</h2>
      {profile.projects?.length === 0 ? (
        <p>Проектов пока нет.</p>
      ) : (
        <div>
          {profile.projects?.map(p => (
            <div key={p.id} className="card">
              <h3 style={{ marginTop: 0 }}>{p.title}</h3>
              <a href={p.link} target="_blank" rel="noreferrer">{p.link}</a>
              {p.description && <p>{p.description}</p>}
              <div style={{ marginTop: 10 }}>
                {p.skills?.map(s => (
                  <span key={s.id} style={{ background: '#e0e7ff', color: '#4338ca', padding: '3px 8px', marginRight: 5, borderRadius: 6, fontSize: 14 }}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2>Навыки</h2>
      <div className="card">
        {profile.skills?.length === 0 ? (
          <p>Навыков пока нет.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {profile.skills?.map(s => (
              <li key={s.id} style={{ background: '#f3f4f6', padding: '8px 16px', borderRadius: 20, fontWeight: 500 }}>
                {s.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}