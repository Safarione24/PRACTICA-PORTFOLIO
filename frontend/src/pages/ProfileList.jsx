import { useEffect, useState } from 'react'
import api from '../api'

export default function ProfileList() {
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  
  // Фильтры
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSkillId, setFilterSkillId] = useState('')
  
  // Форма проекта
  const [editingId, setEditingId] = useState(null) // Если null - создаем новый
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [description, setDescription] = useState('')
  const [selectedSkills, setSelectedSkills] = useState([])
  
  // Быстрое создание навыка внутри формы
  const [newSkillName, setNewSkillName] = useState('')
  
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [p, s] = await Promise.all([
        api.get('/projects/'),
        api.get('/skills/'),
      ])
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

  // --- ЛОГИКА НАВЫКОВ ---
  const createSkillInsideForm = async (e) => {
    e.preventDefault()
    if (!newSkillName.trim()) return
    try {
      const res = await api.post('/skills/', { name: newSkillName })
      setNewSkillName('')
      setSkills([...skills, res.data])
      setSelectedSkills([...selectedSkills, res.data.id]) // Автоматически отмечаем его
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

  // --- ЛОГИКА ПРОЕКТОВ ---
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
    window.scrollTo({ top: 0, behavior: 'smooth' }) // Скроллим к форме
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

  // --- ФИЛЬТРАЦИЯ ---
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSkill = filterSkillId ? p.skills.some(s => s.id === Number(filterSkillId)) : true
    return matchesSearch && matchesSkill
  })

  // Прогресс: сколько проектов имеют хотя бы 1 навык
  const projectsWithSkills = projects.filter(p => p.skills && p.skills.length > 0).length
  const progressPercent = projects.length === 0 ? 0 : Math.round((projectsWithSkills / projects.length) * 100)

  if (loading) return <p className="container">Загрузка...</p>

  return (
    <div>
      {/* Прогресс-бар */}
      <div className="card" style={{ marginBottom: 20 }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Заполненность портфолио: {progressPercent}%</p>
        <div style={{ width: '100%', background: '#e5e7eb', borderRadius: 10, height: 10 }}>
          <div style={{ width: `${progressPercent}%`, background: '#6366f1', height: '100%', borderRadius: 10, transition: '0.3s' }}></div>
        </div>
        <p style={{ margin: '10px 0 0 0', fontSize: 13, color: '#666' }}>Проектов с привязанными навыками: {projectsWithSkills} из {projects.length}</p>
      </div>

      {/* Форма создания/редактирования */}
      <form onSubmit={submitProject} className="card">
        <h3>{editingId ? 'Редактировать проект' : 'Добавить новый проект'}</h3>
        <input placeholder="Название" value={title} onChange={e => setTitle(e.target.value)} required />
        <input type="url" placeholder="Ссылка (http://...)" value={link} onChange={e => setLink(e.target.value)} required />
        <textarea placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        
        {/* Блок навыков */}
        <div style={{ margin: '15px 0', padding: 10, background: '#f9fafb', borderRadius: 8 }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Привязать навыки:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
            {skills.map(s => (
              <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={selectedSkills.includes(s.id)}
                  onChange={() => handleSkillCheckbox(s.id)}
                  style={{ width: 'auto', margin: 0 }}
                /> 
                {s.name}
              </label>
            ))}
          </div>
          
          {/* Быстрое создание навыка */}
          <div style={{ display: 'flex', gap: 10 }}>
            <input 
              placeholder="Новый навык (например, C++)" 
              value={newSkillName} 
              onChange={e => setNewSkillName(e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <button type="button" onClick={createSkillInsideForm} style={{ whiteSpace: 'nowrap' }}>+ Создать навык</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit">{editingId ? 'Сохранить изменения' : 'Добавить проект'}</button>
          {editingId && <button type="button" className="secondary" onClick={resetForm}>Отмена</button>}
        </div>
      </form>

      {/* Поиск и фильтр */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input 
          placeholder="Поиск по названию..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
        />
        <select 
          value={filterSkillId} 
          onChange={e => setFilterSkillId(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
        >
          <option value="">Все навыки</option>
          {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Список проектов */}
      {filteredProjects.length === 0 ? (
        <p>Проекты не найдены.</p>
      ) : (
        filteredProjects.map(p => (
          <div key={p.id} className="card">
            <h3 style={{ marginTop: 0 }}>{p.title}</h3>
            <a href={p.link} target="_blank" rel="noreferrer">{p.link}</a>
            {p.description && <p>{p.description}</p>}
            
            <div style={{ marginBottom: 15, marginTop: 10 }}>
              <strong>Навыки: </strong>
              {p.skills && p.skills.length > 0 ? (
                p.skills.map(s => (
                  <span key={s.id} style={{ background: '#e0e7ff', color: '#4338ca', padding: '3px 8px', marginRight: 5, borderRadius: 6, fontSize: 14 }}>
                    {s.name}
                  </span>
                ))
              ) : (
                <span style={{ color: '#888', fontSize: 14 }}>не привязаны</span>
              )}
            </div>
            
            <button className="secondary" onClick={() => startEdit(p)} style={{ marginRight: 10 }}>Редактировать</button>
            <button className="danger" onClick={() => deleteProject(p.id)}>Удалить</button>
          </div>
        ))
      )}
    </div>
  )
}