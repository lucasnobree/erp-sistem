import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [formData, setFormData] = useState({
    nome: '',
    email: ''
  })

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
      
      if (error) throw error
      setUsuarios(data)
    } catch (error) {
      console.error('Error ao obter usuarios:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert([formData])
        .select()

      if (error) throw error
      
      setUsuarios([...usuarios, data[0]])
      setFormData({ nome: '', email: '' })
    } catch (error) {
      console.error('Error ao criar usuario:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="usuarios-container">
      <h2>Gestão de Usuários</h2>
      
      <form onSubmit={handleSubmit} className="usuario-form">
        <input
          type="text"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          placeholder="Nome"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <button type="submit">Criar Usuario</button>
      </form>

      <div className="usuarios-list">
        <h3>Lista de Usuarios</h3>
        {usuarios.map(usuario => (
          <div key={usuario.id} className="usuario-card">
            <h4>{usuario.nome}</h4>
            <p>{usuario.email}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Usuarios