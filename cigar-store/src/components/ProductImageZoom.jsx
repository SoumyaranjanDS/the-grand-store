import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Minus, Plus, RotateCcw, X } from 'lucide-react';
import './ProductImageZoom.css';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function ProductImageZoom({ src, alt }) {
  const previewRef = useRef(null);
  const modalImageRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1.35);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === '+') setZoom((value) => clamp(value + 0.35, 1, 3.8));
      if (event.key === '-') setZoom((value) => clamp(value - 0.35, 1, 3.8));
    };

    document.body.classList.add('product-zoom-open');
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('product-zoom-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const moveOrigin = (event, targetRef) => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 0, 100);
    const y = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 0, 100);
    targetRef.current?.style.setProperty('--zoom-origin', `${x}% ${y}%`);
  };

  const changeZoom = (amount) => setZoom((value) => clamp(Number((value + amount).toFixed(2)), 1, 3.8));

  const modal = open && createPortal(
    <div className="product-lightbox" role="dialog" aria-modal="true" aria-label={`${alt} image viewer`}>
      <button className="product-lightbox__backdrop" type="button" aria-label="Close image viewer" onClick={() => setOpen(false)} />
      <div className="product-lightbox__panel">
        <header>
          <div><span>Product inspection</span><strong>{alt}</strong></div>
          <button type="button" aria-label="Close image viewer" onClick={() => setOpen(false)}><X size={23} /></button>
        </header>

        <div
          className="product-lightbox__canvas"
          onPointerMove={(event) => moveOrigin(event, modalImageRef)}
          onWheel={(event) => {
            event.preventDefault();
            changeZoom(event.deltaY < 0 ? 0.2 : -0.2);
          }}
        >
          <img ref={modalImageRef} src={src} alt={alt} style={{ '--modal-zoom': zoom }} />
        </div>

        <footer>
          <span>Move over the image to inspect details</span>
          <div className="product-lightbox__controls">
            <button type="button" aria-label="Zoom out" onClick={() => changeZoom(-0.35)} disabled={zoom <= 1}><Minus size={18} /></button>
            <output aria-label="Current zoom">{Math.round(zoom * 100)}%</output>
            <button type="button" aria-label="Zoom in" onClick={() => changeZoom(0.35)} disabled={zoom >= 3.8}><Plus size={18} /></button>
            <button type="button" aria-label="Reset zoom" onClick={() => setZoom(1.35)}><RotateCcw size={17} /></button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );

  return (
    <>
      <button
        ref={previewRef}
        className={`product-image-zoom ${hovering ? 'is-hovering' : ''}`}
        type="button"
        aria-label={`Zoom ${alt}`}
        onPointerEnter={(event) => event.pointerType === 'mouse' && setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        onPointerMove={(event) => moveOrigin(event, previewRef)}
        onClick={() => {
          setZoom(1.35);
          setOpen(true);
        }}
      >
        <img src={src} alt={alt} />
        <span className="product-image-zoom__hint"><Maximize2 size={17} /> <b>Hover to zoom</b><i>Click to expand</i></span>
      </button>
      {modal}
    </>
  );
}

export default ProductImageZoom;
