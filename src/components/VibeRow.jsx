import React, { useMemo, useRef, useState, useEffect } from 'react';
import { THEME } from '../constants/theme';
import { STRINGS } from '../constants/strings';
import { VIBES } from '../constants/vibes';
import { useIsMobile } from '../hooks/useIsMobile';

export default function VibeRow({ title, onVibeSelect, onSeeAll, vibes, language = 'nl' }) {
  const t = STRINGS[language];
  const isMobile = useIsMobile();

  // ✅ Supabase vibes → combineer met hardcoded VIBES voor fallback
  const vibeItems = useMemo(() => {
    const src = vibes && vibes.length > 0 ? vibes : VIBES;

    return (src || []).map((v) => {
      const name =
        language === 'nl'
          ? v?.name_nl || v?.name || ''
          : v?.name_en || v?.name || '';
      const slug = v?.slug || '';
      const imageUrl = v?.image_url || ''; // ✅ uit Supabase
      const subtitle =
        language === 'nl'
          ? v?.subtitle_nl || v?.subtitle || ''
          : v?.subtitle_en || v?.subtitle || '';

      return { name, slug, imageUrl, subtitle };
    });
  }, [vibes, language]);

  // ---------- Kleuren (jouw bestaande systeem) ----------
  const VIBE_STYLE_MAP = useMemo(
    () => ({
      all: { a: '#EAF2FF', b: '#22D3EE', tag: 'ALL' },
      'date-night': { a: '#FB7185', b: '#DB2777', tag: 'VIBE' },
      'met-de-crew': { a: '#3B82F6', b: '#22D3EE', tag: 'VIBE' },
      'family-time': { a: '#22C55E', b: '#84CC16', tag: 'VIBE' },
      'solo-mission': { a: '#7C3AED', b: '#A855F7', tag: 'VIBE' },
      'rainy-day': { a: '#475569', b: '#94A3B8', tag: 'VIBE' },
      'na-het-werk': { a: '#F97316', b: '#F59E0B', tag: 'VIBE' },
      'weekend-pick': { a: '#EAB308', b: '#F97316', tag: 'VIBE' },
      'late-night': { a: '#4C1D95', b: '#7C3AED', tag: 'VIBE' },
      'easy-going': { a: '#14B8A6', b: '#60A5FA', tag: 'VIBE' },
      'actie-aan': { a: '#F97316', b: '#EF4444', tag: 'VIBE' },
      'culture-fix': { a: '#4F46E5', b: '#A855F7', tag: 'VIBE' },
      'even-opladen': { a: '#2DD4BF', b: '#22C55E', tag: 'VIBE' },
      'iets-anders': { a: '#EC4899', b: '#8B5CF6', tag: 'VIBE' },
      'lekker-spelen': { a: '#F59E0B', b: '#FDE047', tag: 'VIBE' },
      'impressie-maken': { a: '#0EA5E9', b: '#3B82F6', tag: 'VIBE' },
      buitenlucht: { a: '#16A34A', b: '#22C55E', tag: 'VIBE' },
      'binnen-knus': { a: '#A78BFA', b: '#F472B6', tag: 'VIBE' },
      feestmodus: { a: '#D946EF', b: '#8B5CF6', tag: 'VIBE' },
    }),
    []
  );

  const PALETTE = useMemo(
    () => [
      '#3B82F6', // blue
      '#22D3EE', // cyan
      '#14B8A6', // teal
      '#22C55E', // green
      '#F97316', // orange
      '#EF4444', // red
      '#F59E0B', // amber
      '#A855F7', // purple
      '#8B5CF6', // violet
      '#EC4899', // pink
    ],
    []
  );

  const hashString = (str) => {
    let h = 0;
    for (let i = 0; i < (str || '').length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  };

  const isHex = (c) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c || '');

  const hexToRgb = (hex) => {
    let h = hex.replace('#', '');
    if (h.length === 3)
      h = h
        .split('')
        .map((x) => x + x)
        .join('');
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };

  const hexToRgba = (hex, alpha) => {
    if (!isHex(hex)) return `rgba(255,255,255,${alpha})`;
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  // ✅ Canva-achtige “bright card” background (maar nog Lokaly/urban)
  const vibeCardBg = (a, b) => {
    // luxe shading op je twee vibe-kleuren (subtiel, niet too much)
    const shade = (hex, pct) => {
      if (!isHex(hex)) return hex;
      const { r, g, b } = hexToRgb(hex);
      const f = (100 + pct) / 100;
      const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
      const rr = clamp(r * f)
        .toString(16)
        .padStart(2, '0');
      const gg = clamp(g * f)
        .toString(16)
        .padStart(2, '0');
      const bb = clamp(b * f)
        .toString(16)
        .padStart(2, '0');
      return `#${rr}${gg}${bb}`.toUpperCase();
    };

    const aLight = shade(a, +12);
    const bDark = shade(b, -14);

    const aGlow = hexToRgba(a, 0.5);
    const bGlow = hexToRgba(b, 0.42);

    return `
      /* zachte highlight spot (zelfde luxe-touch als categorie cards) */
      radial-gradient(900px circle at 20% 15%,
        rgba(255,255,255,0.26) 0%,
        rgba(255,255,255,0.10) 30%,
        rgba(255,255,255,0) 62%
      ),
  
      /* kleur “gloed” links & rechts (houdt jouw vibe-kleurbeleving) */
      radial-gradient(520px 260px at 12% 22%, ${aGlow} 0%, rgba(0,0,0,0) 62%),
      radial-gradient(520px 260px at 108% 120%, ${bGlow} 0%, rgba(0,0,0,0) 58%),
  
      /* hoofd-gradient (iets luxer / dieper) */
      linear-gradient(135deg, ${aLight} 0%, ${a} 36%, ${b} 74%, ${bDark} 100%),
  
      /* mini vignette voor depth */
      radial-gradient(900px circle at 90% 120%, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0) 55%),
  
      /* donkere basis */
      #0B0B0C
    `.trim();
  };

  const styleForSlug = (slug) => {
    const s = String(slug || '').toLowerCase();
    if (VIBE_STYLE_MAP[s]) return VIBE_STYLE_MAP[s];

    const idx = hashString(s) % PALETTE.length;
    const a = PALETTE[idx].replace(',', '');
    const b = PALETTE[(idx + 5) % PALETTE.length].replace(',', '');
    return { a, b, tag: 'VIBE' };
  };

  // ✅ Vibe → zoekterm voor image (rechts)
  const vibeQueryForSlug = (slug) => {
    const s = String(slug || '').toLowerCase();
    const map = {
      all: 'amsterdam,city,explore',
      'met-vrienden': 'friends,city,hangout',
      adrenaline: 'adventure,action,sports',
      cultureel: 'museum,art,architecture',
      teambuilding: 'team,activity,escape-room',
      chillen: 'coffee,park,relax',
      gamers: 'gaming,arcade,neon',
      romantisch: 'romantic,date,lights',
      'avondje-uit': 'nightlife,bar,city',
      budget: 'streetfood,market,city',
      actief: 'outdoor,fitness,bike',
    };
    return map[s] || 'amsterdam,experience';
  };

  // ✅ Subtitle per vibe (vervangt "Ontdek →")
  const vibeTaglineForSlug = (slugOrName) => {
    const raw = String(slugOrName || '')
      .toLowerCase()
      .trim();
    const key = raw.replace(/\s+/g, '-'); // ook voor namen als "Met vrienden"

    const map = {
      'met-vrienden': 'Samen op pad',
      adrenaline: 'Voor de durfals',
      cultureel: 'Kunst & cultuur',
      teambuilding: 'Samen sterker',
      chillen: 'Relax & recharge',
      gamers: 'Play mode on',
      romantisch: 'Date-night ready',
      'avondje-uit': 'Nacht in de stad',
      budget: 'Leuk voor minder',
      actief: 'In beweging',
    };

    return map[raw] || map[key] || 'Ontdek jouw vibe';
  };

  const imageForVibe = (slug) => {
    const q = vibeQueryForSlug(slug);
    const sig = hashString(slug || q) % 50; // stabieler per vibe
    return `https://source.unsplash.com/featured/640x480/?${encodeURIComponent(
      q
    )}&sig=${sig}`;
  };

  // ---------- Layout / scroll ----------
  const rowRef = useRef(null);
  const [showArrows, setShowArrows] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    if (isMobile) return;

    const el = rowRef.current;
    if (!el) return;

    const update = () => {
      const scrollable = el.scrollWidth > el.clientWidth + 2;
      setShowArrows(scrollable);
      setAtStart(el.scrollLeft <= 1);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [isMobile]);

  const scrollRow = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  const arrowBtnStyle = (rightOffset, disabled) => ({
    position: 'absolute',
    bottom: 10,
    right: rightOffset,
    zIndex: 6,
    width: 38,
    height: 38,
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(17,17,19,0.55)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    color: 'rgba(255,255,255,0.92)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.35 : 1,
    display: 'grid',
    placeItems: 'center',
    fontSize: 22,
    lineHeight: 1,
    boxShadow: '0 18px 44px rgba(0,0,0,0.28)',
  });

  // ---------- Styles ----------
  const sectionStyle = {
    marginTop: 12,
    marginBottom: 8,
  };

  // ✅ zelfde header “gap” als andere secties (SectionRow)
  const sectionHeaderStyle = {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    padding: '0 16px',
    width: '100%',
    maxWidth: 'none',
    margin: '0 0 12px',
  };

  // ✅ EXACT dezelfde sectie-titel look als je andere secties
  const titleStyle = {
    fontFamily: THEME.fontDisplay,
    fontSize: isMobile ? 16 : 18,
    fontWeight: 400,
    color: 'rgba(235,240,255,0.88)',
    letterSpacing: 0.1,
    margin: 0,
    lineHeight: 1.15,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  // ✅ dark vibe-card sizing (zelfde als je huidige)
  const cardW = isMobile ? 255 : 340;
  const cardH = isMobile ? 110 : 124;

  // ✅ “1 hoek rond” net als je normale kaarten
  const cardBase = {
    flex: '0 0 auto',
    width: cardW,
    height: cardH,
    borderRadius: isMobile ? '16px 0 0 0' : '20px 0 0 0',
    overflow: 'hidden',
    border: 'none',
    outline: 'none',
    background: '#0b0b0b',
    padding: 12,
    paddingRight: isMobile ? 70 : 86,
    cursor: 'pointer',
    position: 'relative',
    textAlign: 'left',
    transform: 'translateZ(0)',
    display: 'flex',
    alignItems: 'stretch',
    transition: 'transform 180ms ease, box-shadow 220ms ease',
  };

  // ✅ subtiele “glow” met je vibe-kleuren, maar donker/Spotify-ish
  const vibeDarkBg = (a, b, isAll) => {
    if (isAll) {
      return `
          radial-gradient(900px circle at 18% 22%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 62%),
          #0b0b0b
        `.trim();
    }
    const aGlow = hexToRgba(a, 0.34);
    const bGlow = hexToRgba(b, 0.28);
    return `
        radial-gradient(700px 240px at 14% 18%, ${aGlow} 0%, rgba(0,0,0,0) 60%),
        radial-gradient(700px 240px at 110% 120%, ${bGlow} 0%, rgba(0,0,0,0) 58%),
        linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 42%),
        #0b0b0b
      `.trim();
  };

  const vibeTitle = {
    fontFamily: THEME.fontDisplay, // ✅ zelfde als normale kaarten
    fontWeight: 500, // ✅ minder dik
    fontSize: isMobile ? 15 : 16,
    lineHeight: 1.15,
    letterSpacing: -0.2, // ✅ match met je andere titels
    color: 'rgba(235,240,255,0.88)', // ✅zelfde tint als je sectietitels/kaarten
    margin: 0,

    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',

    wordBreak: 'normal',
    overflowWrap: 'normal',
  };

  const imgWrap = {
    position: 'absolute',
    right: isMobile ? -18 : -26,
    bottom: isMobile ? -43 : -82,
    width: isMobile ? 126 : 178,
    height: isMobile ? 126 : 178,
    borderRadius: 6,
    overflow: 'hidden',
    transform: 'rotate(16deg)',
    boxShadow: '0 22px 46px rgba(0,0,0,0.32)',
    border: 'none',
    background: 'transparent',
    pointerEvents: 'none',
  };

  const seeAllBtn = {
    border: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
    cursor: 'pointer',

    // ✅ feller / leesbaarder
    color: 'rgba(235,240,255,0.92)',

    // ✅ dunner zoals rest van homepage
    fontSize: 12,
    fontWeight: 400,
    letterSpacing: 0.15,

    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    lineHeight: 1,
    opacity: 0.95,
    transition: 'color 160ms ease, opacity 160ms ease',
  };

  const chevron = {
    fontSize: 16,
    lineHeight: 1,
    opacity: 0.75,
    transform: 'translateY(-0.5px)',
  };

  return (
    <section style={sectionStyle}>
      {/* ✅ header full width + zelfde "gap" als je andere sectietitels */}
      <div
        style={{
          ...sectionHeaderStyle,
          width: '100%',
          maxWidth: 'none',
          // BELANGRIJK: geen margin: 0 hier, anders verdwijnt je gap
          padding: isMobile ? '0 14px' : '0 10px',
        }}
      >
        <div>
          <h2 style={titleStyle}>{title}</h2>
        </div>
        <button
          type="button"
          onClick={() => onSeeAll?.()}
          style={seeAllBtn}
          onMouseEnter={(e) => {
            if (isMobile) return;
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            if (isMobile) return;
            e.currentTarget.style.color = 'rgba(235,240,255,0.92)';
            e.currentTarget.style.opacity = '0.95';
          }}
        >
          {t.seeAll}
          <span style={chevron} aria-hidden="true">
            ›
          </span>
        </button>
      </div>

      {/* ✅ wrapper full width (geen 1120 cap meer) */}
      <div style={{ position: 'relative', width: '100%' }}>
        {!isMobile && showArrows && (
          <>
            <button
              type="button"
              aria-label="Scroll links"
              onClick={() => scrollRow(-1)}
              disabled={atStart}
              style={arrowBtnStyle(54, atStart)}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Scroll rechts"
              onClick={() => scrollRow(1)}
              disabled={atEnd}
              style={arrowBtnStyle(12, atEnd)}
            >
              ›
            </button>
          </>
        )}

        {/* ✅ row padding matcht nu ook de andere secties */}
        <div
          ref={rowRef}
          style={{
            display: 'flex',
            gap: 14,
            overflowX: 'auto',
            padding: isMobile ? '6px 14px 10px' : '6px 10px 10px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorX: 'contain',
            touchAction: 'pan-x',
          }}
        >
          {vibeItems
            .filter((v) => {
              const slugLower = String(v.slug || '').toLowerCase();
              const nameLower = String(v.name || '').toLowerCase();

              const isAllVibesCard =
                slugLower === 'all' ||
                nameLower === 'alle vibes' ||
                nameLower === 'all vibes';

              return !isAllVibesCard;
            })
            .slice(0, 10)
            .map((v) => {
              const st = styleForSlug(v.slug || v.name);

              const slugLower = String(v.slug || '').toLowerCase();
              const nameLower = String(v.name || '').toLowerCase();

              // ✅ Dit is de "Alle vibes" kaart
              const isAllVibesCard =
                slugLower === 'all' ||
                nameLower === 'alle vibes' ||
                nameLower === 'all vibes';

              // ✅ Alleen andere kaarten krijgen een image
              const img = !isAllVibesCard
                ? v.imageUrl || imageForVibe(v.slug || v.name)
                : null;

              // ✅ Tekstkleur (Alle vibes = donkerder, rest = wit)
              const titleColor = isAllVibesCard
                ? 'rgba(15,23,42,0.92)'
                : '#FFFFFF';
              const titleText = String(v.name || 'Vibe').trim();
              const isSingleWordTitle = titleText.split(/\s+/).length === 1;

              return (
                <button
                  key={v.slug || v.name}
                  type="button"
                  onClick={() => onVibeSelect?.(v.slug || 'all')}
                  style={{
                    ...cardBase,
                    background: isAllVibesCard
                      ? vibeDarkBg(st.a, st.b, true)
                      : vibeCardBg(st.a, st.b),
                    boxShadow: 'none',
                    transform: 'translateY(0)',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 18px 44px rgba(0,0,0,0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Subtle grain/scanlines (heel subtiel, “urban”) */}
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 5px)',
                      opacity: 0.12,
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Title only (geen ondertitel meer) */}
                  <div
                    style={{
                      ...vibeTitle,
                      color: titleColor,
                      textShadow: isAllVibesCard
                        ? '0 10px 22px rgba(255,255,255,0.24)'
                        : vibeTitle.textShadow,

                      // ✅ 1 woord = altijd 1 regel
                      ...(isSingleWordTitle
                        ? {
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            WebkitLineClamp: 'unset',
                            WebkitBoxOrient: 'unset',
                          }
                        : {
                            whiteSpace: 'normal',
                          }),
                    }}
                  >
                    {titleText}
                  </div>

                  {/* Right image (NIET voor "Alle vibes") */}
                  {!isAllVibesCard && img ? (
                    <div style={imgWrap} aria-hidden>
                      <img
                        src={img}
                        alt=""
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transform: 'scale(1.08)',
                          filter: 'saturate(1.08) contrast(1.08)',
                          display: 'block',
                          borderRadius: 'inherit',
                        }}
                      />
                      {/* subtiele luxe overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.55))',
                          pointerEvents: 'none',
                          borderRadius: 'inherit',
                        }}
                      />
                    </div>
                  ) : null}
                </button>
              );
            })}
        </div>
      </div>
    </section>
  );
}