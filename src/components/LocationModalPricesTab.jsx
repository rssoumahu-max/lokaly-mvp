import React from 'react';

export default function LocationModalPricesTab({ language, THEME, location }) {
  const fmtMoney = (n) => {
    const v = Number(n);
    if (!Number.isFinite(v)) return null;
    return `€${(Math.round(v * 100) / 100).toFixed(2).replace('.00', '')}`;
  };

  const priceNote = (location?.priceNote || '').trim();

  let indication = language === 'nl' ? 'Prijs varieert' : 'Price varies';

  if (location?.isFree) {
    indication = language === 'nl' ? 'Gratis' : 'Free';
  } else if (
    Number.isFinite(Number(location?.priceMin)) &&
    Number.isFinite(Number(location?.priceMax)) &&
    Number(location?.priceMin) > 0 &&
    Number(location?.priceMax) > 0
  ) {
    indication = `${fmtMoney(location.priceMin)} – ${fmtMoney(
      location.priceMax
    )}`;
  } else if (
    Number.isFinite(Number(location?.priceMin)) &&
    Number(location?.priceMin) > 0
  ) {
    indication =
      language === 'nl'
        ? `Vanaf ${fmtMoney(location.priceMin)}`
        : `From ${fmtMoney(location.priceMin)}`;
  } else if (
    typeof location?.priceLevel === 'string' &&
    location.priceLevel.trim()
  ) {
    indication = location.priceLevel.trim();
  }

  const rawItems = Array.isArray(location?.priceItems)
    ? location.priceItems
    : [];

  const rows = rawItems
    .map((item, i) => {
      const title =
        (item?.title || item?.label || item?.name || '').trim() ||
        (language === 'nl' ? `Item ${i + 1}` : `Item ${i + 1}`);

      const note = (item?.note || item?.description || '').trim() || '';

      let right = '';

      if (item?.price != null && Number.isFinite(Number(item.price))) {
        right = fmtMoney(item.price) || '';
      } else if (item?.value != null && String(item.value).trim()) {
        right = String(item.value).trim();
      } else if (item?.amount != null && String(item.amount).trim()) {
        right = String(item.amount).trim();
      }

      return { title, note, right };
    })
    .filter((r) => r.title && r.right);

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
          {language === 'nl' ? 'Prijzen' : 'Prices'}
        </h3>

        {/* Indicatie */}
        <div
          style={{
            marginTop: 8,
            fontFamily: THEME.font,
            fontSize: 13.5,
            fontWeight: 450,
            color: 'rgba(235,240,255,0.74)',
          }}
        >
          {language === 'nl' ? 'Indicatie:' : 'Indication:'}{' '}
          <span
            style={{
              color: 'rgba(235,240,255,0.88)',
              fontWeight: 600,
            }}
          >
            {indication}
          </span>
        </div>

        {/* Algemene admin-beschrijving eerst */}
        {!!priceNote && (
          <div
            style={{
              marginTop: 10,
              fontFamily: THEME.font,
              fontSize: 13.5,
              fontWeight: 400,
              lineHeight: 1.6,
              color: 'rgba(235,240,255,0.74)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {priceNote}
          </div>
        )}

        {/* Alleen concrete prijsregels tonen als ze echt een waarde hebben */}
        {rows.length > 0 && (
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {rows.map((r, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 160px',
                  gap: 12,
                  alignItems: 'center',
                  padding: '11px 13px',
                  borderRadius: 15,
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.035)',
                }}
              >
                <div
                  style={{
                    fontFamily: THEME.font,
                    fontSize: 13.2,
                    fontWeight: 600,
                    color: 'rgba(235,240,255,0.86)',
                  }}
                >
                  {r.title}
                  {r.note ? (
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 12.2,
                        fontWeight: 450,
                        color: 'rgba(235,240,255,0.58)',
                      }}
                    >
                      {r.note}
                    </div>
                  ) : null}
                </div>

                <div
                  style={{
                    fontFamily: THEME.font,
                    fontSize: 13.2,
                    fontWeight: 500,
                    color: 'rgba(235,240,255,0.74)',
                    textAlign: 'right',
                  }}
                >
                  {r.right}
                </div>
              </div>
            ))}
          </div>
        )}

        {!priceNote && rows.length === 0 && (
          <div
            style={{
              marginTop: 10,
              fontFamily: THEME.font,
              fontSize: 13.5,
              fontWeight: 400,
              color: 'rgba(235,240,255,0.60)',
            }}
          >
            {language === 'nl'
              ? 'Geen prijsdetails ingevuld.'
              : 'No price details set.'}
          </div>
        )}
      </div>
    </div>
  );
}
