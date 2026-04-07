import React from 'react';

export default function AccountBirthDateSection({
  language,
  profile,
  openKey,
  setOpenKey,
  birthDateDraft,
  setBirthDateDraft,
  savingBirthDate,
  birthDateInputRef,
  isoToNl,
  nlToIso,
  editorWrap,
  input,
  btnRow,
  btnGhost,
  btnPrimary,
  onSaveBirthDate,
}) {
  if (openKey !== 'birth') return null;

  return (
    <div style={editorWrap}>
      <input
        ref={birthDateInputRef}
        style={input}
        value={birthDateDraft}
        onChange={(e) => setBirthDateDraft(e.target.value)}
        placeholder={language === 'nl' ? 'DD-MM-JJJJ' : 'DD-MM-YYYY'}
      />

      <div style={btnRow}>
        <button
          type="button"
          style={btnGhost}
          onClick={() => {
            setBirthDateDraft(isoToNl(profile?.birth_date));
            setOpenKey(null);
          }}
        >
          {language === 'nl' ? 'Annuleer' : 'Cancel'}
        </button>

        <button
          type="button"
          style={{
            ...btnPrimary,
            opacity: savingBirthDate ? 0.7 : 1,
          }}
          disabled={savingBirthDate}
          onClick={async () => {
            await onSaveBirthDate(nlToIso(birthDateDraft));
            setOpenKey(null);
          }}
        >
          {savingBirthDate
            ? language === 'nl'
              ? 'Opslaan...'
              : 'Saving...'
            : language === 'nl'
            ? 'Opslaan'
            : 'Save'}
        </button>
      </div>
    </div>
  );
}