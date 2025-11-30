import { useEffect, useMemo, useState, useRef } from 'react'
import MainLayout from '../components/MainLayout'
import { getChatMessages, saveMessage, getUserChats } from '../utils/database'

function Chat({ activeNav, onNavigate, chats = [], thread = null, userId = null }) {
  const [allChats, setAllChats] = useState(chats)
  const [currentThread, setCurrentThread] = useState(thread || chats[0] || null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [showChatList, setShowChatList] = useState(!currentThread)
  const messagesEndRef = useRef(null)

  // Загружаем чаты из базы данных
  useEffect(() => {
    if (userId) {
      loadChats()
    } else {
      setAllChats(chats)
      // Используем функциональное обновление для проверки currentThread
      setCurrentThread((prevThread) => {
        if (thread && !prevThread) {
          setShowChatList(false)
          return thread
        }
        return prevThread
      })
    }
  }, [userId, chats, thread])

  // Загружаем сообщения когда выбран чат
  useEffect(() => {
    if (currentThread?.id) {
      loadMessages(currentThread.id)
    } else {
      setMessages([])
    }
  }, [currentThread])

  // Прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChats = async () => {
    if (!userId) return
    try {
      const userChats = await getUserChats(userId)
      setAllChats(userChats)
      // Используем функциональное обновление для проверки currentThread
      setCurrentThread((prevThread) => {
        if (thread && !prevThread) {
          const foundThread = userChats.find((c) => c.id === thread.id)
          if (foundThread) {
            setShowChatList(false)
            return foundThread
          }
        }
        return prevThread
      })
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error)
    }
  }

  const loadMessages = async (chatId) => {
    try {
      const chatMessages = await getChatMessages(chatId)
      setMessages(chatMessages)
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !currentThread?.id) return

    const newMessage = {
      id: `m-${Date.now()}`,
      from: 'user',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    try {
      // Сохраняем в базу данных
      await saveMessage(currentThread.id, newMessage)
      // Обновляем локальное состояние
      setMessages((prev) => [...prev, newMessage])
      setInput('')
      // Обновляем список чатов
      if (userId) {
        loadChats()
      }
    } catch (error) {
      console.error('Ошибка сохранения сообщения:', error)
    }
  }

  const handleBack = () => {
    if (currentThread && !showChatList) {
      setShowChatList(true)
      setCurrentThread(null)
    } else {
      onNavigate?.('market')
    }
  }

  const handleSelectChat = (chat) => {
    setCurrentThread(chat)
    setShowChatList(false)
  }

  return (
    <MainLayout active={activeNav} onNavigate={onNavigate}>
      <section className="chat-page">
        {showChatList ? (
          <>
            <header className="chat-header">
              <button type="button" onClick={handleBack}>
                ←
              </button>
              <div className="chat-contact">
                <strong>Чаты</strong>
              </div>
              <div style={{ width: '24px' }} />
            </header>

            <div className="chat-list">
              {allChats.length > 0 ? (
                allChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="chat-list-item"
                    onClick={() => handleSelectChat(chat)}
                  >
                    <img src={chat.avatar} alt={chat.contact} />
                    <div className="chat-list-info">
                      <div>
                        <strong>{chat.contact}</strong>
                        {chat.itemTitle && <span>{chat.itemTitle}</span>}
                      </div>
                      {chat.lastMessage && (
                        <p className="chat-list-preview">{chat.lastMessage}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>У вас пока нет чатов. Начните общение с продавцом на рынке.</p>
                </div>
              )}
            </div>
          </>
        ) : currentThread ? (
          <>
            <header className="chat-header">
              <button type="button" onClick={handleBack}>
                ←
              </button>
              <div className="chat-contact">
                <img src={currentThread.avatar} alt={currentThread.contact} />
                <div>
                  <strong>{currentThread.contact}</strong>
                  {currentThread.itemTitle && (
                    <span>{currentThread.itemTitle}</span>
                  )}
                </div>
              </div>
              <button type="button" aria-label="Инфо">
                i
              </button>
            </header>

            <div className="chat-messages">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`chat-bubble ${message.from === 'user' ? 'outgoing' : 'incoming'}`}
                  >
                    <p>{message.text}</p>
                    <span className="meta">{message.time}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state" style={{ marginTop: '20px' }}>
                  <p>Начните общение</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
              <button type="button" aria-label="Вложение">
                +
              </button>
              <input
                type="text"
                placeholder="Сообщение"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
              <button type="button" className="send" onClick={handleSend}>
                ➤
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>Выберите продавца, чтобы начать чат.</p>
          </div>
        )}
      </section>
    </MainLayout>
  )
}

export default Chat

