import { useState } from 'react'
import MainLayout from '../components/MainLayout'

const ratingStars = 5

function Profile({
  user,
  items = [],
  savedItems = [],
  activeTab = 'owned',
  onTabChange,
  activeNav,
  onNavigate,
  onDeleteItem,
  onListItem,
  onRemoveSaved,
  onUpdateItem,
}) {
  if (!user) {
    return (
      <div className="app">
        <div className="auth-card">
          <h2>Сначала создайте аккаунт</h2>
          <p className="caption">После регистрации профиль появится здесь</p>
        </div>
      </div>
    )
  }

  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedOrigin, setSelectedOrigin] = useState('owned')
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(null)

  const filledStars = Math.round(user.rating ?? 4.8)

  const handleCardClick = (item, origin) => {
    setSelectedItem(item)
    setSelectedOrigin(origin)
    setEditData({ ...item })
    setIsEditing(false)
  }

  const handleCloseModal = () => {
    setSelectedItem(null)
    setIsEditing(false)
    setEditData(null)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedItem || !editData) return
    
    // Обновляем товар в БД
    if (onUpdateItem) {
      await onUpdateItem(selectedItem.id, editData)
    }
    
    setSelectedItem(editData)
    setIsEditing(false)
  }

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDelete = () => {
    if (!selectedItem) return
    if (selectedOrigin === 'owned') {
      onDeleteItem?.(selectedItem.id)
    } else {
      onRemoveSaved?.(selectedItem.id)
    }
    handleCloseModal()
  }

  const handleList = () => {
    if (selectedItem) {
      onListItem?.(selectedItem.id)
      handleCloseModal()
    }
  }

  return (
    <MainLayout active={activeNav} onNavigate={onNavigate}>
      <section className="profile-page">
        <header className="profile-header">
          <div className="profile-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="avatar-fallback">{user.name?.[0] ?? 'P'}</div>
            )}
          </div>
          <div className="profile-details">
            <h2>{user.name || 'Имя пользователя'}</h2>
            <p className="bio">{user.bio || 'Добавьте короткое описание'}</p>
            <div className="status-list">
              <span>• Профиль подтвержден</span>
              <span>• Вещей: {items.length}</span>
              <span>• Сохранено: {savedItems.length}</span>
            </div>
            <div className="rating">
              {Array.from({ length: ratingStars }).map((_, index) => {
                const isFilled = index < filledStars
                return (
                  <svg
                    key={index}
                    viewBox="0 0 24 24"
                    className={isFilled ? 'filled' : ''}
                    aria-hidden="true"
                  >
                    <path d="M12 3.5 14.09 9H20l-4.91 3.57L17.18 18 12 14.73 6.82 18l1.09-5.43L3 9h5.91L12 3.5Z" />
                  </svg>
                )
              })}
              <span className="rating-value">{(user.rating ?? 4.8).toFixed(1)}</span>
            </div>
          </div>
        </header>

        <div className="profile-tabs">
          <button
            type="button"
            className={activeTab === 'owned' ? 'active' : ''}
            onClick={() => onTabChange?.('owned')}
          >
            Профиль
          </button>
          <button
            type="button"
            className={activeTab === 'saved' ? 'active' : ''}
            onClick={() => onTabChange?.('saved')}
          >
            Сохраненные
          </button>
        </div>

        {activeTab === 'owned' ? (
          items.length > 0 ? (
            <div className="product-grid">
              {items.map((product) => (
                <article
                  className="product-card"
                  key={product.id}
                  onClick={() => handleCardClick(product, 'owned')}
                >
                  <img src={product.image} alt={product.title} />
                  <div className="badge">{product.authenticity}%</div>
                  {product.price && (
                    <div className="price-tag">${product.price}</div>
                  )}
                  <p>{product.title}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Сканируйте первую вещь, чтобы заполнить профиль.</p>
            </div>
          )
        ) : savedItems.length > 0 ? (
          <div className="product-grid">
            {savedItems.map((product) => (
              <article
                className="product-card"
                key={product.id}
                onClick={() => handleCardClick(product, 'saved')}
              >
                <img src={product.image} alt={product.title} />
                <div className="badge">{product.authenticity}%</div>
                {product.price && (
                  <div className="price-tag">${product.price}</div>
                )}
                <p>{product.title}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Здесь будут сохранённые вещи с рынка.</p>
          </div>
        )}
      </section>

      {selectedItem && (
        <div className="analysis-overlay" onClick={handleCloseModal}>
          <div className="analysis-card detail-card" onClick={(e) => e.stopPropagation()}>
            <span className="sheet-handle" aria-hidden="true" />
            <div className="detail-top">
              <img src={selectedItem.image} alt={selectedItem.title} />
              <div className="detail-meta">
                <h3>{selectedItem.title}</h3>
                <p>{selectedItem.category}</p>
                <div className="detail-stats">
                  <div>
                    <span>Цена</span>
                    <strong>{selectedItem.price ? `$${selectedItem.price}` : '─'}</strong>
                  </div>
                  <div>
                    <span>Оригинальность</span>
                    <strong className="accent">{selectedItem.authenticity}%</strong>
                  </div>
                </div>
              </div>
            </div>

            {isEditing ? (
              <>
                <div className="analysis-price">
                  <label htmlFor="edit-title">Название</label>
                  <input
                    id="edit-title"
                    type="text"
                    value={editData?.title || ''}
                    onChange={(e) => handleEditChange('title', e.target.value)}
                    className="analysis-input"
                  />
                </div>
                <div className="analysis-price">
                  <label htmlFor="edit-category">Категория</label>
                  <input
                    id="edit-category"
                    type="text"
                    value={editData?.category || ''}
                    onChange={(e) => handleEditChange('category', e.target.value)}
                    className="analysis-input"
                  />
                </div>
                <div className="analysis-price">
                  <label htmlFor="edit-price">Цена (USD)</label>
                  <input
                    id="edit-price"
                    type="number"
                    value={editData?.price || ''}
                    onChange={(e) => handleEditChange('price', e.target.value)}
                    className="analysis-input"
                  />
                </div>
                <textarea
                  rows={4}
                  value={editData?.description || ''}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  placeholder="Описание"
                />
                <div className="analysis-actions">
                  <button type="button" className="analysis-primary" onClick={handleSaveEdit}>
                    Сохранить
                  </button>
                  <button type="button" className="analysis-secondary" onClick={() => setIsEditing(false)}>
                    Отмена
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="detail-description">{selectedItem.description}</p>

                <div className="analysis-actions">
                  {selectedOrigin === 'owned' ? (
                    <>
                      <button type="button" className="analysis-primary" onClick={handleEdit}>
                        Редактировать
                      </button>
                      <button type="button" className="analysis-secondary" onClick={handleList}>
                        Выставить на рынок
                      </button>
                      <button type="button" className="analysis-secondary danger" onClick={handleDelete}>
                        Удалить вещь
                      </button>
                    </>
                  ) : (
                    <button type="button" className="analysis-secondary danger" onClick={handleDelete}>
                      Удалить из сохраненных
                    </button>
                  )}
                  <button type="button" className="analysis-secondary" onClick={handleCloseModal}>
                    Вернуться к профилю
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default Profile

