import { useEffect, useRef, useState } from 'react'
import MainLayout from '../components/MainLayout'
import ObjectDetector from '../components/ObjectDetector'

const initialDraft = {
  title: 'Без названия',
  category: 'Категория',
  authenticity: 80,
  price: '',
  description:
    'Добавьте описание вещи: материалы, состояние, история или интересные детали.',
  image: '',
  brand: '',
  model: '',
}

function Scanner({ activeNav, onNavigate, onSaveItem }) {
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [analysisOpen, setAnalysisOpen] = useState(false)
  const [draft, setDraft] = useState(initialDraft)
  const [isFlying, setIsFlying] = useState(false)
  const [touchStartY, setTouchStartY] = useState(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [errorHint, setErrorHint] = useState('')
  const [errorShake, setErrorShake] = useState(false)
  const [successToast, setSuccessToast] = useState(false)
  const [stream, setStream] = useState(null)
  const [facingMode, setFacingMode] = useState('environment') // 'user' для фронтальной, 'environment' для задней
  const [cameraError, setCameraError] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const fileInputRef = useRef(null)

  // Инициализация камеры
  useEffect(() => {
    let currentStream = null
    
    const startCamera = async () => {
      try {
        // Останавливаем предыдущий поток если есть
        if (currentStream) {
          currentStream.getTracks().forEach((track) => track.stop())
        }
        
        const constraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
        currentStream = mediaStream
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
        setCameraError(null)
      } catch (err) {
        console.error('Ошибка доступа к камере:', err)
        setCameraError('Не удалось получить доступ к камере. Проверьте разрешения.')
      }
    }

    startCamera()

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [facingMode])

  useEffect(() => {
    if (isScanning) {
      animationRef.current = requestAnimationFrame(updateProgress)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isScanning])

  useEffect(() => {
    if (!isScanning && progress === 1 && draft.image && !isAnalyzing) {
      const timer = setTimeout(() => {
        if (!isAnalyzing) {
          setAnalysisOpen(true)
          setProgress(0)
        }
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [isScanning, progress, draft.image, isAnalyzing])

  const updateProgress = () => {
    setProgress((prev) => {
      const next = prev + 0.01
      if (next >= 1) {
        setIsScanning(false)
        return 1
      }
      animationRef.current = requestAnimationFrame(updateProgress)
      return next
    })
  }

  const resetDraft = () => {
    setDraft((prev) => ({
      ...initialDraft,
      image: prev.image,
    }))
  }

  const handleCapture = () => {
    if (isScanning || !videoRef.current) return
    
    // Создаём снимок с видео
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      
      const imageData = canvas.toDataURL('image/jpeg')
      // Устанавливаем изображение и запускаем анализ
      setDraft((prev) => {
        const newDraft = { ...initialDraft, image: imageData }
        // Запускаем анализ после установки изображения
        setTimeout(() => {
          setIsAnalyzing(true)
          setAnalysisProgress(0)
        }, 100)
        return newDraft
      })
    }
    
    setProgress(0)
    setIsScanning(true)
    setErrorHint('')
    setErrorShake(false)
  }

  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }

  const handleObjectDetect = (results) => {
    if (results) {
      // Симулируем прогресс анализа
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += 10
        setAnalysisProgress(progress)
        if (progress >= 100) {
          clearInterval(progressInterval)
          setIsAnalyzing(false)
          setDraft((prev) => ({
            ...prev,
            title: results.title || prev.title,
            category: results.category || prev.category,
            authenticity: results.authenticity || prev.authenticity,
            description: results.description || prev.description,
            price: results.price || prev.price,
            brand: results.brand || prev.brand,
            model: results.model || prev.model,
          }))
          // Открываем окно анализа после завершения
          setTimeout(() => {
            setAnalysisOpen(true)
            setIsAnalyzing(false)
            setProgress(0)
          }, 300)
        }
      }, 150)
    }
  }

  const handleFieldChange = (field, value) => {
    if (errorHint) {
      setErrorHint('')
      setErrorShake(false)
    }
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (errorHint) {
      setErrorHint('')
      setErrorShake(false)
    }
    const reader = new FileReader()
    reader.onload = () => {
      const imageData = reader.result
      // Сначала устанавливаем изображение, затем запускаем анализ
      setDraft((prev) => {
        const newDraft = { ...initialDraft, image: imageData }
        // Запускаем анализ после установки изображения
        setTimeout(() => {
          setIsAnalyzing(true)
          setAnalysisProgress(0)
        }, 100)
        return newDraft
      })
    }
    reader.readAsDataURL(file)
  }

  const handleGalleryClick = () => {
    fileInputRef.current?.click()
  }

  const handleModalClose = () => {
    setAnalysisOpen(false)
    setIsFlying(false)
    setDragOffset(0)
    setTouchStartY(null)
  setErrorHint('')
  setErrorShake(false)
  }

  const handleAddToProfile = () => {
    if (!draft.title.trim() || !draft.image) {
      setErrorHint('Добавьте фото и название, чтобы продолжить.')
      setErrorShake(true)
      setTimeout(() => setErrorShake(false), 600)
      return
    }
    setIsFlying(true)
    setTimeout(() => {
      onSaveItem?.({
        ...draft,
        price: draft.price ? Number(draft.price) : null,
      })
      handleModalClose()
      setSuccessToast(true)
      setTimeout(() => setSuccessToast(false), 1000)
    }, 450)
  }

  const handleTouchStart = (event) => {
    setTouchStartY(event.touches[0].clientY)
  }

  const handleTouchMove = (event) => {
    if (touchStartY === null) return
    const currentY = event.touches[0].clientY
    const delta = Math.max(0, currentY - touchStartY)
    setDragOffset(delta)
  }

  const handleTouchEnd = () => {
    if (dragOffset > 90) {
      handleModalClose()
    }
    setDragOffset(0)
    setTouchStartY(null)
  }

  const showWarning = draft.authenticity < 55

  return (
    <MainLayout active={activeNav} onNavigate={onNavigate}>
      <section className="scanner-page">
        <div className={`camera-frame${isScanning ? ' scanning' : ''}`}>
          {cameraError ? (
            <div className="frame-overlay">
              <span style={{ color: 'var(--color-danger)' }}>{cameraError}</span>
              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  setCameraError(null)
                  const startCamera = async () => {
                    try {
                      const constraints = {
                        video: {
                          facingMode: facingMode,
                          width: { ideal: 1280 },
                          height: { ideal: 720 },
                        },
                      }
                      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
                      setStream(mediaStream)
                      if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream
                      }
                      setCameraError(null)
                    } catch (err) {
                      setCameraError('Не удалось получить доступ к камере.')
                    }
                  }
                  startCamera()
                }}
                style={{ marginTop: '16px' }}
              >
                Попробовать снова
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '24px',
                }}
              />
              <div className="frame-overlay" style={{ pointerEvents: 'none' }}>
                <span>Наведи предмет и нажми «Сканировать»</span>
              </div>
              <div className="frame-corners" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, index) => (
                  <span key={index} className={`corner corner-${index + 1}`} />
                ))}
              </div>
            </>
          )}
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="scanner-controls">
          <button 
            type="button" 
            className="round-btn" 
            aria-label="Выбрать из галереи"
            onClick={handleGalleryClick}
          >
            <svg viewBox="0 0 24 24">
              <path
                d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
                fill="currentColor"
              />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className={`capture-btn${isScanning ? ' active' : ''}`}
            onClick={handleCapture}
            aria-label="Сделать снимок"
            disabled={cameraError}
          >
            <span className="capture-ring" />
            <span className="capture-core" />
            {isScanning && (
              <svg className="progress-ring" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  style={{ strokeDashoffset: 339.292 - 339.292 * progress }}
                />
              </svg>
            )}
          </button>

          <button
            type="button"
            className="round-btn"
            aria-label="Переключить камеру"
            onClick={handleToggleCamera}
            disabled={cameraError}
          >
            <svg viewBox="0 0 24 24">
              <path
                d="M12 6V4l4 3-4 3V8c-2.21 0-4 1.79-4 4 0 .46.08.9.23 1.3l-1.5 1.5A5.98 5.98 0 0 1 6 12c0-3.31 2.69-6 6-6Zm5.77 1.7A5.98 5.98 0 0 1 18 12c0 3.31-2.69 6-6 6v2l-4-3 4-3v2c2.21 0 4-1.79 4-4 0-.46-.08-.9-.23-1.3l1.5-1.5Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </section>

      {successToast && (
        <div className="capture-toast" role="status" aria-live="polite">
          <svg viewBox="0 0 24 24">
            <path
              d="m9 16.17-3.59-3.58L4 14l5 5 11-11-1.41-1.41z"
              fill="#55CC88"
            />
          </svg>
          <span>Добавлено в профиль</span>
        </div>
      )}

      {isAnalyzing && (
        <div className="analysis-overlay">
          <div className="analysis-loading">
            <div className="loading-spinner" />
            <h3>Анализ вещи...</h3>
            <p>Нейросеть определяет название, бренд, цену и оригинальность</p>
            <div className="loading-progress">
              <div 
                className="loading-progress-bar" 
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {analysisOpen && !isAnalyzing && (
        <div className={`analysis-overlay${isFlying ? ' flying' : ''}`} onClick={handleModalClose}>
          <div
            className={`analysis-card${isFlying ? ' fly-out' : ''}${errorShake ? ' shake' : ''}`}
            style={{ transform: dragOffset ? `translateY(${dragOffset}px)` : undefined }}
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <span className="sheet-handle" aria-hidden="true" />
            {errorHint && (
              <p className="shake-hint" role="alert">
                {errorHint}
              </p>
            )}
            <div className="analysis-top">
              <label className="analysis-photo">
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {draft.image ? (
                  <img src={draft.image} alt={draft.title} />
                ) : (
                  <div className="photo-placeholder">
                    <span>Добавить фото</span>
                  </div>
                )}
              </label>
              <div className="analysis-meta">
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="analysis-input title"
                  placeholder="Название"
                />
                <input
                  type="text"
                  value={draft.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  className="analysis-input subtitle"
                  placeholder="Категория"
                />
                {draft.brand && (
                  <input
                    type="text"
                    value={draft.brand}
                    onChange={(e) => handleFieldChange('brand', e.target.value)}
                    className="analysis-input subtitle"
                    placeholder="Бренд"
                  />
                )}
                {draft.model && (
                  <input
                    type="text"
                    value={draft.model}
                    onChange={(e) => handleFieldChange('model', e.target.value)}
                    className="analysis-input subtitle"
                    placeholder="Модель"
                  />
                )}
                <div className="analysis-auth">
                  <div>
                    <span>Оригинальность</span>
                    <strong>
                      {draft.price ? `$${draft.price}` : 'Добавьте цену'}
                    </strong>
                  </div>
                  <div className="progress-circle">
                    <svg viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" />
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        style={{
                          strokeDashoffset: 326.72 - (326.72 * draft.authenticity) / 100,
                        }}
                      />
                    </svg>
                    <span>{draft.authenticity}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="analysis-slider">
              <label htmlFor="auth-range">Уровень оригинальности</label>
              <div>
                <input
                  id="auth-range"
                  type="range"
                  min="0"
                  max="100"
                  value={draft.authenticity}
                  onChange={(e) =>
                    handleFieldChange('authenticity', Number(e.target.value))
                  }
                />
                <span>{draft.authenticity}%</span>
              </div>
            </div>

            <div className="analysis-price">
              <label htmlFor="price-input">Цена (USD)</label>
              <input
                id="price-input"
                type="number"
                min="0"
                placeholder="150"
                value={draft.price}
                onChange={(e) => handleFieldChange('price', e.target.value)}
              />
            </div>

            <textarea
              rows={4}
              value={draft.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
            />

            {showWarning && (
              <div className="analysis-warning">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 2 1 21h22L12 2Zm0 6 4 7H8l4-7Zm-1 8h2v2h-2v-2Z"
                    fill="#FFB24E"
                  />
                </svg>
                <span>Вещь может быть сомнительной. Проверьте описание.</span>
              </div>
            )}

            <div className="analysis-actions">
              <button type="button" className="analysis-primary" onClick={handleAddToProfile}>
                Добавить в профиль
              </button>
              <button type="button" className="analysis-secondary" onClick={() => resetDraft()}>
                Редактировать
              </button>
            </div>
          </div>
        </div>
      )}

      {draft.image && (
        <ObjectDetector image={draft.image} onDetect={handleObjectDetect} />
      )}
    </MainLayout>
  )
}

export default Scanner

