import React from 'react';

export default function AccountEmailSection({
  language,
  user,
  openKey,
  setOpenKey,
  newEmail,
  setNewEmail,
  emailInputRef,
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
  loadingAuth,
  handleUpdateEmail,
}) {
  return (
    <>
      <button
        type="button"
        style={rowBtn}
        onClick={() => {
          setOpenKey((p) => (p === 'email' ? null : 'email'));
          setTimeout(() => emailInputRef.current?.focus?.(), 0);
        }}
      >
        <div style={rowLeft}>
          <div style={iconPill}>✉</div>
          <div style={rowTexts}>
            <div style={rowTitle}>
              {language === 'nl' ? 'E-mail' : 'Email'}
            </div>
            <div style={rowValue}>{user?.email || ''}</div>
          </div>
        </div>
        <div style={chevron}>{openKey === 'email' ? '×' : '›'}</div>
      </button>

      {openKey === 'email' ? (
        <div style={editorWrap}>
          <input
            ref={emailInputRef}
            style={input}
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="name@email.com"
          />

          <div style={help}>
            {language === 'nl'
              ? 'Je ontvangt een bevestigingsmail om de wijziging af te ronden.'
              : 'You’ll receive a confirmation email to finish the change.'}
          </div>

          <div style={btnRow}>
            <button
              type="button"
              style={btnGhost}
              onClick={() => {
                setOpenKey(null);
                setNewEmail(user?.email || '');
              }}
            >
              {language === 'nl' ? 'Sluiten' : 'Close'}
            </button>

            <button
              type="button"
              style={{ ...btnPrimary, opacity: loadingAuth ? 0.6 : 1 }}
              disabled={loadingAuth}
              onClick={handleUpdateEmail}
            >
              {loadingAuth
                ? language === 'nl'
                  ? 'Bezig…'
                  : 'Working…'
                : language === 'nl'
                ? 'Wijzig e-mail'
                : 'Update email'}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}