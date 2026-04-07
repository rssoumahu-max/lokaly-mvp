import React from 'react';

export default function AccountLastNameSection({
  language,
  profile,
  openKey,
  setOpenKey,
  lastNameDraft,
  setLastNameDraft,
  lastNameInputRef,
  lastNameDirtyRef,
  rowBtn,
  rowLeft,
  rowTexts,
  rowTitle,
  rowValue,
  iconPill,
  chevron,
  editorWrap,
  input,
  btnRow,
  btnGhost,
  btnPrimary,
  onSaveLastName,
}) {
  return (
    <>
      <button
        type="button"
        style={rowBtn}
        onClick={() => {
          setOpenKey((p) => (p === 'last' ? null : 'last'));
          setTimeout(() => lastNameInputRef.current?.focus?.(), 0);
        }}
      >
        <div style={rowLeft}>
          <div style={iconPill}>🪪</div>
          <div style={rowTexts}>
            <div style={rowTitle}>
              {language === 'nl' ? 'Achternaam' : 'Last name'}
            </div>
            <div style={rowValue}>
              {(profile?.last_name || '').trim() || '—'}
            </div>
          </div>
        </div>
        <div style={chevron}>{openKey === 'last' ? '×' : '›'}</div>
      </button>

      {openKey === 'last' ? (
        <div style={editorWrap}>
          <input
            ref={lastNameInputRef}
            style={input}
            value={lastNameDraft}
            onChange={(e) => {
              lastNameDirtyRef.current = true;
              setLastNameDraft(e.target.value);
            }}
            placeholder={language === 'nl' ? 'Bijv. Moore' : 'e.g. Moore'}
          />

          <div style={btnRow}>
            <button
              type="button"
              style={btnGhost}
              onClick={() => {
                lastNameDirtyRef.current = false;
                setLastNameDraft(profile?.last_name || '');
                setOpenKey(null);
              }}
            >
              {language === 'nl' ? 'Annuleer' : 'Cancel'}
            </button>

            <button
              type="button"
              style={{
                ...btnPrimary,
                opacity: !lastNameDraft.trim() ? 0.55 : 1,
              }}
              disabled={!lastNameDraft.trim()}
              onClick={async () => {
                await onSaveLastName(lastNameDraft.trim());
                lastNameDirtyRef.current = false;
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