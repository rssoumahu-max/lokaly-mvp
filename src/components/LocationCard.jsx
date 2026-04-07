import React, { useState } from 'react';
import { THEME } from '../constants/theme';
import { STRINGS } from '../constants/strings';
import { CATEGORIES } from '../constants/categories';
import { VIBES } from '../constants/vibes';
import { useIsMobile } from '../hooks/useIsMobile';
import { computeDisplayRating, getPriceLabel } from '../lib/locationHelpers';
import { shareLocation } from '../lib/shareLocation';
import Top10LocationCard from './Top10LocationCard';
import NormalLocationCardView from './NormalLocationCardView';

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

    const vibe = VIBES.find(v =>
      v.name === nameValue || v.name_nl === nameValue || v.name_en === nameValue || v.slug === nameValue
    );
    if (vibe) {
      return language === 'nl' ? vibe.name_nl : vibe.name_en;
    }

    return nameValue;
  }
  return '';
}

/* ===================== LOCATION CARD ===================== */

export default function LocationCard({
  loc,
  index,
  onClick,
  isTop10Card,
  language,
  forceFullWidthOnMobile,
  isFavorite,
  onToggleFavorite,
}) {
  const isMobile = useIsMobile();
  const priceLabel = getPriceLabel(loc);

  const formatEuro = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return '';
    const isInt = Math.abs(n - Math.round(n)) < 1e-9;
    return `€${isInt ? Math.round(n) : n.toFixed(2).replace(/\.00$/, '')}`;
  };

  // ✅ Belangrijk: in horizontale carousels op mobiel moet swipen kunnen (pan-x).
  // forceFullWidthOnMobile = true  → meestal verticale lijst → pan-y is OK
  const touchActionValue =
    isMobile && (isTop10Card || !forceFullWidthOnMobile) ? 'pan-x' : 'pan-y';

  // ✅ iPhone scroll-klik fix: alleen “echte taps” openen de kaart
  const touchRef = React.useRef({ x: 0, y: 0, moved: false });

  const onTouchStartGuard = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    touchRef.current = { x: t.clientX, y: t.clientY, moved: false };
  };

  const onTouchMoveGuard = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    const dx = Math.abs(t.clientX - touchRef.current.x);
    const dy = Math.abs(t.clientY - touchRef.current.y);
    if (dx > 8 || dy > 8) touchRef.current.moved = true;
  };

  const safeCardOpen = () => {
    if (touchRef.current.moved) return;
    if (typeof onClick === 'function') onClick(loc);
  };

  // Favorites (fallback-safe)
  const [localFav, setLocalFav] = useState(false);
  const favActive = typeof isFavorite === 'boolean' ? isFavorite : localFav;

  function handleToggleFav(e) {
    e.stopPropagation();
    if (typeof onToggleFavorite === 'function') {
      onToggleFavorite(loc.id);
    } else {
      setLocalFav((v) => !v);
    }
  }

  const [isHovered, setIsHovered] = useState(false);
  const showRank = typeof index === 'number';

  // ✅ Categorie label i.p.v. vibe label op kaart
  const locationCategoryLabels =
    Array.isArray(loc.categoryNames) && loc.categoryNames.length
      ? loc.categoryNames.filter(Boolean).map(name => getLocalizedName(name, language))
      : Array.isArray(loc.category_names) && loc.category_names.length
      ? loc.category_names.filter(Boolean).map(name => getLocalizedName(name, language))
      : [
          typeof loc.categoryName === 'string' && loc.categoryName.trim() !== ''
            ? loc.categoryName
            : typeof loc.category_name === 'string' &&
              loc.category_name.trim() !== ''
            ? loc.category_name
            : typeof loc.category === 'string' && loc.category.trim() !== ''
            ? loc.category
            : typeof loc.type === 'string' && loc.type.trim() !== ''
            ? loc.type.replace(/[-_]/g, ' ')
            : '',
        ].filter(Boolean).map(name => getLocalizedName(name, language));

  const locationVibeLabels =
    Array.isArray(loc.vibeNames) && loc.vibeNames.length
      ? loc.vibeNames.filter(Boolean).map(name => getLocalizedName(name, language))
      : Array.isArray(loc.vibe_names) && loc.vibe_names.length
      ? loc.vibe_names.filter(Boolean).map(name => getLocalizedName(name, language))
      : [
          typeof loc.vibeName === 'string' && loc.vibeName.trim() !== ''
            ? loc.vibeName
            : typeof loc.vibe_name === 'string' && loc.vibe_name.trim() !== ''
            ? loc.vibe_name
            : typeof loc.vibe === 'string' && loc.vibe.trim() !== ''
            ? loc.vibe
            : '',
        ].filter(Boolean).map(name => getLocalizedName(name, language));

  const locationCategoryLabel = locationCategoryLabels[0] || '';
  const locationVibeLabel = locationVibeLabels[0] || '';

  const t = STRINGS[language];

  const baseSmallPill = {
    borderRadius: 999,
    padding: '6px 10px',
    border: `1px solid ${THEME.border}`,
    background: 'rgba(255,255,255,0.92)',
    color: THEME.text,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 14px 32px rgba(15,23,42,0.10)',
    backdropFilter: 'blur(10px)',
  };

  const ctaPill = (active = false) => ({
    ...baseSmallPill,
    border: `1px solid ${active ? THEME.orangeBorder : THEME.border}`,
    background: active ? THEME.orangeSoft : 'rgba(255,255,255,0.92)',
  });

  const metaRowStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    fontSize: 12,
    color: THEME.muted,
    marginBottom: 6,
    alignItems: 'center',
  };

  const metaItemStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  };
  // ✅ Opslaan + Delen in de image (normale kaarten)
  const imageActionsRow = {
    position: 'absolute',
    right: 10,
    top: 10, // ✅ was: bottom: 10
    display: 'flex',
    gap: 8,
    zIndex: 5,
  };

  const imageIconBtn = (active = false) => ({
    width: isMobile ? 34 : 36,
    height: isMobile ? 34 : 36,
    borderRadius: 999,
    border: `1px solid ${
      active ? 'rgba(255,90,31,0.55)' : 'rgba(255,255,255,0.18)'
    }`,
    background: active ? 'rgba(255,90,31,0.22)' : 'rgba(17,17,19,0.55)',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 16px 28px rgba(0,0,0,0.28)',
  });

  // ===================== TOP 10 CARD =====================
  if (isTop10Card) {
    const imageUrl = loc?.mainImage || loc?.image_url || loc?.image || '';
    const fallbackImage =
      'https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=1400&q=80';

    const titleText = loc?.name || '';
    const top10Rank = typeof index === 'number' ? String(index + 1) : '';

    return (
      <Top10LocationCard
        imageUrl={imageUrl}
        fallbackImage={fallbackImage}
        titleText={titleText}
        top10Rank={top10Rank}
        isMobile={isMobile}
        isHovered={isHovered}
        touchActionValue={touchActionValue}
        safeCardOpen={safeCardOpen}
        onTouchStartGuard={onTouchStartGuard}
        onTouchMoveGuard={onTouchMoveGuard}
        setIsHovered={setIsHovered}
      />
    );
  }

  // ===================== NORMALE KAARTEN =====================
  const cardWidth = isMobile ? (forceFullWidthOnMobile ? '100%' : 235) : 245;

  // Reference is “taller” (image + info eronder)
  const imgHeight = isMobile ? 225 : 265;

  // Reference heeft duidelijke rounding
  const radius = 18; // alleen linksboven
  const onlyTopLeftRadius = `${radius}px 0px 0px 0px`;

  const wrapperStyle = {
    width: cardWidth,
    maxWidth: '100%',
    position: 'relative',
    flexShrink: 0,
    cursor: 'pointer',
    borderRadius: radius,
    overflow: 'visible',
    background: 'transparent',
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    transition: 'transform 180ms ease',
  };

  const cardInner = {
    // ✅ container is nu “onzichtbaar” → geen panel-look meer
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    borderRadius: 0,
    overflow: 'visible',
  };

  const imageWrapStyle = {
    height: imgHeight,
    width: '100%',
    position: 'relative',

    // ✅ alleen linksboven rond
    borderRadius: onlyTopLeftRadius,
    overflow: 'hidden',

    // ✅ zelfde donkere basis als je achtergrond
    background: '#000',

    // ✅ hier komt nu je “card feel” (shadow + border) i.p.v. in infoPanel
    border: `1px solid ${
      isHovered ? 'rgba(255,90,31,0.22)' : 'rgba(255,255,255,0.10)'
    }`,
    borderBottom: '0px solid transparent',

    boxShadow: isHovered
      ? '0 26px 70px rgba(0,0,0,0.55)'
      : '0 18px 52px rgba(0,0,0,0.40)',
    transition: 'box-shadow 220ms ease, border-color 220ms ease',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transform: isHovered ? 'scale(1.04)' : 'scale(1)',
    transition: 'transform 240ms ease',
    filter: 'contrast(1.03) saturate(1.05)',
  };

  const imageOverlay = {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.20) 55%, rgba(0,0,0,0.55) 100%)',
    pointerEvents: 'none',
  };

  const bottomFade = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,

    // was 140 → maak iets groter zodat fade verder de image in loopt
    height: 55,

    zIndex: 5,
    pointerEvents: 'none',
    background:
      'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.38) 55%, rgba(0,0,0,0) 100%)',
  };

  const imgH =
    typeof imgHeight === 'number' ? imgHeight : parseInt(imgHeight, 10) || 260;

  // ✅ Top10 overlay UIT (geen donkere gloed)
  const top10Shade = { display: 'none' };

  // Icons op de image (subtiel, zoals reference)
  const mediaActionsRow = {
    position: 'absolute',
    left: '50%',
    bottom: 12,
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 10,

    // ✅ hoger dan seamFade
    zIndex: 13,
    pointerEvents: 'auto',
  };

  const mediaActionBtn = (active = false) => ({
    width: 36,
    height: 36,
    borderRadius: 999,
    border: `1px solid ${
      active ? 'rgba(255,90,31,0.55)' : 'rgba(255,255,255,0.16)'
    }`,
    background: 'rgba(17,17,19,0.55)',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 18px 34px rgba(0,0,0,0.35)',
  });

  const infoPanel = {
    padding: isMobile ? '26px 6px 10px' : '28px 6px 12px',
    background: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    textAlign: 'center',

    // ✅ BELANGRIJK
    position: 'relative',
    zIndex: 12,
  };

  const titleStyle = {
    fontFamily: THEME.fontDisplay, // zelfde “feel” als sectietitels
    fontSize: isMobile ? 18 : 20,
    fontWeight: 500, // ✅ minder dik (minimalistisch)
    color: 'rgba(235,240,255,0.88)', // zelfde tint als je secties
    letterSpacing: -0.2,
    lineHeight: 1.15,
    margin: 0,
    maxWidth: '100%',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const subLine = {
    fontFamily: THEME.font, // mag Inter blijven voor readability
    fontSize: 11,
    fontWeight: 450, // ✅ ook iets dunner
    color: '#fff',
    lineHeight: 1.25,
    margin: 0,
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const thinDivider = {
    height: 2,
    width: '44%',
    marginTop: 10,
    borderRadius: 999,
    background: 'rgba(255,255,255,0.18)',
    opacity: 0.7,
  };

  // ✅ rating berekenen (gebruikt jouw bestaande computeDisplayRating)
  const displayRating = computeDisplayRating(loc);

  // ✅ sterren rij onder de streep
  const starsRow = {
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    opacity: 0.95,
  };

  const handleShare = (e) => {
    e.stopPropagation();
    shareLocation(loc, language);
  };

  return (
    <NormalLocationCardView
      wrapperStyle={wrapperStyle}
      touchActionValue={touchActionValue}
      safeCardOpen={safeCardOpen}
      onTouchStartGuard={onTouchStartGuard}
      onTouchMoveGuard={onTouchMoveGuard}
      setIsHovered={setIsHovered}
      cardInner={cardInner}
      imageWrapStyle={imageWrapStyle}
      loc={loc}
      imageStyle={imageStyle}
      imageOverlay={imageOverlay}
      bottomFade={bottomFade}
      mediaActionsRow={mediaActionsRow}
      mediaActionBtn={mediaActionBtn}
      favActive={favActive}
      handleToggleFav={handleToggleFav}
      t={t}
      handleShare={handleShare}
      infoPanel={infoPanel}
      titleStyle={titleStyle}
      locationCategoryLabel={locationCategoryLabel}
      locationCategoryLabels={locationCategoryLabels}
      locationVibeLabel={locationVibeLabel}
      locationVibeLabels={locationVibeLabels}
      subLine={subLine}
      thinDivider={thinDivider}
      displayRating={displayRating}
      starsRow={starsRow}
      isHovered={isHovered}
    />
  );
}
