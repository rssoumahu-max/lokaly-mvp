import React from 'react';

export default function LocationModalInfoTab({
  language,
  THEME,
  fullAddress,
  mapsHref,
  longDesc,
  detailDesc,
  mapsUrl,
  miniMapZoom,
  setMiniMapZoom,
  detailMiniMapRef,
  detailMiniMapReady,
}) {
  const sectionTitleStyle = {
    margin: '0 0 10px 0',
    fontFamily: THEME.fontDisplay,
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: -0.2,
    color: 'rgba(235,240,255,0.94)',
  };

  const bodyStyle = {
    fontFamily: THEME.font,
    fontSize: 14,
    fontWeight: 420,
    lineHeight: 1.6,
    color: 'rgba(235,240,255,0.78)',
    whiteSpace: 'pre-wrap',
  };

  const subtleCardStyle = {
    borderRadius: 18,
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.03)',
    padding: '14px 14px 14px 14px',
  };

  const actionBtnStyle = {
    minHeight: 38,
    padding: '0 14px',
    borderRadius: '12px 0 12px 0',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.04)',
    color: 'rgba(235,240,255,0.90)',
    fontFamily: THEME.font,
    fontSize: 13,
    fontWeight: 650,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      style={{
        width: '100%',
        margin: 0,
        padding: '0 18px',
      }}
    >
      {!!fullAddress && (
        <a
          href={mapsHref}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            fontFamily: THEME.font,
            fontSize: 13,
            fontWeight: 450,
            color: 'rgba(235,240,255,0.70)',
            padding: '8px 10px',
            borderRadius: '10px 0 10px 0',
            border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(255,255,255,0.04)',
            marginBottom: 10,
          }}
        >
          <span>📍</span>
          <span>{fullAddress}</span>
        </a>
      )}

      {!!(longDesc || detailDesc) && (
        <div style={{ ...subtleCardStyle, marginBottom: 10 }}>
          <div style={sectionTitleStyle}>
            {language === 'nl' ? 'Over deze plek' : 'About this place'}
          </div>

          <div style={bodyStyle}>{longDesc || detailDesc}</div>
        </div>
      )}

      <div style={{ ...subtleCardStyle, marginBottom: 10, overflow: 'hidden' }}>
        <div style={sectionTitleStyle}>
          {language === 'nl' ? 'Locatie' : 'Location'}
        </div>

        <div
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
            position: 'relative',
          }}
        >
          <div
            ref={detailMiniMapRef}
            style={{
              width: '100%',
              height: 230,
              display: 'block',
            }}
          />

          {!detailMiniMapReady && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: THEME.font,
                fontSize: 13.5,
                color: 'rgba(235,240,255,0.60)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              {language === 'nl' ? 'Kaart laden…' : 'Loading map…'}
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 12,
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            style={actionBtnStyle}
          >
            {language === 'nl' ? 'Open in Maps' : 'Open in Maps'}
          </a>

          <button
            type="button"
            onClick={() => setMiniMapZoom((z) => Math.max(10, z - 1))}
            style={actionBtnStyle}
          >
            −
          </button>

          <button
            type="button"
            onClick={() => setMiniMapZoom((z) => Math.min(18, z + 1))}
            style={actionBtnStyle}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
