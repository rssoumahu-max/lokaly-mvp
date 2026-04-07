import React from 'react';
import { THEME } from '../constants/theme';

export default function Top10LocationCard({
  imageUrl,
  fallbackImage,
  titleText,
  top10Rank,
  isMobile,
  isHovered,
  touchActionValue,
  safeCardOpen,
  onTouchStartGuard,
  onTouchMoveGuard,
  setIsHovered,
}) {
  const cardWidth = isMobile ? 245 : 320;
  const cardHeight = isMobile ? 170 : 190;

  const wrapper = {
    width: cardWidth,
    minWidth: cardWidth,
    height: cardHeight,
    position: 'relative',
    cursor: 'pointer',
    borderRadius: isMobile ? '16px 0 0 0' : '20px 0 0 0',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.06)',
    background: 'transparent',
    boxShadow: isHovered ? '0 18px 44px rgba(0,0,0,0.35)' : 'none',
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    transition: 'transform 180ms ease, box-shadow 220ms ease',
    touchAction: touchActionValue,
  };

  const top10Shell = {
    position: 'relative',
    height: '100%',
    width: '100%',
    background: '#0b0b0b',
    borderRadius: 'inherit',
    overflow: 'hidden',
  };

  const top10Img = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: isHovered ? 'scale(1.04)' : 'scale(1.01)',
    transition: 'transform 240ms ease',
    filter: 'contrast(1.05) saturate(1.05)',
  };

  const leftAccent = {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    zIndex: 3,
    background:
      'linear-gradient(180deg, rgba(255,90,31,0.95) 0%, rgba(255,90,31,0.25) 70%, rgba(255,90,31,0.05) 100%)',
  };

  const top10Content = {
    position: 'relative',
    zIndex: 4,
    height: '100%',
    display: 'grid',
    gridTemplateColumns: isMobile ? '92px 1fr' : '120px 1fr',
    alignItems: 'end',
    padding: isMobile ? '12px 12px' : '16px 16px',
    gap: isMobile ? 10 : 12,
  };

  const top10RankNum = {
    fontFamily: THEME.fontDisplay,
    fontWeight: 950,
    fontSize: isMobile ? 44 : 68,
    lineHeight: 0.9,
    letterSpacing: -1.3,
    color: 'rgba(255,255,255,0.96)',
    WebkitTextStroke: '0px transparent',
    textShadow: '0 16px 40px rgba(0,0,0,0.55)',
    userSelect: 'none',
  };

  const top10Title = {
    margin: 0,
    fontFamily: THEME.font,
    fontSize: isMobile ? 16 : 22,
    fontWeight: 500,
    letterSpacing: -0.1,
    lineHeight: 1.12,
    color: 'rgba(235,240,255,0.94)',
    textShadow: '0 10px 22px rgba(0,0,0,0.35)',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  };

  return (
    <div
      style={wrapper}
      onClick={safeCardOpen}
      onTouchStart={onTouchStartGuard}
      onTouchMove={onTouchMoveGuard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={top10Shell}>
        <img
          src={imageUrl || fallbackImage}
          alt={titleText || ''}
          style={top10Img}
          loading="lazy"
        />

        <div style={leftAccent} />

        <div style={top10Content}>
          <div style={{ paddingBottom: 4 }}>
            <div style={top10RankNum}>{top10Rank}</div>
          </div>

          <div style={{ minWidth: 0, paddingBottom: 6 }}>
            <h3 style={top10Title}>{titleText}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}