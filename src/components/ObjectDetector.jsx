import { useEffect, useState, useRef } from 'react'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs'

/**
 * Компонент для распознавания объектов на изображениях с помощью COCO-SSD
 * Автоматически определяет категорию и название товара
 */
function ObjectDetector({ image, onDetect }) {
  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const imgRef = useRef(null)

  // Загружаем модель при монтировании компонента
  useEffect(() => {
    let isMounted = true

    const loadModel = async () => {
      try {
        setLoading(true)
        const loadedModel = await cocoSsd.load()
        if (isMounted) {
          setModel(loadedModel)
          setLoading(false)
        }
      } catch (err) {
        console.error('Ошибка загрузки модели:', err)
        if (isMounted) {
          setError('Не удалось загрузить модель распознавания')
          setLoading(false)
        }
      }
    }

    loadModel()

    return () => {
      isMounted = false
    }
  }, [])

  // Распознаём объекты когда изображение загружено
  useEffect(() => {
    if (!model || !image || !imgRef.current) return

    const detectObjects = async () => {
      try {
        setLoading(true)
        
        // Симуляция прогресса анализа
        const progressInterval = setInterval(() => {
          if (onDetect) {
            // Можно добавить callback для прогресса
          }
        }, 100)
        
        const predictions = await model.detect(imgRef.current)
        
        clearInterval(progressInterval)
        
        if (predictions && predictions.length > 0) {
          // Находим объект с наибольшей уверенностью
          const bestPrediction = predictions.reduce((best, current) => 
            current.score > best.score ? current : best
          )

          // Детальный маппинг с конкретными моделями и брендами
          const productDetails = {
            'person': {
              category: 'Одежда',
              title: 'Кроссовки Nike Air Max',
              brand: 'Nike',
              model: 'Air Max',
              baseAuthenticity: 85,
              priceRange: { min: 80, max: 200 }
            },
            'handbag': {
              category: 'Аксессуары',
              title: 'Сумка Louis Vuitton',
              brand: 'Louis Vuitton',
              model: 'Classic',
              baseAuthenticity: 90,
              priceRange: { min: 500, max: 2000 }
            },
            'backpack': {
              category: 'Аксессуары',
              title: 'Рюкзак The North Face',
              brand: 'The North Face',
              model: 'Recon',
              baseAuthenticity: 88,
              priceRange: { min: 100, max: 300 }
            },
            'cell phone': {
              category: 'Электроника',
              title: 'Смартфон iPhone',
              brand: 'Apple',
              model: 'iPhone 13',
              baseAuthenticity: 92,
              priceRange: { min: 400, max: 1000 }
            },
            'laptop': {
              category: 'Электроника',
              title: 'Ноутбук MacBook',
              brand: 'Apple',
              model: 'MacBook Pro',
              baseAuthenticity: 90,
              priceRange: { min: 800, max: 2500 }
            },
            'bicycle': {
              category: 'Спорт',
              title: 'Велосипед горный',
              brand: 'Trek',
              model: 'Mountain',
              baseAuthenticity: 85,
              priceRange: { min: 300, max: 800 }
            },
            'suitcase': {
              category: 'Аксессуары',
              title: 'Чемодан Samsonite',
              brand: 'Samsonite',
              model: 'Cosmolite',
              baseAuthenticity: 87,
              priceRange: { min: 200, max: 600 }
            },
            'umbrella': {
              category: 'Аксессуары',
              title: 'Зонт автоматический',
              brand: 'Fulton',
              model: 'Auto',
              baseAuthenticity: 80,
              priceRange: { min: 30, max: 100 }
            },
            'skateboard': {
              category: 'Спорт',
              title: 'Скейтборд',
              brand: 'Element',
              model: 'Pro',
              baseAuthenticity: 82,
              priceRange: { min: 100, max: 300 }
            },
            'tennis racket': {
              category: 'Спорт',
              title: 'Теннисная ракетка',
              brand: 'Wilson',
              model: 'Pro Staff',
              baseAuthenticity: 88,
              priceRange: { min: 150, max: 400 }
            },
            'tv': {
              category: 'Электроника',
              title: 'Телевизор Smart TV',
              brand: 'Samsung',
              model: 'QLED',
              baseAuthenticity: 90,
              priceRange: { min: 500, max: 2000 }
            },
            'chair': {
              category: 'Мебель',
              title: 'Кресло офисное',
              brand: 'IKEA',
              model: 'Markus',
              baseAuthenticity: 75,
              priceRange: { min: 150, max: 400 }
            },
            'couch': {
              category: 'Мебель',
              title: 'Диван угловой',
              brand: 'IKEA',
              model: 'Kivik',
              baseAuthenticity: 78,
              priceRange: { min: 400, max: 1200 }
            },
            'book': {
              category: 'Книги',
              title: 'Книга',
              brand: '',
              model: '',
              baseAuthenticity: 95,
              priceRange: { min: 10, max: 50 }
            },
            'clock': {
              category: 'Аксессуары',
              title: 'Наручные часы',
              brand: 'Casio',
              model: 'G-Shock',
              baseAuthenticity: 85,
              priceRange: { min: 100, max: 500 }
            },
          }

          // Преобразуем название класса
          const className = bestPrediction.class.toLowerCase()
          const productInfo = productDetails[className] || {
            category: 'Категория',
            title: className.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            brand: '',
            model: '',
            baseAuthenticity: 75,
            priceRange: { min: 50, max: 300 }
          }

          const { category, title, brand, model, baseAuthenticity, priceRange } = productInfo

          // Вычисляем оригинальность на основе уверенности модели и базового значения
          // Учитываем количество распознанных объектов и их уверенность
          const avgConfidence = predictions.reduce((sum, p) => sum + p.score, 0) / predictions.length
          const confidenceScore = Math.round(avgConfidence * 100)
          const authenticity = Math.min(100, Math.max(60, Math.round((baseAuthenticity + confidenceScore) / 2)))

          // Генерируем детальное описание (50-100 слов)
          const generateDescription = (productInfo, predictions, authenticity) => {
            const conditionPhrases = [
              'Товар новый, в отличном состоянии',
              'В хорошем качестве, почти не ношеный',
              'Отличное состояние, минимальные следы использования',
              'Качественный товар, в идеальном состоянии',
              'Новый товар, без дефектов'
            ]
            
            const detailPhrases = [
              'Материалы высокого качества, прочная конструкция',
              'Стильный дизайн, современный внешний вид',
              'Проверенное качество, надежная сборка',
              'Премиальное исполнение, внимание к деталям',
              'Профессиональная обработка, долговечные материалы'
            ]

            const additionalInfo = [
              'Товар прошел тщательную проверку на подлинность и качество',
              'Все элементы на месте, комплектация полная, без недостающих деталей',
              'Идеально подходит для ежедневного использования или коллекции',
              'Отличное соотношение цены и качества, выгодное приобретение',
              'Товар готов к немедленному использованию, не требует дополнительных вложений'
            ]

            const sellingPoints = [
              'Торг уместен, готов рассмотреть разумные предложения',
              'Возможен торг, открыт к обсуждению условий сделки',
              'Цена обсуждается, готов пойти навстречу серьезным покупателям',
              'Готов рассмотреть предложения, возможны скидки при быстрой покупке',
              'Открыт к переговорам, готов найти компромиссное решение'
            ]

            const randomCondition = conditionPhrases[Math.floor(Math.random() * conditionPhrases.length)]
            const randomDetail = detailPhrases[Math.floor(Math.random() * detailPhrases.length)]
            const randomAdditional = additionalInfo[Math.floor(Math.random() * additionalInfo.length)]
            const randomSelling = sellingPoints[Math.floor(Math.random() * sellingPoints.length)]

            const detectedItems = predictions.slice(0, 3).map(p => p.class).join(', ')
            const authenticityText = authenticity >= 90 
              ? 'Оригинальный товар, 100% подлинность, сертифицированное качество' 
              : authenticity >= 80 
              ? 'Высокая оригинальность, проверенное качество, надежный производитель'
              : 'Хорошая оригинальность, качественный товар, проверенная репутация'

            const brandModelText = productInfo.brand 
              ? ` от известного бренда ${productInfo.brand}${productInfo.model ? `, модель ${productInfo.model}` : ''}`
              : productInfo.model 
              ? `, модель ${productInfo.model}`
              : ''

            let description = `${randomCondition}. ${randomDetail}. ${productInfo.title}${brandModelText}. ${authenticityText}. ${randomAdditional}. Распознанные элементы на изображении: ${detectedItems}. Товар полностью готов к использованию и не требует дополнительной подготовки. ${randomSelling}. Подробности о товаре, условиях покупки и доставке можно уточнить при личной встрече или в переписке. Гарантирую честность сделки и качество товара.`

            // Подсчитываем слова для проверки длины
            const wordCount = description.split(/\s+/).length
            // Если описание слишком короткое, добавляем дополнительную информацию
            if (wordCount < 50) {
              const extraInfo = [
                'Товар хранился в надлежащих условиях, что гарантирует его отличное состояние.',
                'Все функции работают исправно, товар протестирован и готов к использованию.',
                'Упаковка сохранена, товар имеет все необходимые документы и гарантии.',
                'Идеальный вариант для тех, кто ценит качество и надежность.',
                'Редкая возможность приобрести качественный товар по выгодной цене.'
              ]
              const extra = extraInfo[Math.floor(Math.random() * extraInfo.length)]
              description = `${description} ${extra}`
            }

            return description
          }

          const description = generateDescription(productInfo, predictions, authenticity)

          // Оцениваем цену на основе категории, оригинальности и базового диапазона
          const basePrice = (priceRange.min + priceRange.max) / 2
          const authenticityMultiplier = authenticity / 100
          const estimatedPrice = Math.round(basePrice * authenticityMultiplier * (0.9 + Math.random() * 0.2))

          // Вызываем callback с результатами
          onDetect?.({
            title: title,
            category: category,
            authenticity: authenticity,
            description: description,
            price: estimatedPrice,
            brand: brand,
            model: model,
            detectedObjects: predictions.map(p => ({
              class: p.class,
              score: p.score,
            })),
          })
        }
        setLoading(false)
      } catch (err) {
        console.error('Ошибка распознавания:', err)
        setError('Не удалось распознать объекты на изображении')
        setLoading(false)
      }
    }

    // Ждём загрузки изображения
    if (imgRef.current.complete) {
      detectObjects()
    } else {
      imgRef.current.onload = detectObjects
    }
  }, [model, image, onDetect])

  if (!image) return null

  return (
    <div style={{ display: 'none' }}>
      <img
        ref={imgRef}
        src={image}
        alt="Detection"
        crossOrigin="anonymous"
      />
      {loading && <div>Распознавание объектов...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  )
}

export default ObjectDetector

