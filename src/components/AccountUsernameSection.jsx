import React from 'react';
import { THEME } from '../constants/theme';

export default function AccountUsernameSection({
  language,
  profile,
  openKey,
  setOpenKey,
  usernameDraft,
  setUsernameDraft,
  usernameInputRef,
  usernameDirtyRef,
  rowBtn,
  rowLeft,
  rowTexts,
  rowTitle,
  rowValue,
  iconPill,
  chevron,
  editorWrap,
  input,
  help,
  btnRow,
  btnGhost,
  btnPrimary,
  setProfileError,
  setProfileSuccess,
  onSaveUsername,
}) {
  return (
    <>
      <button
        type="button"
        style={rowBtn}
        onClick={() => {
          setOpenKey((p) => (p === 'username' ? null : 'username'));
          setTimeout(() => usernameInputRef.current?.focus?.(), 0);
        }}
      >
        <div style={rowLeft}>
          <div style={iconPill}>@</div>
          <div style={rowTexts}>
            <div style={rowTitle}>
              {language === 'nl' ? 'Gebruikersnaam' : 'Username'}
            </div>
            <div style={rowValue}>
              {profile?.username
                ? `@${profile.username}`
                : language === 'nl'
                ? 'Nog niet ingesteld'
                : 'Not set'}
            </div>
          </div>
        </div>
        <div style={chevron}>{openKey === 'username' ? '×' : '›'}</div>
      </button>

      {openKey === 'username' ? (
        <div style={editorWrap}>
          <input
            ref={usernameInputRef}
            style={input}
            value={usernameDraft}
            onChange={(e) => {
              usernameDirtyRef.current = true;
              setUsernameDraft(e.target.value);
            }}
            placeholder={
              language === 'nl' ? 'jouwgebruikersnaam' : 'yourusername'
            }
          />

          <div style={help}>
            {language === 'nl'
              ? 'Kies iets korts en herkenbaars.'
              : 'Keep it short and recognizable.'}
          </div>

          <div style={btnRow}>
            <button
              type="button"
              style={btnGhost}
              onClick={() => {
                setOpenKey(null);
                usernameDirtyRef.current = false;
                setUsernameDraft(profile?.username || '');
              }}
            >
              {language === 'nl' ? 'Annuleer' : 'Cancel'}
            </button>

            <button
              type="button"
              style={{
                ...btnPrimary,
                opacity: !usernameDraft.trim() ? 0.55 : 1,
              }}
              disabled={!usernameDraft.trim()}
              onClick={async () => {
                setProfileError('');
                setProfileSuccess('');
                try {
                  await onSaveUsername(usernameDraft.trim());
                  usernameDirtyRef.current = false;
                  setProfileSuccess(
                    language === 'nl'
                      ? 'Gebruikersnaam opgeslagen.'
                      : 'Username saved.'
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
