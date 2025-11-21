import { useMemo, useState } from 'react'
import MainLayout from '../components/MainLayout'

const sectionIcons = {
  profile: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.31 0-6 2.02-6 4.5V20h12v-1.5c0-2.48-2.69-4.5-6-4.5Z"
        fill="currentColor"
      />
    </svg>
  ),
  notifications: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6V11a6 6 0 0 0-5-5.9V4a1 1 0 1 0-2 0v1.1A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2Z"
        fill="currentColor"
      />
    </svg>
  ),
  theme: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3a9 9 0 0 0 0 18c4.97 0 9-4.03 9-9a9 9 0 0 0-9-9Zm0 2v14a7 7 0 0 1 0-14Z"
        fill="currentColor"
      />
    </svg>
  ),
  security: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2 4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3Zm0 2.18 6 2.25v4.57c0 4.46-2.95 8.84-6 9.92-3.05-1.08-6-5.46-6-9.92V6.43l6-2.25Zm0 3.32a3 3 0 0 0-3 3v2h2v-2a1 1 0 1 1 2 0v2h2v-2a3 3 0 0 0-3-3Z"
        fill="currentColor"
      />
    </svg>
  ),
  help: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M11 18h2v-2h-2v2Zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8Zm0-14a4 4 0 0 0-4 4h2a2 2 0 1 1 2 2c-.55 0-1 .45-1 1v2h2v-1.17A3 3 0 0 0 12 6Z"
        fill="currentColor"
      />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M16 13v-2H7V8l-4 4 4 4v-3h9ZM20 3H9a2 2 0 0 0-2 2v4h2V5h11v14H9v-4H7v4a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"
        fill="currentColor"
      />
    </svg>
  ),
}

function Settings({
  user,
  theme = 'dark',
  onThemeChange,
  onUpdateProfile,
  onLogout,
  activeNav,
  onNavigate,
}) {
  const [expanded, setExpanded] = useState('profile')
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    offers: false,
  })
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    bio: user?.bio ?? '',
  })
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  })

  const chevron = useMemo(
    () => (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    ),
    []
  )

  const toggleSection = (id) => {
    setExpanded((prev) => (prev === id ? null : id))
  }

  const handleProfileSubmit = (event) => {
    event.preventDefault()
    onUpdateProfile?.(profileForm)
  }

  const handlePasswordSubmit = (event) => {
    event.preventDefault()
    if (!passwordForm.next || passwordForm.next !== passwordForm.confirm) {
      return
    }
    setShowPasswordModal(false)
    setPasswordForm({ current: '', next: '', confirm: '' })
  }

  return (
    <MainLayout active={activeNav} onNavigate={onNavigate}>
      <section className="settings-page">
        <header>
          <h2>Настройки</h2>
          <p>Поддерживайте профиль в актуальном состоянии</p>
        </header>

        <div className="settings-list">
          <SettingPanel
            id="profile"
            title="Профиль"
            icon={sectionIcons.profile}
            chevron={chevron}
            expanded={expanded === 'profile'}
            onToggle={toggleSection}
          >
            <form className="settings-form" onSubmit={handleProfileSubmit}>
              <label>
                Имя
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Короткое описание
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                />
              </label>
              <button type="submit" className="settings-primary">
                Сохранить
              </button>
            </form>
          </SettingPanel>

          <SettingPanel
            id="notifications"
            title="Уведомления"
            icon={sectionIcons.notifications}
            chevron={chevron}
            expanded={expanded === 'notifications'}
            onToggle={toggleSection}
          >
            <div className="settings-toggle-list">
              {Object.entries(notifications).map(([key, value]) => (
                <label key={key} className="toggle-row">
                  <span>
                    {key === 'push'
                      ? 'Push-уведомления'
                      : key === 'email'
                        ? 'Письма на почту'
                        : 'Офферы и скидки'}
                  </span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() =>
                      setNotifications((prev) => ({ ...prev, [key]: !value }))
                    }
                  />
                </label>
              ))}
            </div>
          </SettingPanel>

          <SettingPanel
            id="theme"
            title="Тема"
            icon={sectionIcons.theme}
            chevron={chevron}
            expanded={expanded === 'theme'}
            onToggle={toggleSection}
          >
            <div className="theme-toggle">
              {['dark', 'light'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={theme === mode ? 'active' : ''}
                  onClick={() => onThemeChange?.(mode)}
                >
                  {mode === 'dark' ? 'Тёмная' : 'Светлая'}
                </button>
              ))}
            </div>
          </SettingPanel>

          <SettingPanel
            id="security"
            title="Безопасность"
            icon={sectionIcons.security}
            chevron={chevron}
            expanded={expanded === 'security'}
            onToggle={toggleSection}
          >
            <div className="security-block">
              <p>Обновите пароль для повышения безопасности аккаунта.</p>
              <button
                type="button"
                className="settings-secondary"
                onClick={() => setShowPasswordModal(true)}
              >
                Сменить пароль
              </button>
            </div>
          </SettingPanel>

          <SettingPanel
            id="help"
            title="Помощь"
            icon={sectionIcons.help}
            chevron={chevron}
            expanded={expanded === 'help'}
            onToggle={toggleSection}
          >
            <div className="help-block">
              <p>Есть вопросы? Напишите нам на support@plexo.app</p>
              <button
                type="button"
                className="settings-secondary"
                onClick={() => window.open('mailto:support@plexo.app', '_blank')}
              >
                Связаться
              </button>
            </div>
          </SettingPanel>

          <button type="button" className="logout-card" onClick={onLogout}>
            <span className="icon">{sectionIcons.logout}</span>
            <span>Выйти</span>
            {chevron}
          </button>
        </div>
      </section>

      {showPasswordModal && (
        <div className="analysis-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="analysis-card detail-card" onClick={(e) => e.stopPropagation()}>
            <span className="sheet-handle" aria-hidden="true" />
            <h3>Сменить пароль</h3>
            <form className="settings-form" onSubmit={handlePasswordSubmit}>
              <label>
                Текущий пароль
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, current: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Новый пароль
                <input
                  type="password"
                  value={passwordForm.next}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, next: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Подтвердите пароль
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, confirm: e.target.value }))
                  }
                  required
                />
              </label>
              <button type="submit" className="settings-primary">
                Обновить
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

function SettingPanel({ id, title, icon, chevron, expanded, onToggle, children }) {
  return (
    <div className={`setting-panel${expanded ? ' expanded' : ''}`}>
      <button
        type="button"
        className="setting-trigger"
        onClick={() => onToggle(id)}
        aria-expanded={expanded}
      >
        <span className="icon">{icon}</span>
        <span>{title}</span>
        <span className="chevron" aria-hidden="true">
          {chevron}
        </span>
      </button>
      {expanded && <div className="setting-content">{children}</div>}
    </div>
  )
}

export default Settings

