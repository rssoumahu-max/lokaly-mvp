import React from 'react';

export default function AccountPasswordSection({
  language,
  openKey,
  setOpenKey,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  currentPasswordRef,
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
  handleUpdatePassword,
}) {
  const passwordRow = {
    display: 'grid',
    gap: 10,
  };

  const passwordFieldWrap = {
    position: 'relative',
  };

  const passwordToggleBtn = {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255,255,255,0.72)',
    cursor: 'pointer',
    fontSize: 12.5,
    fontWeight: 700,
  };

  return (
    <>
      <button
        type="button"
        style={rowBtn}
        onClick={() => {
          setOpenKey((p) => (p === 'password' ? null : 'password'));
          setTimeout(() => currentPasswordRef.current?.focus?.(), 0);
        }}
      >
        <div style={rowLeft}>
          <div style={iconPill}>⦿</div>
          <div style={rowTexts}>
            <div style={rowTitle}>
              {language === 'nl' ? 'Wachtwoord' : 'Password'}
            </div>
            <div style={rowValue}>
              {language === 'nl' ? 'Wijzigen' : 'Change'}
            </div>
          </div>
        </div>
        <div style={chevron}>{openKey === 'password' ? '×' : '›'}</div>
      </button>

      {openKey === 'password' ? (
        <div style={editorWrap}>
          <div style={passwordRow}>
            <div style={passwordFieldWrap}>
              <input
                ref={currentPasswordRef}
                style={input}
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={
                  language === 'nl'
                    ? 'Huidig wachtwoord'
                    : 'Current password'
                }
              />
              <button
                type="button"
                style={passwordToggleBtn}
                onClick={() => setShowCurrentPassword((v) => !v)}
              >
                {showCurrentPassword
                  ? language === 'nl'
                    ? 'Verberg'
                    : 'Hide'
                  : language === 'nl'
                  ? 'Toon'
                  : 'Show'}
              </button>
            </div>

            <div style={passwordFieldWrap}>
              <input
                style={input}
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={
                  language === 'nl' ? 'Nieuw wachtwoord' : 'New password'
                }
              />
              <button
                type="button"
                style={passwordToggleBtn}
                onClick={() => setShowNewPassword((v) => !v)}
              >
                {showNewPassword
                  ? language === 'nl'
                    ? 'Verberg'
                    : 'Hide'
                  : language === 'nl'
                  ? 'Toon'
                  : 'Show'}
              </button>
            </div>
          </div>

          <div style={help}>
            {language === 'nl'
              ? 'Gebruik minimaal 8 tekens.'
              : 'Use at least 8 characters.'}
          </div>

          <div style={btnRow}>
            <button
              type="button"
              style={btnGhost}
              onClick={() => {
                setOpenKey(null);
                setCurrentPassword('');
                setNewPassword('');
              }}
            >
              {language === 'nl' ? 'Sluiten' : 'Close'}
            </button>

            <button
              type="button"
              style={{ ...btnPrimary, opacity: loadingAuth ? 0.6 : 1 }}
              disabled={loadingAuth}
              onClick={handleUpdatePassword}
            >
              {loadingAuth
                ? language === 'nl'
                  ? 'Bezig…'
                  : 'Working…'
                : language === 'nl'
                ? 'Wijzig wachtwoord'
                : 'Update password'}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}