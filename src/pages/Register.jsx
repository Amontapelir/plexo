import { useMemo, useState } from 'react'

const interests = ['ART', 'PHOTO', 'MUSIC']

function Register({ onComplete, onLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [selectedInterest, setSelectedInterest] = useState('PHOTO')
  const [avatarPreview, setAvatarPreview] = useState(null)

  const avatarInitials = useMemo(() => {
    if (!formData.name.trim()) return ''
    return formData.name
      .trim()
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join('')
  }, [formData.name])

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const payload = {
      ...formData,
      interest: selectedInterest,
      avatar: avatarPreview,
    }
    onComplete?.(payload)
  }

  const handleLoginClick = () => {
    onLogin?.()
  }

  return (
    <div className="app">
      <div className="auth-card">
        <div className="logo-mark" aria-hidden="true">
          <div className="logo-core" />
        </div>
        <h1>Создать аккаунт</h1>

        <form onSubmit={handleSubmit}>
          <label className="avatar-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              aria-label="Загрузить аватар"
            />
            {avatarPreview ? (
              <img src={avatarPreview} alt="Аватар пользователя" />
            ) : (
              <div className="avatar-placeholder">
                <svg viewBox="0 0 32 32" aria-hidden="true">
                  <path
                    d="M16 17.5c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6Zm0 2.5c-4.971 0-9 4.029-9 9h2c0-3.86 3.14-7 7-7s7 3.14 7 7h2c0-4.971-4.029-9-9-9Z"
                    fill="#9C9C9C"
                  />
                </svg>
                <span>Загрузить фото</span>
                {avatarInitials && <strong>{avatarInitials}</strong>}
              </div>
            )}
          </label>

          <div className="input-group">
            <input
              type="text"
              placeholder="Имя"
              value={formData.name}
              onChange={handleChange('name')}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange('email')}
              required
            />
          </div>
          <div className="input-group password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange('password')}
              required
            />
            <button
              type="button"
              className="password-toggle"
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 5c4.5 0 8.3 2.9 10 7-1.7 4.1-5.5 7-10 7S3.7 16.1 2 12c1.7-4.1 5.5-7 10-7Zm0 2C8.7 7 5.9 8.9 4.5 12 5.9 15.1 8.7 17 12 17s6.1-1.9 7.5-5C18.1 8.9 15.3 7 12 7Zm0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"
                  fill="#BFBFBF"
                />
              </svg>
            </button>
          </div>
          <div className="input-group">
            <textarea
              placeholder="Короткое описание"
              rows={3}
              value={formData.bio}
              onChange={handleChange('bio')}
            />
          </div>

          <div className="interest-section">
            <span>Интересы</span>
            <div className="interest-chips">
              {interests.map((interest) => {
                const isActive = selectedInterest === interest
                return (
                  <button
                    key={interest}
                    type="button"
                    className={`interest-chip${isActive ? ' active' : ''}`}
                    onClick={() => setSelectedInterest(interest)}
                  >
                    {interest}
                  </button>
                )
              })}
            </div>
          </div>

          <button type="submit" className="primary-btn">
            Создать аккаунт
          </button>
        </form>

        <p className="auth-link">
          Уже есть аккаунт?{' '}
          <button type="button" onClick={handleLoginClick}>
            Войти
          </button>
        </p>
      </div>
    </div>
  )
}

export default Register

