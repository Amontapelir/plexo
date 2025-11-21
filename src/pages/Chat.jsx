import { useEffect, useMemo, useState } from 'react'
import MainLayout from '../components/MainLayout'

function Chat({ activeNav, onNavigate, chats = [], thread = null }) {
  const initialThread = useMemo(() => thread || chats[0] || null, [thread, chats])
  const [currentThread, setCurrentThread] = useState(initialThread)
  const [messages, setMessages] = useState(initialThread?.messages || [])
  const [input, setInput] = useState('')

  useEffect(() => {
    setCurrentThread(initialThread)
    setMessages(initialThread?.messages || [])
  }, [initialThread])

  const handleSend = () => {
    if (!input.trim()) return
    const newMessage = {
      id: `m-${Date.now()}`,
      from: 'user',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, newMessage])
    setInput('')
  }

  const handleBack = () => {
    onNavigate?.('market')
  }

  return (
    <MainLayout active={activeNav} onNavigate={onNavigate}>
      <section className="chat-page">
        {currentThread ? (
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

            <div className="chat-search">
              <input type="text" placeholder="Поиск по сообщениям" />
            </div>

            <div className="chat-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-bubble ${message.from === 'user' ? 'outgoing' : 'incoming'}`}
                >
                  <p>{message.text}</p>
                  <span className="meta">{message.time}</span>
                </div>
              ))}
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

