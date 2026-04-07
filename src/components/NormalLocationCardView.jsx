import React from 'react';
import { THEME } from '../constants/theme';
import { RenderStars } from './icons';
import FavoriteIconButton from './FavoriteIconButton';
import ShareIconButton from './ShareIconButton';

export default function NormalLocationCardView({
  wrapperStyle,
  touchActionValue,
  safeCardOpen,
  onTouchStartGuard,
  onTouchMoveGuard,
  setIsHovered,
  cardInner,
  imageWrapStyle,
  loc,
  imageStyle,
  imageOverlay,
  bottomFade,
  mediaActionsRow,
  mediaActionBtn,
  favActive,
  handleToggleFav,
  t,
  handleShare,
  infoPanel,
  titleStyle,
  locationCategoryLabel,
  locationCategoryLabels,
  locationVibeLabel,
  locationVibeLabels,
  subLine,
  thinDivider,
  displayRating,
  starsRow,
}) {
  return (
    <div
      style={{ ...wrapperStyle, touchAction: touchActionValue }}
      onClick={safeCardOpen}
      onTouchStart={onTouchStartGuard}
      onTouchMove={onTouchMoveGuard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={cardInner}>
        <div style={imageWrapStyle}>
          <img
            src={loc.mainImage}
            alt={loc.name}
            style={imageStyle}
            loading="lazy"
          />
          <div style={imageOverlay} />
          <div style={bottomFade} />

          <div style={mediaActionsRow}>
            <FavoriteIconButton
              active={favActive}
              buttonStyle={mediaActionBtn(favActive)}
              onClick={(e) => handleToggleFav(e)}
              title={favActive ? t.saved || 'Opgeslagen' : t.save || 'Opslaan'}
              ariaLabel={favActive ? 'Opgeslagen' : 'Opslaan'}
            />

            <ShareIconButton
              buttonStyle={mediaActionBtn(false)}
              onClick={handleShare}
              title={t.share || 'Deel'}
              ariaLabel={t.share || 'Deel'}
            />
          </div>
        </div>

        <div style={infoPanel}>
          <h3 style={titleStyle}>{loc.name}</h3>

          {Array.isArray(locationCategoryLabels) &&
          locationCategoryLabels.length ? (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 6,
                marginTop: 2,
                marginBottom: 2,
              }}
            >
              {(locationCategoryLabels || []).slice(0, 2).map((label) => (
                <span
                  key={`cat-${label}`}
                  style={{
                    ...subLine,
                    margin: 0,
                    whiteSpace: 'normal',
                    overflow: 'visible',
                    textOverflow: 'unset',
                    padding: '4px 8px',
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: 'rgba(255,255,255,0.04)',
                    lineHeight: 1.1,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          ) : locationCategoryLabel ? (
            <p style={subLine}>{locationCategoryLabel}</p>
          ) : null}

          <p style={subLine}>{loc.district || 'Amsterdam'}</p>

          <div style={thinDivider} />

          {displayRating != null ? (
            <div style={starsRow}>
              <RenderStars value={displayRating} size={13} gap={4} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
