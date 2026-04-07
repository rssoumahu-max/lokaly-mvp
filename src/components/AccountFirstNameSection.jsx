import React from 'react';
import { THEME } from '../constants/theme';
import { accountSectionStyles } from '../constants/accountSectionStyles';

export default function AccountFirstNameSection({
  language,
  profile,
  openKey,
  setOpenKey,
  firstNameDraft,
  setFirstNameDraft,
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
  setProfileError,
  setProfileSuccess,
  onSaveFirstName,
}) {
  return (
    <>
      <button
        type="button"
        style={rowBtn}
        onClick={() =>
          setOpenKey((p) => (p === 'firstName' ? null : 'firstName'))
        }
      >
        <div style={rowLeft}>
          <div style={iconPill}>👤</div>
          <div style={rowTexts}>
            <div style={rowTitle}>
              {language === 'nl' ? 'Voornaam' : 'First name'}
            </div>
            <div style={rowValue}>
              {(profile?.first_name || '').trim() || '—'}
            </div>
          </div>
        </div>
        <div style={chevron}>{openKey === 'firstName' ? '×' : '›'}</div>
      </button>

      {openKey === 'firstName' ? (
        <div style={editorWrap}>
          <input
            style={input}
            value={firstNameDraft}
            onChange={(e) => setFirstNameDraft(e.target.value)}
            placeholder={language === 'nl' ? 'Voornaam' : 'First name'}
          />

          <div style={btnRow}>
            <button
              type="button"
              style={btnGhost}
              onClick={() => {
                setOpenKey(null);
                setFirstNameDraft(profile?.first_name || '');
              }}
            >
              {language === 'nl' ? 'Annuleer' : 'Cancel'}
            </button>

            <button
              type="button"
              style={{
                ...btnPrimary,
                opacity: !firstNameDraft.trim() ? 0.55 : 1,
              }}
              disabled={!firstNameDraft.trim()}
              onClick={async () => {
                setProfileError('');
                setProfileSuccess('');
                try {
                  await onSaveFirstName(firstNameDraft.trim());
                  setProfileSuccess(
                    language === 'nl'
                      ? 'Voornaam opgeslagen.'
                      : 'First name saved.'
                  );
                  setOpenKey(null);
                } catch (e) {
                  setProfileError(
                    e?.message ||
                      (language === 'nl' ? 'Opslaan mislukt.' : 'Save failed.')
                  );
                }
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
