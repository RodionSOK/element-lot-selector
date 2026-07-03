import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../../api/TransportContext'
import { useAuth } from '../../auth/AuthContext'
import { Input } from '../../components/ui/Input/Input'
import { Button } from '../../components/ui/Button/Button'
import './AdminLoginPage.css'

export function AdminLoginPage() {
  const { api } = useApi()
  const auth = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const token = await api.login({ username, password })
      auth.login(token.access_token)
      navigate('/admin')
    } catch {
      setError('Неверный логин или пароль')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-login-page">
      <form onSubmit={handleSubmit} className="admin-login-page__form">
        <h1 className="admin-login-page__title">Вход в админку</h1>
        <Input
          required
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full"
        />
        <Input
          required
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full"
        />
        {error && <p className="admin-login-page__error">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Вход...' : 'Войти'}
        </Button>
      </form>
    </div>
  )
}
