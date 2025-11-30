import { useEffect, useState } from 'react'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Scanner from './pages/Scanner'
import Market from './pages/Market'
import Chat from './pages/Chat'
import Settings from './pages/Settings'
import Placeholder from './pages/Placeholder'
import { initDB, saveUser, getUser, saveItem, getUserItems, getMarketItems, deleteItem, listItemOnMarket, getOrCreateChat, getUserChats } from './utils/database'
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
  const [dbReady, setDbReady] = useState(false)

  // Инициализация базы данных
  useEffect(() => {
    const initializeDB = async () => {
      try {
        await initDB()
        setDbReady(true)
        
        // Загружаем пользователя из localStorage если есть
        const savedUserId = localStorage.getItem('plexo-user-id')
        if (savedUserId) {
          const savedUser = await getUser(savedUserId)
          if (savedUser) {
            setUser(savedUser)
            setView('profile')
            // Загружаем товары пользователя
            const userItems = await getUserItems(savedUserId)
            setItems(userItems.filter(item => !item.listed))
            // Загружаем товары на рынке
            const marketItemsData = await getMarketItems()
            setMarketItems(marketItemsData)
            // Загружаем чаты
            const userChats = await getUserChats(savedUserId)
            setChats(userChats)
          }
        }
      } catch (error) {
        console.error('Ошибка инициализации базы данных:', error)
        setDbReady(true) // Продолжаем работу даже при ошибке
      }
    }
    initializeDB()
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('plexo-theme', theme)
  }, [theme])

  const handleRegisterComplete = async (payload) => {
    const newUser = {
      id: crypto.randomUUID(),
      ...payload,
      rating: 4.8,
      createdAt: new Date().toISOString(),
    }
    
    if (dbReady) {
      try {
        await saveUser(newUser)
        localStorage.setItem('plexo-user-id', newUser.id)
      } catch (error) {
        console.error('Ошибка сохранения пользователя:', error)
      }
    }
    
    setUser(newUser)
    setItems([])
    setSavedItems([])
    if (dbReady) {
      try {
        const marketItemsData = await getMarketItems()
        setMarketItems(marketItemsData.length > 0 ? marketItemsData : demoMarket)
      } catch (error) {
        setMarketItems(demoMarket)
      }
    } else {
      setMarketItems(demoMarket)
    }
    setView('profile')
    setActiveNav('profile')
    setProfileTab('owned')
  }

  const handleLogin = async (loginData) => {
    if (!dbReady) {
      // Fallback для демо
      setUser(demoUser)
      setItems(demoItems)
      setSavedItems([])
      setMarketItems(demoMarket)
      setChats(demoChats)
      setView('profile')
      setActiveNav('profile')
      setProfileTab('owned')
      return
    }

    try {
      const { getUserByEmail } = await import('./utils/database')
      const user = await getUserByEmail(loginData.email)
      
      if (!user) {
        alert('Пользователь с таким email не найден')
        return
      }

      // Простая проверка пароля (в продакшене нужно использовать хэширование)
      if (user.password !== loginData.password) {
        alert('Неверный пароль')
        return
      }

      setUser(user)
      localStorage.setItem('plexo-user-id', user.id)
      
      // Загружаем данные пользователя
      const userItems = await getUserItems(user.id)
      setItems(userItems.filter(item => !item.listed))
      
      const marketItemsData = await getMarketItems()
      setMarketItems(marketItemsData.length > 0 ? marketItemsData : demoMarket)
      
      const userChats = await getUserChats(user.id)
      setChats(userChats)
      
      setView('profile')
      setActiveNav('profile')
      setProfileTab('owned')
    } catch (error) {
      console.error('Ошибка входа:', error)
      alert('Ошибка входа. Попробуйте снова.')
    }
  }

  const handleNavigate = (section) => {
    setActiveNav(section)
  }

  const handleSaveItem = async (item) => {
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
      userId: user?.id,
      listed: false,
    }
    
    if (dbReady && user?.id) {
      try {
        await saveItem(newItem)
      } catch (error) {
        console.error('Ошибка сохранения товара:', error)
      }
    }
    
    setItems((prev) => [newItem, ...prev])
    setActiveNav('profile')
    setProfileTab('owned')
  }

  const handleDeleteItem = async (itemId) => {
    if (dbReady) {
      try {
        await deleteItem(itemId)
      } catch (error) {
        console.error('Ошибка удаления товара:', error)
      }
    }
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleUpdateItem = async (itemId, updatedData) => {
    if (dbReady) {
      try {
        const { getItem, saveItem } = await import('./utils/database')
        const existingItem = await getItem(itemId)
        if (existingItem) {
          const updatedItem = {
            ...existingItem,
            ...updatedData,
            updatedAt: new Date().toISOString(),
          }
          await saveItem(updatedItem)
          setItems((prev) => prev.map((item) => (item.id === itemId ? updatedItem : item)))
        }
      } catch (error) {
        console.error('Ошибка обновления товара:', error)
      }
    } else {
      setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...updatedData } : item)))
    }
  }

  const handleRemoveSaved = (itemId) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleListOnMarket = async (itemId) => {
    const item = items.find((entry) => entry.id === itemId)
    if (!item || !user) return

    let listingSuccessful = false

    if (dbReady) {
      try {
        const listedItem = await listItemOnMarket(itemId, {
          id: user.id,
          name: user.name || 'Вы',
          avatar: user.avatar || item.image,
          rating: user.rating ?? 4.8,
        })
        setMarketItems((marketPrev) => [listedItem, ...marketPrev])
        listingSuccessful = true
      } catch (error) {
        console.error('Ошибка размещения товара:', error)
        // Fallback на локальное состояние только если БД недоступна
        // Но не удаляем товар из инвентаря, так как операция не удалась
        try {
          setMarketItems((marketPrev) => [
            {
              ...item,
              id: crypto.randomUUID(),
              seller: user?.name || 'Вы',
              sellerAvatar: item.image,
              sellerRating: user?.rating ?? 4.8,
              listedAt: new Date().toISOString(),
              listed: true,
            },
            ...marketPrev,
          ])
          listingSuccessful = true
        } catch (fallbackError) {
          console.error('Ошибка fallback размещения:', fallbackError)
          alert('Не удалось разместить товар на рынке. Попробуйте позже.')
          return // Прерываем выполнение, товар остается в инвентаре
        }
      }
    } else {
      // Если БД не готова, используем локальное состояние
      setMarketItems((marketPrev) => [
        {
          ...item,
          id: crypto.randomUUID(),
          seller: user?.name || 'Вы',
          sellerAvatar: item.image,
          sellerRating: user?.rating ?? 4.8,
          listedAt: new Date().toISOString(),
          listed: true,
        },
        ...marketPrev,
      ])
      listingSuccessful = true
    }
    
    // Удаляем товар из инвентаря только после успешного размещения
    if (listingSuccessful) {
      setItems((prev) => prev.filter((entry) => entry.id !== itemId))
      setActiveNav('market')
    }
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

  const handleContactSeller = async (itemId) => {
    const target = marketItems.find((entry) => entry.id === itemId)
    if (!target || !user) return

    if (dbReady && target.sellerId) {
      try {
        const chat = await getOrCreateChat(
          user.id,
          target.sellerId,
          {
            name: target.seller,
            avatar: target.sellerAvatar,
          },
          {
            id: target.id,
            title: target.title,
          }
        )
        
        // Добавляем первое сообщение если чат новый
        const existingMessages = await getUserChats(user.id)
        const existingChat = existingMessages.find(c => c.id === chat.id)
        if (!existingChat || !existingChat.lastMessage) {
          // Чат новый, добавляем приветственное сообщение
          const { saveMessage } = await import('./utils/database')
          await saveMessage(chat.id, {
            from: 'user',
            text: 'Здравствуйте! Интересует товар.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          })
        }
        
        setActiveChat(chat)
        // Обновляем список чатов
        const updatedChats = await getUserChats(user.id)
        setChats(updatedChats)
      } catch (error) {
        console.error('Ошибка создания чата:', error)
        // Fallback
        const thread = {
          id: `chat-${itemId}`,
          contact: target.seller,
          avatar: target.sellerAvatar,
          itemTitle: target.title,
        }
        setActiveChat(thread)
      }
    } else {
      // Fallback для случая когда БД не готова
      const thread = {
        id: `chat-${itemId}`,
        contact: target.seller,
        avatar: target.sellerAvatar,
        itemTitle: target.title,
      }
      setActiveChat(thread)
    }
    
    setActiveNav('chat')
  }

  const handleUpdateProfile = (payload) => {
    setUser((prev) => (prev ? { ...prev, ...payload } : prev))
  }

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme)
  }

  const handleLogout = () => {
    localStorage.removeItem('plexo-user-id')
    setUser(null)
    setItems([])
    setSavedItems([])
    setMarketItems(demoMarket)
    setChats([])
    setActiveChat(null)
    setActiveNav('profile')
    setProfileTab('owned')
    setView('register')
  }

  if (view === 'register') {
    return <Register onComplete={handleRegisterComplete} onLoginSubmit={handleLogin} />
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
        onUpdateItem={handleUpdateItem}
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
        userId={user?.id}
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
