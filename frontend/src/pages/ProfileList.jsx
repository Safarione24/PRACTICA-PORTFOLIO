import { useEffect, useState } from 'react'
import api from '../api'

export default function ProfileList() {
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSkillId, setFilterSkillId] = useState('')
  
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [description, setDescription] = useState('')
  const [selectedSkills, setSelectedSkills] = useState([])
  
  const [newSkillName, setNewSkillName] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [p, s] = await Promise.all([api.get('/projects/'), api.get('/skills/')])
      setProjects(p.data)
      setSkills(s.data)
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear()
        window.location.href = '/login'
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const createSkillInsideForm = async (e) => {
    e.preventDefault()
    if (!newSkillName.trim()) return
    try {
      const res = await api.post('/skills/', { name: newSkillName })
      setNewSkillName('')
      setSkills([...skills, res.data])
      setSelectedSkills([...selectedSkills, res.data.id])
    } catch (err) {
      alert('Ошибка создания навыка')
    }
  }

  const handleSkillCheckbox = (id) => {
    if (selectedSkills.includes(id)) {
      setSelectedSkills(selectedSkills.filter(sid => sid !== id))
    } else {
      setSelectedSkills([...selectedSkills, id])
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setTitle(''); setLink(''); setDescription(''); setSelectedSkills([])
  }

  const startEdit = (project) => {
    setEditingId(project.id)
    setTitle(project.title)
    setLink(project.link)
    setDescription(project.description || '')
    setSelectedSkills(project.skills.map(s => s.id))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submitProject = async (e) => {
    e.preventDefault()
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      return alert('Ссылка должна начинаться с http:// или https://')
    }
    try {
      if (editingId) {
        await api.put(`/projects/${editingId}/`, { title, link, description, skill_ids: selectedSkills })
      } else {
        await api.post('/projects/', { title, link, description, skill_ids: selectedSkills })
      }
      resetForm()
      load()
    } catch (err) {
      alert('Ошибка: ' + JSON.stringify(err.response?.data || err.message))
    }
  }

  const deleteProject = async (id) => {
    if (!confirm('Удалить проект?')) return
    try {
      await api.delete(`/projects/${id}/`)
      load()
    } catch (err) { alert('Ошибка удаления') }
  }

  const copyPublicLink = () => {
    const username = localStorage.getItem('username')
    const url = `${window.location.origin}/u/${username}`
    navigator.clipboard.writeText(url)
    alert('Ссылка на ваше портфолио скопирована! 🎉')
  }

  const downloadExcel = async () => {
    try {
      const response = await api.get('/projects/export/', {
        responseType: 'blob', // Говорим axios, что мы ждем файл
      })
      
      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'my_projects.xlsx') // Имя файла
      document.body.appendChild(link)
      link.click()
      
      // Убираем ссылку
      link.parentNode.removeChild(link)
    } catch (err) {
      alert('Ошибка скачивания Excel')
    }
  }

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSkill = filterSkillId ? p.skills.some(s => s.id === Number(filterSkillId)) : true
    return matchesSearch && matchesSkill
  })

  const projectsWithSkills = projects.filter(p => p.skills && p.skills.length > 0).length
  const progressPercent = projects.length === 0 ? 0 : Math.round((projectsWithSkills / projects.length) * 100)

  if (loading) return <p className="container">Загрузка...</p>

  return (
    <div>
      <div className="card" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 15px 0', color: 'white' }}>Ваше портфолио готово!</h3>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={copyPublicLink} style={{ background: 'white', color: '#6366f1' }}>
            🔗 Скопировать ссылку
          </button>
          <button onClick={downloadExcel} style={{ background: '#10b981', color: 'white' }}>
            📊 Скачать Excel
          </button>
        </div>
      </div>

      <div className="card">
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Заполненность портфолио: {progressPercent}%</p>
        <div style={{ width: '100%', background: '#e5e7eb', borderRadius: 10, height: 10 }}>
          <div style={{ width: `${progressPercent}%`, background: '#6366f1', height: '100%', borderRadius: 10, transition: '0.3s' }}></div>
        </div>
        <p style={{ margin: '10px 0 0 0', fontSize: 13, color: '#666' }}>Проектов с навыками: {projectsWithSkills} из {projects.length}</p>
      </div>

      <form onSubmit={submitProject} className="card">
        <h3>{editingId ? 'Редактировать проект' : 'Добавить новый проект'}</h3>
        <input placeholder="Название" value={title} onChange={e => setTitle(e.target.value)} required />
        <input type="url" placeholder="Ссылка (http://...)" value={link} onChange={e => setLink(e.target.value)} required />
        <textarea placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        
        <div style={{ margin: '15px 0', padding: 15, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Привязать навыки:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, marginBottom: 15 }}>
            {skills.map(s => (
              <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedSkills.includes(s.id)} onChange={() => handleSkillCheckbox(s.id)} style={{ width: 'auto', margin: 0 }} /> 
                {s.name}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input placeholder="Новый навык (например, C++)" value={newSkillName} onChange={e => setNewSkillName(e.target.value)} style={{ marginBottom: 0 }} />
            <button type="button" onClick={createSkillInsideForm} style={{ whiteSpace: 'nowrap' }}>+ Создать</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit">{editingId ? '💾 Сохранить' : '🚀 Добавить проект'}</button>
          {editingId && <button type="button" className="secondary" onClick={resetForm}>Отмена</button>}
        </div>
      </form>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input placeholder="Поиск по названию..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ marginBottom: 0 }} />
        <select value={filterSkillId} onChange={e => setFilterSkillId(e.target.value)} style={{ width: 200, marginBottom: 0 }}>
          <option value="">Все навыки</option>
          {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {filteredProjects.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>Проекты не найдены.</p>
      ) : (
        filteredProjects.map(p => (
          <div key={p.id} className="card">
            <h3 style={{ marginTop: 0 }}>{p.title}</h3>
            <a href={p.link} target="_blank" rel="noreferrer" style={{ color: '#6366f1', textDecoration: 'none' }}>{p.link}</a>
            {p.description && <p style={{ color: '#475569' }}>{p.description}</p>}
            
            <div style={{ margin: '15px 0' }}>
              <strong>Навыки: </strong>
              {p.skills && p.skills.length > 0 ? (
                p.skills.map(s => (
                  <span key={s.id} style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', marginRight: 5, borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
                    {s.name}
                  </span>
                ))
              ) : (
                <span style={{ color: '#94a3b8', fontSize: 14 }}>не привязаны</span>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="secondary" onClick={() => startEdit(p)}>✏️ Редактировать</button>
              <button className="danger" onClick={() => deleteProject(p.id)}>🗑 Удалить</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}