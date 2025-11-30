import { useMemo, useState } from 'react'

const interests = ['ART', 'PHOTO', 'MUSIC']

function Register({ onComplete, onLogin, onLoginSubmit }) {
  const [isLoginMode, setIsLoginMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
  })
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [selectedInterest, setSelectedInterest] = useState('PHOTO')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [error, setError] = useState('')

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

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    
    if (isLoginMode) {
      // Режим входа
      if (!loginData.email || !loginData.password) {
        setError('Заполните все поля')
        return
      }
      onLoginSubmit?.(loginData)
    } else {
      // Режим регистрации
      if (!formData.name || !formData.email || !formData.password) {
        setError('Заполните все обязательные поля')
        return
      }
      const payload = {
        ...formData,
        interest: selectedInterest,
        avatar: avatarPreview,
      }
      onComplete?.(payload)
    }
  }

  const handleLoginClick = () => {
    setIsLoginMode(true)
    setError('')
  }

  const handleRegisterClick = () => {
    setIsLoginMode(false)
    setError('')
    setLoginData({ email: '', password: '' })
  }

  return (
    <div className="app">
      <div className="auth-card">
        <div className="logo-mark" aria-hidden="true">
          <div className="logo-core" />
        </div>
        <h1>{isLoginMode ? 'Войти' : 'Создать аккаунт'}</h1>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isLoginMode ? (
            <>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
              <div className="input-group password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Пароль"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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
              <button type="submit" className="primary-btn">
                Войти
              </button>
              <p className="auth-link">
                Нет аккаунта?{' '}
                <button type="button" onClick={handleRegisterClick}>
                  Зарегистрироваться
                </button>
              </p>
            </>
          ) : (
            <>
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
              <p className="auth-link">
                Уже есть аккаунт?{' '}
                <button type="button" onClick={handleLoginClick}>
                  Войти
                </button>
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

export default Register

