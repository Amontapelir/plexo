import { useMemo, useState } from 'react'
import MainLayout from '../components/MainLayout'

function Market({ items = [], activeNav, onNavigate, onBuy, onContact }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('newest')
  const [selectedItem, setSelectedItem] = useState(null)

  const categories = useMemo(() => {
    const unique = new Set(items.map((item) => item.category))
    return ['all', ...Array.from(unique)]
  }, [items])

  const filteredItems = useMemo(() => {
    let result = items.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase().trim())
    )
    if (category !== 'all') {
      result = result.filter((item) => item.category === category)
    }
    if (sort === 'price-asc') {
      result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sort === 'price-desc') {
      result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0))
    } else {
      result = [...result]
    }
    return result
  }, [items, query, category, sort])

  const handleCardClick = (item) => {
    setSelectedItem(item)
  }

  const handleClose = () => {
    setSelectedItem(null)
  }

  const handleBuyClick = () => {
    if (!selectedItem) return
    onBuy?.(selectedItem.id)
    handleClose()
  }

  const handleContactClick = () => {
    if (!selectedItem) return
    onContact?.(selectedItem.id)
    handleClose()
  }

  return (
    <MainLayout active={activeNav} onNavigate={onNavigate}>
      <section className="market-page">
        <div className="market-filter-bar">
          <div className="search-input">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M15.5 14h-.79l-.28-.27A6 6 0 1 0 14 15.5l.27.28v.79L20 21 21 20l-5.5-6Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"
                fill="#9C9C9C"
              />
            </svg>
            <input
              type="text"
              placeholder="Поиск вещей"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="filter-controls">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'Все категории' : option}
                </option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Сначала новые</option>
              <option value="price-asc">Цена ↑</option>
              <option value="price-desc">Цена ↓</option>
            </select>
          </div>
        </div>

        <div className="market-grid">
          {filteredItems.map((item) => (
            <article
              className="market-card"
              key={item.id}
              onClick={() => handleCardClick(item)}
            >
              <img src={item.image} alt={item.title} />
              <div className="market-card-body">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.category}</p>
                </div>
                <div className="market-meta">
                  <span className="price">${item.price}</span>
                  <span className="auth">{item.authenticity}%</span>
                </div>
              </div>
              <button className="market-primary" type="button">
                Купить
              </button>
            </article>
          ))}
          {filteredItems.length === 0 && (
            <div className="empty-state market-empty">
              <p>Ничего не нашлось. Попробуйте изменить фильтры.</p>
            </div>
          )}
        </div>
      </section>

      {selectedItem && (
        <div className="analysis-overlay" onClick={handleClose}>
          <div className="analysis-card detail-card market-detail" onClick={(e) => e.stopPropagation()}>
            <button className="detail-back" type="button" onClick={handleClose}>
              ←
            </button>
            <img
              className="market-detail-photo"
              src={selectedItem.image}
              alt={selectedItem.title}
            />
            <div className="detail-meta">
              <h3>{selectedItem.title}</h3>
              <div className="detail-stats">
                <div>
                  <span>Цена</span>
                  <strong className="accent">${selectedItem.price}</strong>
                </div>
                <div>
                  <span>Оригинальность</span>
                  <strong>{selectedItem.authenticity}%</strong>
                </div>
              </div>
            </div>
            <div className="seller-info">
              <img src={selectedItem.sellerAvatar} alt={selectedItem.seller} />
              <div>
                <p>{selectedItem.seller}</p>
                <span>Рейтинг {selectedItem.sellerRating?.toFixed(1) ?? '4.8'}</span>
              </div>
            </div>
            <p className="detail-description">{selectedItem.description}</p>

            <div className="analysis-actions">
              <button type="button" className="analysis-primary" onClick={handleBuyClick}>
                Купить
              </button>
              <button type="button" className="analysis-secondary" onClick={handleContactClick}>
                Написать продавцу
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default Market

