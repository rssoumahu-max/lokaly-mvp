import React from 'react';
import { THEME } from '../constants/theme';
import { STRINGS } from '../constants/strings';
import { CATEGORIES } from '../constants/categories';
import { useIsMobile } from '../hooks/useIsMobile';
import { RenderStars, IconPin } from './icons';
import { supabaseImgUrl } from '../lib/locationHelpers';

// Helper functie om de juiste naam te kiezen op basis van taal
function getLocalizedName(nameValue, language) {
  if (!nameValue) return '';
  if (typeof nameValue === 'string') {
    const category = CATEGORIES.find(c =>
      c.name === nameValue || c.name_nl === nameValue || c.name_en === nameValue || c.slug === nameValue
    );
    if (category) {
      return language === 'nl' ? category.name_nl : category.name_en;
    }
    return nameValue;
  }
  return '';
}

export default function CategoryResultRowCard({ loc, onClick, language }) {
  const isMobile = useIsMobile();

  const touchRef = React.useRef({ x: 0, y: 0, moved: false });

  const onTouchStartGuard = (e) => {
    const touch = e.touches?.[0];
    if (!touch) return;
    touchRef.current = { x: touch.clientX, y: touch.clientY, moved: false };
  };

  const onTouchMoveGuard = (e) => {
    const touch = e.touches?.[0];
    if (!touch) return;
    const dx = Math.abs(touch.clientX - touchRef.current.x);
    const dy = Math.abs(touch.clientY - touchRef.current.y);
    if (dx > 6 || dy > 6) {
      touchRef.current.moved = true;
    }
  };

  const safeClick = () => {
    if (touchRef.current.moved) return;
    if (typeof onClick === 'function') onClick(loc);
  };

  const title = loc?.name || '';
  const desc =
    loc?.shortDescription ||
    loc?.short_description ||
    loc?.subtitle ||
    loc?.tagline ||
    loc?.description ||
    '';

  const img = supabaseImgUrl(loc?.mainImage || loc?.imageUrl || loc?.cover_url || '', 160);

  const district =
    loc?.districtName ||
    loc?.district_name ||
    loc?.district ||
    loc?.neighborhood ||
    '';

  const categoryLabelRaw =
    loc?.categoryName ||
    loc?.category_name ||
    loc?.category ||
    (loc?.type ? String(loc.type).replace(/[-_]/g, ' ') : '');

  const categoryLabel = getLocalizedName(categoryLabelRaw, language);

  const rating = Number.isFinite(Number(loc?.rating))
    ? Number(loc.rating)
    : null;

  // Alleen bedoeld voor mobile layout (maar component mag bestaan op alle screens)
  const cardBtn = {
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'left',
    border: '1px solid rgba(255,255,255,0.10)', // ✅ ENIGE frame
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    outline: 'none',
    boxShadow: '0 16px 40px rgba(0,0,0,0.32)',
    overflow: 'hidden', // ✅ niets steekt uit
  };

  const row = {
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: isMobile ? 'stretch' : 'center',
    gap: isMobile ? 14 : 12,
    padding: isMobile ? '14px 14px' : '12px 14px',
  };

  const thumb = {
    width: isMobile ? 104 : 64,
    height: isMobile ? 112 : 64,
    flex: isMobile ? '0 0 104px' : '0 0 64px',
    alignSelf: isMobile ? 'stretch' : 'auto',
    borderRadius: 14,
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
  };

  const thumbImg = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  };

  const content = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: isMobile ? 6 : 4,
    overflow: 'hidden',
    alignSelf: 'stretch',
  };

  const titleStyle = {
    margin: 0,
    fontFamily: THEME.font,
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    color: 'rgba(235,240,255,0.90)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const subStyle = {
    margin: 0,
    fontFamily: THEME.font,
    fontSize: 12,
    fontWeight: 450,
    lineHeight: 1.25,
    color: 'rgba(235,240,255,0.62)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const metaRow = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
    overflow: 'hidden',
  };

  const metaPill = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: '12px 0 12px 0',
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.04)',
    color: 'rgba(235,240,255,0.72)',
    fontFamily: THEME.font,
    fontSize: 11.5,
    fontWeight: 450,
    whiteSpace: 'nowrap',
  };

  const ratingPill = {
    ...metaPill,
    border: '1px solid rgba(255,107,61,0.35)',
    color: 'rgba(255,107,61,0.95)',
  };

  const rightSlot = {
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  };

  const ratingChip = (hasRating) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56, // ✅ alle ratings exact gelijke positie/maat
    height: 30,
    padding: '0 10px',
    borderRadius: '12px 0 12px 0',
    border: hasRating
      ? '1px solid rgba(255,107,61,0.55)'
      : '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.04)',
    color: hasRating ? 'rgba(255,107,61,0.98)' : 'rgba(235,240,255,0.45)',
    fontFamily: THEME.font,
    fontSize: 12.5,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  });

  return (
    <button
      type="button"
      style={cardBtn}
      onClick={safeClick}
      onTouchStart={onTouchStartGuard}
      onTouchMove={onTouchMoveGuard}
    >
      <div style={row}>
        <div style={thumb}>
          {img ? (
            <img src={img} alt={title} style={thumbImg} loading="lazy" />
          ) : null}
        </div>

        <div style={content}>
          <p style={titleStyle}>{title}</p>

          <p style={subStyle}>
            {desc || (language === 'nl' ? 'Bekijk details' : 'View details')}
          </p>

          <div style={metaRow}>
            {district ? <span style={metaPill}>{district}</span> : null}
            {categoryLabel ? (
              <span style={metaPill}>{categoryLabel}</span>
            ) : null}
          </div>
        </div>

        <div style={rightSlot}>
          <span style={ratingChip(rating !== null)}>
            {rating !== null ? rating.toFixed(1) : '—'}
          </span>
        </div>
      </div>
    </button>
  );
}