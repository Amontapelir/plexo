/**
 * Утилита для работы с IndexedDB
 * Хранит пользователей, товары и чаты
 */

const DB_NAME = 'plexo_db'
const DB_VERSION = 1

// Структура базы данных
const STORES = {
  USERS: 'users',
  ITEMS: 'items',
  CHATS: 'chats',
  MESSAGES: 'messages',
}

let db = null

/**
 * Инициализация базы данных
 */
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('Ошибка открытия базы данных:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result

      // Создаём хранилище пользователей
      if (!database.objectStoreNames.contains(STORES.USERS)) {
        const userStore = database.createObjectStore(STORES.USERS, {
          keyPath: 'id',
          autoIncrement: false,
        })
        userStore.createIndex('email', 'email', { unique: true })
      }

      // Создаём хранилище товаров
      if (!database.objectStoreNames.contains(STORES.ITEMS)) {
        const itemStore = database.createObjectStore(STORES.ITEMS, {
          keyPath: 'id',
          autoIncrement: false,
        })
        itemStore.createIndex('userId', 'userId', { unique: false })
        itemStore.createIndex('category', 'category', { unique: false })
        itemStore.createIndex('listedAt', 'listedAt', { unique: false })
      }

      // Создаём хранилище чатов
      if (!database.objectStoreNames.contains(STORES.CHATS)) {
        const chatStore = database.createObjectStore(STORES.CHATS, {
          keyPath: 'id',
          autoIncrement: false,
        })
        chatStore.createIndex('userId', 'userId', { unique: false })
        chatStore.createIndex('contactId', 'contactId', { unique: false })
        chatStore.createIndex('updatedAt', 'updatedAt', { unique: false })
      }

      // Создаём хранилище сообщений
      if (!database.objectStoreNames.contains(STORES.MESSAGES)) {
        const messageStore = database.createObjectStore(STORES.MESSAGES, {
          keyPath: 'id',
          autoIncrement: false,
        })
        messageStore.createIndex('chatId', 'chatId', { unique: false })
        messageStore.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

/**
 * Получить базу данных (инициализирует если нужно)
 */
const getDB = async () => {
  if (!db) {
    await initDB()
  }
  return db
}

// ========== ПОЛЬЗОВАТЕЛИ ==========

/**
 * Сохранить пользователя
 */
export const saveUser = async (user) => {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.USERS], 'readwrite')
    const store = transaction.objectStore(STORES.USERS)
    const request = store.put({
      ...user,
      updatedAt: new Date().toISOString(),
    })

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Получить пользователя по ID
 */
export const getUser = async (userId) => {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.USERS], 'readonly')
    const store = transaction.objectStore(STORES.USERS)
    const request = store.get(userId)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Получить пользователя по email
 */
export const getUserByEmail = async (email) => {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.USERS], 'readonly')
    const store = transaction.objectStore(STORES.USERS)
    const index = store.index('email')
    const request = index.get(email)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Получить всех пользователей
 */
export const getAllUsers = async () => {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.USERS], 'readonly')
    const store = transaction.objectStore(STORES.USERS)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

// ========== ТОВАРЫ ==========

/**
 * Сохранить товар
 */
export const saveItem = async (item) => {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.ITEMS], 'readwrite')
    const store = transaction.objectStore(STORES.ITEMS)
    const itemData = {
      ...item,
      id: item.id || crypto.randomUUID(),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const request = store.put(itemData)

    request.onsuccess = () => resolve(itemData)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Получить товар по ID
 */
export const getItem = async (itemId) => {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.ITEMS], 'readonly')
    const store = transaction.objectStore(STORES.ITEMS)
    const request = store.get(itemId)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Получить все товары пользователя
 */
export const getUserItems = async (userId) => {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.ITEMS], 'readonly')
    const store = transaction.objectStore(STORES.ITEMS)
    const index = store.index('userId')
    const request = index.getAll(userId)

    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

/**
 * Получить все товары на рынке (listed = true)
 */
export const getMarketItems = async () => {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.ITEMS], 'readonly')
    const store = transaction.objectStore(STORES.ITEMS)
    const request = store.getAll()

    request.onsuccess = () => {
      const items = (request.result || []).filter((item) => item.listed === true)
      // Сортируем по дате размещения
      items.sort((a, b) => {
        const dateA = new Date(a.listedAt || 0)
        const dateB = new Date(b.listedAt || 0)
        return dateB - dateA
      })
      resolve(items)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Удалить товар
 */
export const deleteItem = async (itemId) => {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.ITEMS], 'readwrite')
    const store = transaction.objectStore(STORES.ITEMS)
    const request = store.delete(itemId)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Разместить товар на рынке
 */
