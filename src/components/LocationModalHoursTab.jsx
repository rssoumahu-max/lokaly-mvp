import React from 'react';

export default function LocationModalHoursTab({
  language,
  THEME,
  openingLines,
}) {
  return (
    <div
      style={{
        width: 'min(780px, 100%)',
        margin: '0 auto',
        padding: '0 14px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.10)',
          background: 'rgba(255,255,255,0.04)',
          padding: 16,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: THEME.font,
            fontSize: 15,
            fontWeight: 520,
            letterSpacing: 0.1,
            color: 'rgba(235,240,255,0.88)',
          }}
        >
          {language === 'nl' ? 'Openingstijden' : 'Opening hours'}
        </h3>

        <div style={{ marginTop: 12 }}>
          {openingLines?.length ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {openingLines.map((line, idx) => {
                const raw = String(line || '');
                const splitAt = raw.indexOf(':');
                const day =
                  splitAt >= 0 ? raw.slice(0, splitAt).trim() : raw.trim();
                const time = splitAt >= 0 ? raw.slice(splitAt + 1).trim() : '';

                const lower = time.toLowerCase();
                const isClosed =
                  lower.includes('gesloten') || lower.includes('closed');

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '72px 1fr',
                      gap: 12,
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: 14,
                      border: isClosed
                        ? '1px solid rgba(255,186,166,0.10)'
                        : '1px solid rgba(255,255,255,0.07)',
                      background: isClosed
                        ? 'rgba(255,186,166,0.035)'
                        : 'rgba(255,255,255,0.035)',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: THEME.font,
                        fontSize: 13,
                        fontWeight: 620,
                        color: 'rgba(235,240,255,0.86)',
                      }}
                    >
                      {day}
                    </div>

                    <div
                      style={{
                        fontFamily: THEME.font,
                        fontSize: 13.5,
                        fontWeight: isClosed ? 600 : 500,
                        color: isClosed
                          ? 'rgba(255,186,166,0.88)'
                          : 'rgba(235,240,255,0.76)',
                      }}
                    >
                      {time || '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                marginTop: 12,
                padding: '14px 16px',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.03)',
                color: 'rgba(235,240,255,0.72)',
                fontFamily: THEME.font,
                fontSize: 13.5,
                lineHeight: 1.5,
              }}
            >
              {language === 'nl'
                ? 'Geen openingstijden beschikbaar.'
                : 'No opening hours available.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
