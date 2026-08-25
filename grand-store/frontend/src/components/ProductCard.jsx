import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GitCompareArrows, Heart, Search, ShoppingBag, Plus, Store } from 'lucide-react'
import IconButton from './IconButton'
import { useWishlist } from '../wishlistContext'
import Price from './ui/Price'

const fallbackBadges = ['Just in', 'Limited', 'Cellar pick', 'New vintage', 'Sommelier pick']
const trimmedUploadCache = new Map()
const vendorImageFitVersion = 'full-bottle-v4'
const preparedVendorImages = {
  '/uploads/images-1787292711461.png': '/assets/products/vendor/whisky-tona-full.png',
}

const resolveImageUrl = (src) => {
  if (!src) return '';
  const normalizedSrc = String(src).replace(/\\/g, '/');
  
  const prepared = Object.entries(preparedVendorImages)
    .find(([uploadPath]) => normalizedSrc.includes(uploadPath))?.[1];
  if (prepared) return prepared;
  
  if (normalizedSrc.startsWith('http://') || normalizedSrc.startsWith('https://')) {
    return normalizedSrc;
  }
  
  if (normalizedSrc.includes('uploads/')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5015';
    const cleanPath = normalizedSrc.substring(normalizedSrc.indexOf('uploads/'));
    return `${apiUrl.replace(/\/$/, '')}/${cleanPath}`;
  }
  
  return normalizedSrc;
};

function VendorProductImage({ src, alt }) {
  const resolvedSrc = resolveImageUrl(src);
  const cacheKey = `${vendorImageFitVersion}:${resolvedSrc}`
  const [displaySource, setDisplaySource] = useState(() => trimmedUploadCache.get(cacheKey) || resolvedSrc)

  useEffect(() => {
    if (!resolvedSrc || !resolvedSrc.includes('/uploads/') || trimmedUploadCache.has(cacheKey)) {
      setDisplaySource(trimmedUploadCache.get(cacheKey) || resolvedSrc)
      return undefined
    }

    let cancelled = false
    const sourceImage = new Image()
    sourceImage.decoding = 'async'
    sourceImage.crossOrigin = 'anonymous'

    sourceImage.onload = () => {
      try {
        const naturalWidth = sourceImage.naturalWidth
        const naturalHeight = sourceImage.naturalHeight
        const analysisScale = Math.min(1, 800 / Math.max(naturalWidth, naturalHeight))
        const analysisWidth = Math.max(1, Math.round(naturalWidth * analysisScale))
        const analysisHeight = Math.max(1, Math.round(naturalHeight * analysisScale))
        const analysisCanvas = document.createElement('canvas')
        const analysisContext = analysisCanvas.getContext('2d', { willReadFrequently: true })

        if (!analysisContext) return

        analysisCanvas.width = analysisWidth
        analysisCanvas.height = analysisHeight
        analysisContext.drawImage(sourceImage, 0, 0, analysisWidth, analysisHeight)

        const pixels = analysisContext.getImageData(0, 0, analysisWidth, analysisHeight).data
        let minX = analysisWidth
        let minY = analysisHeight
        let maxX = -1
        let maxY = -1

        for (let y = 0; y < analysisHeight; y += 1) {
          for (let x = 0; x < analysisWidth; x += 1) {
            const alpha = pixels[((y * analysisWidth) + x) * 4 + 3]
            if (alpha <= 12) continue
            minX = Math.min(minX, x)
            minY = Math.min(minY, y)
            maxX = Math.max(maxX, x)
            maxY = Math.max(maxY, y)
          }
        }

        if (maxX < minX || maxY < minY) return

        const visibleWidth = maxX - minX + 1
        const visibleHeight = maxY - minY + 1
        const needsTrim = visibleWidth < analysisWidth * 0.88 || visibleHeight < analysisHeight * 0.88

        if (!needsTrim) {
          trimmedUploadCache.set(cacheKey, resolvedSrc)
          return
        }

        const sourceX = minX / analysisScale
        const sourceY = minY / analysisScale
        const sourceWidth = visibleWidth / analysisScale
        const sourceHeight = visibleHeight / analysisScale
        // Pad from the detected object dimensions rather than the longest
        // side. This preserves a natural portrait ratio for tall bottles.
        const horizontalPadding = sourceWidth * 0.12
        const topPadding = sourceHeight * 0.08
        const bottomPadding = sourceHeight * 0.18
        const paddedWidth = sourceWidth + (horizontalPadding * 2)
        const paddedHeight = sourceHeight + topPadding + bottomPadding
        const outputScale = Math.min(1, 1200 / Math.max(paddedWidth, paddedHeight))
        const outputCanvas = document.createElement('canvas')
        const outputContext = outputCanvas.getContext('2d')

        if (!outputContext) return

        outputCanvas.width = Math.max(1, Math.round(paddedWidth * outputScale))
        outputCanvas.height = Math.max(1, Math.round(paddedHeight * outputScale))
        outputContext.drawImage(
          sourceImage,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          horizontalPadding * outputScale,
          topPadding * outputScale,
          sourceWidth * outputScale,
          sourceHeight * outputScale,
        )

        const trimmedSource = outputCanvas.toDataURL('image/png')
        trimmedUploadCache.set(cacheKey, trimmedSource)
        if (!cancelled) setDisplaySource(trimmedSource)
      } catch {
        trimmedUploadCache.set(cacheKey, src)
      }
    }

    sourceImage.onerror = () => trimmedUploadCache.set(cacheKey, src)
    sourceImage.crossOrigin = 'anonymous'
    sourceImage.src = resolvedSrc

    return () => {
      cancelled = true
    }
  }, [cacheKey, preparedSource, src])

  if (preparedSource) {
    return (
      <span
        className="prepared-vendor-product"
        role="img"
        aria-label={alt}
        style={{ backgroundImage: `url(${preparedSource})` }}
      />
    )
  }

  return (
    <span className="vendor-product-image-frame">
      <img
        className="vendor-product-image"
        src={displaySource}
        alt={alt}
        loading="lazy"
        style={{ width: 'auto', objectFit: 'contain' }}
      />
    </span>
  )
}