export const listItemOnMarket = async (itemId, sellerInfo) => {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.ITEMS], 'readwrite')
    const store = transaction.objectStore(STORES.ITEMS)
    const getRequest = store.get(itemId)

    getRequest.onsuccess = () => {
      const item = getRequest.result
      if (!item) {
        reject(new Error('Товар не найден'))
        return
      }

      const updatedItem = {
        ...item,
        listed: true,
        listedAt: new Date().toISOString(),
        seller: sellerInfo.name,
        sellerAvatar: sellerInfo.avatar,
        sellerRating: sellerInfo.rating,
        sellerId: sellerInfo.id,
      }

      const putRequest = store.put(updatedItem)
      putRequest.onsuccess = () => resolve(updatedItem)
      putRequest.onerror = () => reject(putRequest.error)
    }

    getRequest.onerror = () => reject(getRequest.error)
  })
}

// ========== ЧАТЫ ==========

/**
 * Создать или получить чат
 */
export const getOrCreateChat = async (userId, contactId, contactInfo, itemInfo = null) => {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CHATS], 'readwrite')
    const store = transaction.objectStore(STORES.CHATS)
    const index = store.index('userId')

    // Ищем существующий чат
    const request = index.getAll(userId)

    request.onsuccess = () => {
      const chats = request.result || []
      const existingChat = chats.find((chat) => chat.contactId === contactId)

      if (existingChat) {
        resolve(existingChat)
        return
      }

      // Создаём новый чат
      const newChat = {
        id: crypto.randomUUID(),
        userId,
        contactId,
        contact: contactInfo.name,
        avatar: contactInfo.avatar,
        itemTitle: itemInfo?.title || null,
        itemId: itemInfo?.id || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const putRequest = store.put(newChat)
      putRequest.onsuccess = () => resolve(newChat)
      putRequest.onerror = () => reject(putRequest.error)
    }

    request.onerror = () => reject(request.error)
  })
}

/**
 * Получить все чаты пользователя
 */
export const getUserChats = async (userId) => {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CHATS], 'readonly')
    const store = transaction.objectStore(STORES.CHATS)
    const index = store.index('userId')
    const request = index.getAll(userId)

    request.onsuccess = async () => {
      const chats = request.result || []
      
      // Загружаем последние сообщения для каждого чата
      const chatsWithMessages = await Promise.all(
        chats.map(async (chat) => {
          const messages = await getChatMessages(chat.id)
          const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null
          
          return {
            ...chat,
            lastMessage: lastMessage?.text || null,
            messages: messages,
          }
        })
      )

      // Сортируем по дате обновления
      chatsWithMessages.sort((a, b) => {
        const dateA = new Date(a.updatedAt || 0)
        const dateB = new Date(b.updatedAt || 0)
        return dateB - dateA
      })

      resolve(chatsWithMessages)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Получить чат по ID
 */
export const getChat = async (chatId) => {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CHATS], 'readonly')
    const store = transaction.objectStore(STORES.CHATS)
    const request = store.get(chatId)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// ========== СООБЩЕНИЯ ==========

/**
 * Сохранить сообщение
 */
export const saveMessage = async (chatId, message) => {
  const database = await getDB()
  return new Promise(async (resolve, reject) => {
    const transaction = database.transaction([STORES.MESSAGES, STORES.CHATS], 'readwrite')
    const messageStore = transaction.objectStore(STORES.MESSAGES)
    const chatStore = transaction.objectStore(STORES.CHATS)

    const messageData = {
      id: message.id || crypto.randomUUID(),
      chatId,
      from: message.from,
      text: message.text,
      timestamp: message.timestamp || new Date().toISOString(),
      time: message.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const putRequest = messageStore.put(messageData)

    putRequest.onsuccess = async () => {
      // Обновляем время последнего сообщения в чате
      const chat = await getChat(chatId)
      if (chat) {
        chat.updatedAt = new Date().toISOString()
        chatStore.put(chat)
      }
      resolve(messageData)
    }

    putRequest.onerror = () => reject(putRequest.error)
  })
}

/**
 * Получить все сообщения чата
 */
export const getChatMessages = async (chatId) => {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.MESSAGES], 'readonly')
    const store = transaction.objectStore(STORES.MESSAGES)
    const index = store.index('chatId')
    const request = index.getAll(chatId)

    request.onsuccess = () => {
      const messages = request.result || []
      // Сортируем по времени
      messages.sort((a, b) => {
        const dateA = new Date(a.timestamp || 0)
        const dateB = new Date(b.timestamp || 0)
        return dateA - dateB
      })
      resolve(messages)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Очистить базу данных (для тестирования)
 */
export const clearDB = async () => {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      [STORES.USERS, STORES.ITEMS, STORES.CHATS, STORES.MESSAGES],
      'readwrite'
    )

    const clearStore = (storeName) => {
      return new Promise((res, rej) => {
        const store = transaction.objectStore(storeName)
        const request = store.clear()
        request.onsuccess = () => res()
        request.onerror = () => rej(request.error)
      })
    }

    Promise.all([
      clearStore(STORES.USERS),
      clearStore(STORES.ITEMS),
      clearStore(STORES.CHATS),
      clearStore(STORES.MESSAGES),
    ])
      .then(() => resolve())
      .catch((err) => reject(err))
  })
}

