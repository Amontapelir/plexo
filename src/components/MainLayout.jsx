const navItems = [
  {
    id: 'settings',
    label: 'Настройки',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a6.9 6.9 0 0 0-.07-.99l2.11-1.65-2-3.46-2.5.8a7 7 0 0 0-1.71-.99L15.5 2h-4L10.47 4.7c-.63.24-1.21.57-1.73.97l-2.5-.8-2 3.46 2.11 1.65a6.9 6.9 0 0 0 0 1.98L4.24 13l2 3.46 2.5-.8c.52.4 1.1.73 1.73.97L11.5 22h4l.53-2.7c.63-.24 1.21-.57 1.73-.97l2.5.8 2-3.46-2.11-1.65c.05-.33.08-.66.08-1Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: 'market',
    label: 'Рынок',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3 4h18l-1.5 9h-13L5 4Zm4 11h10v5H7v-5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: 'scan',
    label: 'Сканер',
    isCenter: true,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M5 5v4H3V3h6v2H5Zm10-2h6v6h-2V5h-4V3ZM5 15v4h4v2H3v-6h2Zm16 0v6h-6v-2h4v-4h2Zm-5-7v8H8V8h8Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: 'chat',
    label: 'Чаты',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 4h16v12H6l-2 2V4Zm3 5v2h10V9H7Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Профиль',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.31 0-6 2.02-6 4.5V20h12v-1.5c0-2.48-2.69-4.5-6-4.5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
]

function MainLayout({ active = 'profile', onNavigate, children }) {
  return (
    <div className="main-layout">
      <div className="main-content">{children}</div>
      <nav className="bottom-nav">
        {navItems.map((item) => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              className={`nav-item${isActive ? ' active' : ''}${
                item.isCenter ? ' center' : ''
              }`}
              type="button"
              aria-label={item.label}
              onClick={() => onNavigate?.(item.id)}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default MainLayout