export default function ProductCard({
  product,
  index = 0,
  onAdd,
  onWish,
  onCompare,
  isCompared = false,
  onQuickView,
}) {
  const productId = product.id || product._id
  const productPath = `/product/${product.slug || productId}`
  const { isWishlisted } = useWishlist()
  const wishlisted = isWishlisted(product)
  const productName = product.name || product.fullName || 'Cellar selection'
  const category = product.category || product.type || 'Wine & spirits'
  const origin = product.origin || product.region || product.country || product.storeName || 'South Africa'
  const badge = product.badge || fallbackBadges[index % fallbackBadges.length]

  return (
    <article className="product-card">
      <div className="product-visual">
        <span className="product-badge">{badge}</span>

        <div className="quick-actions">
          {onCompare && (
            <IconButton
              className={isCompared ? 'compare-action-active' : ''}
              label={isCompared ? `View ${productName} in comparison` : `Compare ${productName}`}
              onClick={() => onCompare(product)}
            >
              <GitCompareArrows size={17} />
            </IconButton>
          )}

          {onWish && (
            <IconButton
              className={wishlisted ? 'wishlist-action-active' : ''}
              label={wishlisted ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`}
              onClick={() => onWish(product)}
            >
              <Heart size={17} fill={wishlisted ? 'currentColor' : 'none'} />
            </IconButton>
          )}

          {onQuickView ? (
            <IconButton label={`Quick view ${productName}`} onClick={() => onQuickView(product)}>
              <Search size={17} />
            </IconButton>
          ) : (
            <Link className="icon-button" to={productPath} aria-label={`View ${productName}`}>
              <Search size={17} />
            </Link>
          )}
        </div>

        <Link className="product-image-link" to={productPath} aria-label={`View ${productName}`}>
          <VendorProductImage src={product.image} alt={productName} />
        </Link>
        <div className="product-glow" />
      </div>

      <div className="product-info">
        <p className="product-category">{product.brand || category}</p>
        <h3><Link to={productPath}>{productName}</Link></h3>
        <p className="product-origin">{origin}</p>
        
        {product.storeName && product.storeId && (
          <Link to={`/store/${product.storeId}`} onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--gold-bright)', marginTop: '4px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            <Store size={12} />
            {product.storeName}
          </Link>
        )}

        <div className="product-buy-row">
          <strong><Price amount={product.price} /></strong>
          {onAdd && (
            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(product); }} aria-label={`Add ${productName} to bag`}>
              Add to bag <ShoppingBag size={16} />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
