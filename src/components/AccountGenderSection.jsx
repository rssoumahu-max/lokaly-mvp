import React from 'react';

export default function AccountGenderSection({
  language,
  profile,
  openKey,
  setOpenKey,
  genderDraft,
  setGenderDraft,
  genderInputRef,
  genderDirtyRef,
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
  onSaveGender,
}) {
  return (
    <>
      <button
        type="button"
        style={rowBtn}
        onClick={() => {
          setOpenKey((p) => (p === 'gender' ? null : 'gender'));
          setTimeout(() => genderInputRef.current?.focus?.(), 0);
        }}
      >
        <div style={rowLeft}>
          <div style={iconPill}>⚥</div>
          <div style={rowTexts}>
            <div style={rowTitle}>
              {language === 'nl' ? 'Geslacht' : 'Gender'}
            </div>
            <div style={rowValue}>
              {!profile?.gender
                ? '—'
                : profile.gender === 'male'
                ? language === 'nl'
                  ? 'Man'
                  : 'Male'
                : profile.gender === 'female'
                ? language === 'nl'
                  ? 'Vrouw'
                  : 'Female'
                : profile.gender === 'other'
                ? language === 'nl'
                  ? 'Anders'
                  : 'Other'
                : language === 'nl'
                ? 'Zeg ik liever niet'
                : 'Prefer not to say'}
            </div>
          </div>
        </div>
        <div style={chevron}>{openKey === 'gender' ? '×' : '›'}</div>
      </button>

      {openKey === 'gender' ? (
        <div style={editorWrap}>
          <select
            ref={genderInputRef}
            style={selectInput}
            value={genderDraft}
            onChange={(e) => {
              genderDirtyRef.current = true;
              setGenderDraft(e.target.value);
            }}
          >
            <option value="">
              {language === 'nl' ? 'Kies…' : 'Select…'}
            </option>
            <option value="male">{language === 'nl' ? 'Man' : 'Male'}</option>
            <option value="female">
              {language === 'nl' ? 'Vrouw' : 'Female'}
            </option>
            <option value="other">
              {language === 'nl' ? 'Anders' : 'Other'}
            </option>
            <option value="na">
              {language === 'nl' ? 'Zeg ik liever niet' : 'Prefer not to say'}
            </option>
          </select>

          <div style={btnRow}>
            <button
              type="button"
              style={btnGhost}
              onClick={() => {
                genderDirtyRef.current = false;
                setGenderDraft(profile?.gender || '');
                setOpenKey(null);
              }}
            >
              {language === 'nl' ? 'Annuleer' : 'Cancel'}
            </button>

            <button
              type="button"
              style={btnPrimary}
              onClick={async () => {
                await onSaveGender(genderDraft);
                genderDirtyRef.current = false;
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