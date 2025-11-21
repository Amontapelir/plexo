import { useEffect, useState } from 'react'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Scanner from './pages/Scanner'
import Market from './pages/Market'
import Chat from './pages/Chat'
import Settings from './pages/Settings'
import Placeholder from './pages/Placeholder'
import './App.css'

const demoUser = {
  name: 'Мария Волкова',
  email: 'm.volkova@plexo.ai',
  bio: 'Коллекционирую винтажные вещи и люблю эксперименты с AI.',
  interest: 'PHOTO',
  avatar: null,
  rating: 4.9,
}

const demoItems = [
  {
    id: 'demo-1',
    title: 'Greenfield Denim Jacket',
    category: 'Jacket',
    authenticity: 82,
    price: 150,
    description:
      'Винтажный зеленый деним с современным силуэтом. Подходит для casual и smart-casual образов.',
    image:
      'https://images.pexels.com/photos/7679727/pexels-photo-7679727.jpeg?auto=compress&cs=tinysrgb&h=350',
  },
  {
    id: 'demo-2',
    title: 'Minimal Sneaker',
    category: 'Shoes',
    authenticity: 90,
    price: 240,
    description: 'Кожаные кроссовки с контрастной подошвой и аккуратной строчкой.',
    image:
      'https://images.pexels.com/photos/6311655/pexels-photo-6311655.jpeg?auto=compress&cs=tinysrgb&h=350',
  },
];

const demoMarket = [
  {
    id: 'market-1',
    seller: 'Никита',
    sellerAvatar:
      'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&h=140',
    sellerRating: 4.7,
    title: 'Vintage Leather Bag',
    category: 'Accessories',
    authenticity: 88,
    price: 420,
    description:
      'Ручная выделка, мягкая кожа и аккуратная патина. Отличный аксессуар на каждый день.',
    image:
      'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&h=350',
  },
  {
    id: 'market-2',
    seller: 'Alina',
    sellerAvatar:
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&h=140',
    sellerRating: 4.9,
    title: 'Oversized Sweater',
    category: 'Sweater',
    authenticity: 93,
    price: 190,
    description: 'Объёмный крой, плотный вязанный материал, отлично держит форму.',
    image:
      'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&h=350',
  },
];

const demoChats = [
  {
    id: 'chat-1',
    contact: 'Никита',
    avatar:
      'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&h=140',
    lastMessage: 'Готов обсудить цену.',
    messages: [
      { id: 'm1', from: 'contact', text: 'Привет! Сумка ещё актуальна?', time: '12:30' },
      { id: 'm2', from: 'user', text: 'Да, интересует качество кожи.', time: '12:32' },
      { id: 'm3', from: 'contact', text: 'Кожа мягкая, см. фото.', time: '12:33' },
    ],
  },
];

