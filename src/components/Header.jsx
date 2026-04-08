import React, { useState, useEffect } from 'react';
import { THEME } from '../constants/theme';
import { STRINGS } from '../constants/strings';
import { useIsMobile } from '../hooks/useIsMobile';
import { IconSearch, IconMenu, IconUser } from './icons';

export default function Header({
  onNavigate,
  currentPage,
  language,
  setLanguage,
  searchTerm,
  onSearchChange,
  onMobileSearchToggle,
  mobileSearchOpen,

  // ✅ ADD THESE:
  onSearchOpen,
  onSearchClose,

  user,
  onAccountClick,
  profile,
}) {
  const isMobile = useIsMobile();
  const t = STRINGS[language];

  // ✅ MOET BOVEN de styles staan, anders crasht 'isDark'
  const isHome = currentPage === 'home';
  const isCategory = currentPage === 'category';
  const isVibes = currentPage === 'vibes';
  const isMap = currentPage === 'map';
  const isDetail = currentPage === 'detail' || currentPage === 'reviews';

  // ✅ footer-link pages ook dark maken (zelfde stijl als home/category/map)
  const isInfo =
    currentPage === 'about' ||
    currentPage === 'how' ||
    currentPage === 'organizers' ||
    currentPage === 'privacy' ||
    currentPage === 'terms' ||
    currentPage === 'contact' ||
    currentPage === 'feedback';

  const isDark =
    isHome ||
    isCategory ||
    isVibes ||
    isMap ||
    isDetail ||
    isInfo ||
    currentPage === 'account';

  // ✅ Admin navbar altijd LIGHT
  const navIsDark = isDark && currentPage !== 'admin';

  const isAdmin = !!profile?.is_admin;
  const isAdminPage = currentPage === 'admin';
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setNavScrolled(true); // op andere pagina’s altijd “solid”
      return;
    }

    const onScroll = () => setNavScrolled(window.scrollY > 10);
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  const showSolidNav = !isHome || navScrolled;

  const containerStyle = {
    position: 'sticky',
    top: 0,

    // ✅ Altijd boven de hero/preview lagen
    zIndex: 9999,
    isolation: 'isolate',

    // ✅ Op home: bovenaan transparanter (blend met hero), na scroll solid
    background: navIsDark
      ? showSolidNav
        ? 'linear-gradient(180deg, rgba(0,0,0,0.92), rgba(0,0,0,0.78))'
        : 'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.00))'
      : showSolidNav
      ? 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(247,243,234,0.90))'
      : 'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.00))',

    // ✅ Border alleen als je gescrolled bent (anders krijg je die “harde lijn” op de hero)
    borderBottom: showSolidNav
      ? navIsDark
        ? '1px solid rgba(255,255,255,0.10)'
        : `1px solid ${THEME.border}`
      : '1px solid rgba(255,255,255,0.00)',

    // ✅ Extra: subtiele shadow na scroll (geeft “los” gevoel van hero)
    boxShadow: showSolidNav ? '0 10px 30px rgba(0,0,0,0.28)' : 'none',

    padding: '10px 16px 10px 16px',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    fontFamily: THEME.font,

    transition:
      'background 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
  };

  const topRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    maxWidth: 1120,
    margin: '0 auto',
  };

  const navStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? 8 : 10,
    fontSize: 13,
    textTransform: 'none',
    letterSpacing: 0,
    flexWrap: 'nowrap',
  };

  const logoStyle = {
    fontFamily: THEME.fontDisplay,
    fontWeight: 900,
    fontSize: 18,
    letterSpacing: 0.2,
    cursor: 'pointer',
    userSelect: 'none',
    color: THEME.orange, // of THEME.accent als jij die gebruikt voor oranje
  };

  const searchWrapStyle = {
    flex: 1,
    maxWidth: 560,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    height: 42,
    padding: '0 14px',
    borderRadius: '22px',
    border: navIsDark
      ? '1px solid rgba(255,255,255,0.14)'
      : `1px solid ${THEME.border}`,
    background: navIsDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.92)',
    color: navIsDark ? 'rgba(255,255,255,0.92)' : THEME.text,
    boxShadow: navIsDark ? 'none' : '0 2px 16px rgba(15,23,42,0.06)',
    cursor: 'text',
  };

  const searchInputInnerStyle = {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: navIsDark ? 'rgba(255,255,255,0.92)' : THEME.text,
    fontSize: 14,
    fontFamily: THEME.font,
    fontWeight: 400,
  };

  // Pill buttons (zoals screenshot, maar Lokaly-oranje accent)
  const navButtonBase = {
    padding: isMobile ? '8px 12px' : '9px 14px',
    borderRadius: isMobile ? '10px 0 10px 0' : '12px 0 12px 0',
    border: navIsDark
      ? '1px solid rgba(255,255,255,0.14)'
      : `1px solid ${THEME.border}`,
    background: navIsDark ? 'rgba(255,255,255,0.06)' : THEME.surface,
    color: navIsDark ? 'rgba(255,255,255,0.92)' : THEME.text,
    fontFamily: THEME.font, // Inter i.p.v. Space Grotesk
    fontWeight: 400, // dunner
    fontSize: 12.5, // mag zo blijven (of 12)
    letterSpacing: 0.1, // minder “bold look”
    textTransform: 'none',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition:
      'background 0.18s ease-out, border-color 0.18s ease-out, transform 0.12s ease-out',
  };

  const navActive = {
    ...navButtonBase,

    // ✅ alleen rand + tekst accent
    border: navIsDark
      ? `1px solid rgba(255,107,61,0.85)`
      : `1px solid rgba(255,107,61,0.65)`,

    // ✅ binnenkant NIET vullen (zelfde als inactive)
    background: navButtonBase.background,

    color: navIsDark ? 'rgba(255,107,61,0.98)' : THEME.orange,

    // net iets strakker
    boxShadow: 'none',
  };

  const navInactive = {
    ...navButtonBase,
  };

  // ✅ avatar helpers (Header)
  const showNavAvatar = !!user; // ingelogd? dan avatar/initialen tonen

  function navInitials() {
    const src =
      profile?.full_name ||
      [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
      profile?.username ||
      user?.email ||
      'L';
    const parts = String(src).trim().split(' ').filter(Boolean).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() || '').join('') || 'L';
  }

  const navAvatarStyle = {
    width: '100%',
    height: '100%',
    display: 'block',
  };

  const accountButtonAvatarStyle = {
    ...navButtonBase,
    height: 36,
    width: 48,
    padding: 0,
    gap: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  const accountButtonTextStyle = {
    ...navButtonBase,
    height: 36,
    width: 'auto', // ✅ laat breder worden voor "Account"
    padding: '0 14px', // ✅ zelfde feel als andere knoppen
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
  };

  const accountButtonStyle = showNavAvatar
    ? accountButtonAvatarStyle
    : accountButtonTextStyle;

  const langPillStyle = {
    ...navButtonBase,
    height: 36,
    padding: '0 12px',
    borderRadius: isMobile ? '10px 0 10px 0' : '12px 0 12px 0',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,

    // taal label styling (zoals jij nu had)
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.6,

    // zorg dat focus geen extra rand geeft
    outline: 'none',
  };

  const toggleLanguage = () => {
    setLanguage(language === 'nl' ? 'en' : 'nl');
  };

  // Mobile icon buttons matchen met de pills
  const searchIconButtonStyle = {
    ...navButtonBase,
    padding: '8px 12px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
  };

  const hamburgerButtonStyle = {
    ...navButtonBase,
    padding: '8px 12px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    lineHeight: '16px',
  };

  const renderSearchInput = (styleOverrides = {}) => (
    <div style={{ ...searchWrapStyle, ...styleOverrides }}>
      <span
        style={{
          fontSize: 14,
          color: navIsDark ? 'rgba(255,255,255,0.45)' : THEME.muted,
          display: 'inline-flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <IconSearch />
      </span>
      <input
        style={searchInputInnerStyle}
        placeholder={t.searchPlaceholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={() => onSearchOpen?.()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onSearchClose?.();
        }}
      />
      <span
        style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: navIsDark ? 'rgba(255,107,61,0.18)' : 'rgba(255,107,61,0.12)',
          border: '1px solid rgba(255,107,61,0.30)',
          display: 'grid',
          placeItems: 'center',
          fontSize: 13,
          color: 'rgba(255,107,61,0.90)',
        }}
      >
        <IconSearch />
      </span>
    </div>
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mobileMenuOverlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)', // donkerder, match met overlays homepage
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    zIndex: 20000, // zeker boven alles
  };

  const mobileMenuPanelStyle = {
    position: 'fixed',
    top: 70, // net onder header
    right: 12,
    width: 'min(320px, calc(100vw - 24px))',
    padding: 12,

    // ✅ Lokaly "pill corners"
    borderRadius: '16px 0 16px 0',
    border: '1px solid rgba(255,255,255,0.12)',

    // ✅ dark glass panel
    background: 'rgba(12,12,13,0.82)',
    boxShadow: '0 26px 80px rgba(0,0,0,0.60)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',

    zIndex: 20001,
  };

  const mobileMenuHeaderRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: '6px 6px 10px',
  };

  const mobileMenuTitleStyle = {
    fontFamily: THEME.font, // match nav buttons
    fontWeight: 500,
    fontSize: 13,
    letterSpacing: 0.1,
    color: 'rgba(255,255,255,0.86)',
  };

  const mobileMenuCloseBtnStyle = {
    // ✅ zelfde "pill" shape als navbar buttons
    width: 36,
    height: 36,
    borderRadius: '12px 0 12px 0',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.92)',
    fontSize: 18,
    lineHeight: '18px',
  };

  const mobileMenuItemStyle = (active) => ({
    width: '100%',
    textAlign: 'left',
    padding: '12px 12px',

    // ✅ zelfde hoek-gevoel als je nav
    borderRadius: '12px 0 12px 0',

    border: active
      ? '1px solid rgba(255,107,61,0.55)'
      : '1px solid rgba(255,255,255,0.12)',

    background: active
      ? 'rgba(255,107,61,0.14)' // oranje soft
      : 'rgba(255,255,255,0.06)',

    color: active ? 'rgba(255,107,61,0.98)' : 'rgba(255,255,255,0.90)',

    fontFamily: THEME.font,
    fontWeight: 450, // dunner, zoals homepage
    fontSize: 13,
    letterSpacing: 0.1,

    cursor: 'pointer',
    transition:
      'transform 120ms ease, border-color 180ms ease, background 180ms ease',
  });

  const go = (page) => {
    setMobileMenuOpen(false);
    onNavigate(page);
  };

  return (
    <>
      <header style={containerStyle}>
        <div style={topRowStyle}>
          <span style={logoStyle} onClick={() => onNavigate('home')}>
            Lokaly.
          </span>

          {!isMobile && renderSearchInput()}

          <nav style={navStyle}>
            {isMobile && (
              <button
                style={searchIconButtonStyle}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = 'scale(0.96)')
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = 'scale(1)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = 'scale(1)')
                }
                onClick={onMobileSearchToggle}
                title={t.search}
                type="button"
              >
                <IconSearch />
              </button>
            )}

            {isMobile && (
              <button
                style={hamburgerButtonStyle}
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label={t.openMenu}
                title={t.menu}
                type="button"
              >
                <IconMenu />
              </button>
            )}

            {!isMobile && (
              <>
                <button
                  style={isHome ? navActive : navInactive}
                  onClick={() => onNavigate('home')}
                  type="button"
                >
                  {t.home}
                </button>

                <button
                  style={isCategory ? navActive : navInactive}
                  onClick={() => onNavigate('category')}
                  type="button"
                >
                  {t.categories}
                </button>

                <button
                  style={isVibes ? navActive : navInactive}
                  onClick={() => onNavigate('vibes')}
                  type="button"
                >
                  {t.vibes}
                </button>

                <button
                  style={isMap ? navActive : navInactive}
                  onClick={() => onNavigate('map')}
                  type="button"
                >
                  {t.map}
                </button>

                {isAdmin && (
                  <button
                    style={isAdminPage ? navActive : navInactive}
                    onClick={() => onNavigate('admin')}
                    type="button"
                  >
                    Admin
                  </button>
                )}

                {/* ✅ taal-switch alleen desktop */}
                <button
                  type="button"
                  onClick={toggleLanguage}
                  style={langPillStyle}
                  aria-label={t.changeLanguage}
                  title={
                    language === 'nl'
                      ? 'Switch to English'
                      : 'Wissel naar Nederlands'
                  }
                >
                  {language === 'nl' ? 'EN' : 'NL'}
                </button>
              </>
            )}

            <button
              onClick={onAccountClick}
              style={accountButtonStyle}
              type="button"
            >
              {showNavAvatar ? (
                profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="avatar"
                    style={{
                      ...navAvatarStyle,
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 12,
                      fontWeight: 900,
                      color: 'rgba(255,255,255,0.92)',
                    }}
                  >
                    {navInitials()}
                  </div>
                )
              ) : (
                // niet ingelogd → “Account” (geen email)
                <span>{language === 'nl' ? 'Account' : 'Account'}</span>
              )}
            </button>
          </nav>
        </div>

      </header>

      {isMobile && mobileMenuOpen && (
        <>
          <div
            style={mobileMenuOverlayStyle}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div style={mobileMenuPanelStyle}>
            <div style={mobileMenuHeaderRowStyle}>
              <div style={mobileMenuTitleStyle}>{t.menu}</div>
              <button
                type="button"
                style={mobileMenuCloseBtnStyle}
                onClick={() => setMobileMenuOpen(false)}
                aria-label={t.closeMenu}
                title={t.close}
              >
                ×
              </button>
            </div>

            <button
              style={mobileMenuItemStyle(isHome)}
              onClick={() => go('home')}
            >
              {t.home}
            </button>

            <div style={{ height: 8 }} />

            <button
              style={mobileMenuItemStyle(isCategory)}
              onClick={() => go('category')}
            >
              {t.categories}
            </button>

            <div style={{ height: 8 }} />

            <button
              style={mobileMenuItemStyle(isVibes)}
              onClick={() => go('vibes')}
            >
              {t.vibes}
            </button>

            <div style={{ height: 8 }} />

            <button
              style={mobileMenuItemStyle(isMap)}
              onClick={() => go('map')}
            >
              {t.map}
            </button>
            <div style={{ height: 8 }} />

            {isAdmin && (
              <>
                <button
                  style={mobileMenuItemStyle(isAdminPage)}
                  onClick={() => go('admin')}
                >
                  Admin
                </button>
              </>
            )}
            <div style={{ height: 14 }} />
            <div
              style={{
                borderTop: '1px solid rgba(255,255,255,0.10)',
                paddingTop: 14,
              }}
            >
              <div
                style={{
                  color: 'rgba(235,240,255,0.62)',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  marginBottom: 10,
                }}
              >
                {t.languageLabel}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 12,
                    border:
                      language === 'nl'
                        ? `1px solid ${THEME.orangeBorder}`
                        : '1px solid rgba(255,255,255,0.14)',
                    background:
                      language === 'nl'
                        ? 'rgba(255,107,61,0.10)'
                        : 'rgba(255,255,255,0.06)',
                    color: 'rgba(235,240,255,0.92)',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                  onClick={() => setLanguage('nl')}
                >
                  NL
                </button>

                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 12,
                    border:
                      language === 'en'
                        ? `1px solid ${THEME.orangeBorder}`
                        : '1px solid rgba(255,255,255,0.14)',
                    background:
                      language === 'en'
                        ? 'rgba(255,107,61,0.10)'
                        : 'rgba(255,255,255,0.06)',
                    color: 'rgba(235,240,255,0.92)',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                  onClick={() => setLanguage('en')}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
