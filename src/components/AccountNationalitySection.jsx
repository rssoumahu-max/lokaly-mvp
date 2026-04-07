import React from 'react';

export default function AccountNationalitySection({
  language,
  profile,
  openKey,
  setOpenKey,
  nationalityDraft,
  setNationalityDraft,
  nationalityInputRef,
  nationalityDirtyRef,
  NATIONALITIES,
  rowBtn,
  rowLeft,
  rowTexts,
  rowTitle,
  rowValue,
  iconPill,
  chevron,
  editorWrap,
  selectInput,
  btnRow,
  btnGhost,
  btnPrimary,
  onSaveNationality,
}) {
  const foundNationality = NATIONALITIES.find(
    (n) => n.code === profile?.nationality
  );

  const nationalityLabel = foundNationality
    ? language === 'nl'
      ? foundNationality.nl
      : foundNationality.en
    : (profile?.nationality || '').trim() || '—';

  return (
    <>
      <button
        type="button"
        style={rowBtn}
        onClick={() => {
          setOpenKey((p) => (p === 'nationality' ? null : 'nationality'));
          setTimeout(() => nationalityInputRef.current?.focus?.(), 0);
        }}
      >
        <div style={rowLeft}>
          <div style={iconPill}>🌍</div>
          <div style={rowTexts}>
            <div style={rowTitle}>
              {language === 'nl' ? 'Nationaliteit' : 'Nationality'}
            </div>
            <div style={rowValue}>{nationalityLabel}</div>
          </div>
        </div>
        <div style={chevron}>{openKey === 'nationality' ? '×' : '›'}</div>
      </button>

      {openKey === 'nationality' ? (
        <div style={editorWrap}>
          <select
            ref={nationalityInputRef}
            style={selectInput}
            value={nationalityDraft}
            onChange={(e) => {
              nationalityDirtyRef.current = true;
              setNationalityDraft(e.target.value);
            }}
          >
            <option value="">
              {language === 'nl'
                ? 'Kies nationaliteit…'
                : 'Select nationality…'}
            </option>

            {NATIONALITIES.map((n) => (
              <option key={n.code} value={n.code}>
                {language === 'nl' ? n.nl : n.en}
              </option>
            ))}
          </select>

          <div style={btnRow}>
            <button
              type="button"
              style={btnGhost}
              onClick={() => {
                nationalityDirtyRef.current = false;
                setNationalityDraft(profile?.nationality || '');
                setOpenKey(null);
              }}
            >
              {language === 'nl' ? 'Annuleer' : 'Cancel'}
            </button>

            <button
              type="button"
              style={btnPrimary}
              onClick={async () => {
                await onSaveNationality(nationalityDraft);
                nationalityDirtyRef.current = false;
                setOpenKey(null);
              }}
            >
              {language === 'nl' ? 'Opslaan' : 'Save'}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
