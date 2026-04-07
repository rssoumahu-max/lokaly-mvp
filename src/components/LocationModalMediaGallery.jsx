import React from 'react';

export default function LocationModalMediaGallery({
  language,
  location,
  mediaItems,
  mediaLoading,
  mediaError,
  activeIndex,
  setActiveIndex,
  lightboxOpen,
  openLightbox,
  closeLightbox,
  goPrev,
  goNext,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  handlePointerCancel,
  handleSwipeStart,
  handleSwipeMove,
  handleSwipeEnd,
  handleWheelSwipe,
  pointerMovedRef,

  mediaFrameStyle,
  mediaRailStyle,
  thumbButtonStyle,
  thumbImageStyle,
  mediaNavBtnStyle,
  mainImageStyle,
  heroFadeStyle,
  dotsRowStyle,
  dotStyle,
  zoomHintStyle,

  lightboxOverlayStyle,
  lightboxInnerStyle,
  lightboxCloseStyle,
  lightboxNavStyle,
  lightboxMediaStyle,
}) {
  return (
    <>
      <div style={mediaFrameStyle}>
        {!mediaLoading && mediaItems.length > 1 && (
          <>
            <button
              type="button"
              style={mediaNavBtnStyle('left')}
              onClick={goPrev}
              aria-label={language === 'nl' ? 'Vorige media' : 'Previous media'}
              title={language === 'nl' ? 'Vorige' : 'Previous'}
            >
              ‹
            </button>

            <button
              type="button"
              style={mediaNavBtnStyle('right')}
              onClick={goNext}
              aria-label={language === 'nl' ? 'Volgende media' : 'Next media'}
              title={language === 'nl' ? 'Volgende' : 'Next'}
            >
              ›
            </button>
          </>
        )}

        {mediaLoading && (
          <div
            style={{
              ...mainImageStyle,
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.55)',
              fontSize: 14,
              letterSpacing: 0.2,
            }}
          >
            {language === 'nl' ? 'Media laden…' : 'Loading media…'}
          </div>
        )}

        {!mediaLoading && !!mediaError && mediaItems.length === 0 && (
          <div
            style={{
              ...mainImageStyle,
              background: 'rgba(255,255,255,0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: 20,
              color: 'rgba(255,170,170,0.92)',
              fontSize: 13.5,
              lineHeight: 1.45,
            }}
          >
            {language === 'nl'
              ? `Media konden niet worden geladen. ${mediaError || ''}`
              : `Could not load media. ${mediaError || ''}`}
          </div>
        )}

        {/* Gallery item */}
        {!mediaLoading && mediaItems.length > 0 && (
          <>
            {mediaItems[activeIndex]?.media_type === 'image' ? (
              <div
                style={{
                  position: 'relative',
                  touchAction: 'pan-y',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  cursor: 'grab',
                }}
                onPointerDown={(e) => {
                  if (mediaItems?.length > 1 && e.pointerType === 'mouse') {
                    e.preventDefault();
                  }
                  handlePointerDown(e);
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onTouchStart={handleSwipeStart}
                onTouchMove={handleSwipeMove}
                onTouchEnd={handleSwipeEnd}
                onWheel={handleWheelSwipe}
              >
                <img
                  src={mediaItems[activeIndex].url}
                  alt={mediaItems[activeIndex].caption || location?.name || ''}
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  style={{
                    ...mainImageStyle,
                    cursor: 'zoom-in',
                    WebkitUserDrag: 'none',
                  }}
                  onClick={() => openLightbox()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') openLightbox();
                  }}
                />
                <div style={heroFadeStyle} />

                {mediaItems.length > 1 && (
                  <div style={dotsRowStyle} aria-hidden="true">
                    {mediaItems.map((item, i) => (
                      <span
                        key={item.id || i}
                        style={dotStyle(i === activeIndex)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  position: 'relative',
                  touchAction: 'pan-y',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  cursor: 'grab',
                }}
                onPointerDown={(e) => {
                  if (e.pointerType === 'mouse') e.preventDefault();
                  handlePointerDown(e);
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onTouchStart={handleSwipeStart}
                onTouchMove={handleSwipeMove}
                onTouchEnd={handleSwipeEnd}
                onWheel={handleWheelSwipe}
                onClick={() => {
                  if (pointerMovedRef.current) return;
                  openLightbox();
                }}
              >
                <video
                  src={mediaItems[activeIndex].url}
                  controls
                  style={mainImageStyle}
                  onClick={(e) => e.stopPropagation()}
                />
                <div style={zoomHintStyle}>
                  {language === 'nl'
                    ? 'Klik om te vergroten'
                    : 'Click to enlarge'}
                </div>
                <div style={heroFadeStyle} />
              </div>
            )}

            {/* Lightbox */}
            {lightboxOpen && mediaItems?.length > 0 && (
              <div
                style={lightboxOverlayStyle}
                onClick={(e) => {
                  if (e.target === e.currentTarget) closeLightbox();
                }}
              >
                <div
                  style={{
                    ...lightboxInnerStyle,
                    touchAction: 'pan-y',
                    userSelect: 'none',
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerCancel}
                  onWheel={handleWheelSwipe}
                >
                  <button
                    type="button"
                    style={lightboxCloseStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeLightbox();
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label={language === 'nl' ? 'Sluiten' : 'Close'}
                    title={language === 'nl' ? 'Sluiten' : 'Close'}
                  >
                    ×
                  </button>

                  {mediaItems.length > 1 && (
                    <>
                      <button
                        type="button"
                        style={lightboxNavStyle('left')}
                        onClick={(e) => {
                          e.stopPropagation();
                          goPrev();
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        aria-label={language === 'nl' ? 'Vorige' : 'Previous'}
                        title={language === 'nl' ? 'Vorige' : 'Previous'}
                      >
                        ‹
                      </button>

                      <button
                        type="button"
                        style={lightboxNavStyle('right')}
                        onClick={(e) => {
                          e.stopPropagation();
                          goNext();
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        aria-label={language === 'nl' ? 'Volgende' : 'Next'}
                        title={language === 'nl' ? 'Volgende' : 'Next'}
                      >
                        ›
                      </button>
                    </>
                  )}

                  {mediaItems[activeIndex]?.media_type === 'video' ? (
                    <video
                      src={mediaItems[activeIndex].url}
                      controls
                      style={lightboxMediaStyle}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <img
                      src={mediaItems[activeIndex].url}
                      alt={
                        mediaItems[activeIndex].caption || location?.name || ''
                      }
                      style={lightboxMediaStyle}
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Fallback als er geen mediaItems zijn */}
        {!mediaLoading && mediaItems.length === 0 && location?.mainImage && (
          <div style={{ position: 'relative' }}>
            <img
              src={location.mainImage}
              alt={location.name}
              style={mainImageStyle}
            />
            <div style={heroFadeStyle} />
          </div>
        )}
      </div>
    </>
  );
}