function App() {
  const [user, setUser] = useState(null)
  const [items, setItems] = useState([])
  const [savedItems, setSavedItems] = useState([])
  const [marketItems, setMarketItems] = useState(demoMarket)
  const [chats, setChats] = useState(demoChats)
  const [activeChat, setActiveChat] = useState(null)
  const [view, setView] = useState('register')
  const [activeNav, setActiveNav] = useState('profile')
  const [profileTab, setProfileTab] = useState('owned')
  const [theme, setTheme] = useState(() => localStorage.getItem('plexo-theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('plexo-theme', theme)
  }, [theme])

  const handleRegisterComplete = (payload) => {
    setUser({
      ...payload,
      rating: 4.8,
    })
    setItems([])
    setSavedItems([])
    setMarketItems(demoMarket)
    setView('profile')
    setActiveNav('profile')
    setProfileTab('owned')
  }

  const handleLogin = () => {
    setUser(demoUser)
    setItems(demoItems)
    setSavedItems([])
    setMarketItems(demoMarket)
    setChats(demoChats)
    setView('profile')
    setActiveNav('profile')
    setProfileTab('owned')
  }

  const handleNavigate = (section) => {
    setActiveNav(section)
  }

  const handleSaveItem = (item) => {
    setItems((prev) => [{ ...item, id: crypto.randomUUID() }, ...prev])
    setActiveNav('profile')
    setProfileTab('owned')
  }

  const handleDeleteItem = (itemId) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleRemoveSaved = (itemId) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleListOnMarket = (itemId) => {
    setItems((prev) => {
      const item = prev.find((entry) => entry.id === itemId)
      if (!item) {
        return prev
      }
      setMarketItems((marketPrev) => [
        {
          ...item,
          id: crypto.randomUUID(),
          seller: user?.name || 'Вы',
          sellerAvatar: item.image,
          sellerRating: user?.rating ?? 4.8,
          listedAt: new Date().toISOString(),
        },
        ...marketPrev,
      ])
      return prev.filter((entry) => entry.id !== itemId)
    })
    setActiveNav('market')
  }

  const handleBuyMarketItem = (itemId) => {
    setMarketItems((prev) => {
      const item = prev.find((entry) => entry.id === itemId)
      if (!item) {
        return prev
      }
      setSavedItems((savedPrev) => [
        {
          ...item,
          savedFrom: item.seller,
          savedAt: new Date().toISOString(),
          id: crypto.randomUUID(),
        },
        ...savedPrev,
      ])
      return prev.filter((entry) => entry.id !== itemId)
    })
    setActiveNav('profile')
    setProfileTab('saved')
  }

  const handleContactSeller = (itemId) => {
    const target = marketItems.find((entry) => entry.id === itemId)
    if (!target) return
    const thread = {
      id: `chat-${itemId}`,
      contact: target.seller,
      avatar: target.sellerAvatar,
      itemTitle: target.title,
      messages: [
        { id: 'intro-1', from: 'user', text: 'Здравствуйте! Интересует товар.', time: 'сейчас' },
      ],
    }
    setActiveChat(thread)
    setActiveNav('chat')
  }

  const handleUpdateProfile = (payload) => {
    setUser((prev) => (prev ? { ...prev, ...payload } : prev))
  }

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme)
  }

  const handleLogout = () => {
    setUser(null)
    setItems([])
    setSavedItems([])
    setMarketItems(demoMarket)
    setChats(demoChats)
    setActiveChat(null)
    setActiveNav('profile')
    setProfileTab('owned')
    setView('register')
  }

  if (view === 'register') {
    return <Register onComplete={handleRegisterComplete} onLogin={handleLogin} />
  }

  if (activeNav === 'scan') {
    return (
      <Scanner
        activeNav={activeNav}
        onNavigate={handleNavigate}
        onSaveItem={handleSaveItem}
      />
    )
  }

  if (activeNav === 'profile') {
    return (
      <Profile
        user={user}
        items={items}
        savedItems={savedItems}
        activeTab={profileTab}
        onTabChange={setProfileTab}
        activeNav={activeNav}
        onNavigate={handleNavigate}
        onDeleteItem={handleDeleteItem}
        onListItem={handleListOnMarket}
        onRemoveSaved={handleRemoveSaved}
      />
    )
  }

  if (activeNav === 'market') {
    return (
      <Market
        items={marketItems}
        activeNav={activeNav}
        onNavigate={handleNavigate}
        onBuy={handleBuyMarketItem}
        onContact={handleContactSeller}
      />
    )
  }

  if (activeNav === 'chat') {
    return (
      <Chat
        activeNav={activeNav}
        onNavigate={handleNavigate}
        chats={chats}
        thread={activeChat}
      />
    )
  }

  if (activeNav === 'settings') {
    return (
      <Settings
        user={user}
        theme={theme}
        onThemeChange={handleThemeChange}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
        activeNav={activeNav}
        onNavigate={handleNavigate}
      />
    )
  }

  return (
    <Placeholder
      title="Скоро здесь будет экран"
      message="Раздел в разработке"
      activeNav={activeNav}
      onNavigate={handleNavigate}
    />
  )
}

export default App
