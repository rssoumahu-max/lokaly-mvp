import React from 'react';

export default function AccountFeedbackSection({
  language,
  openKey,
  setOpenKey,
  feedbackText,
  setFeedbackText,
  feedbackInputRef,
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
  loadingFeedback,
  onSubmitFeedback,
}) {
  const textareaStyle = {
    ...input,
    minHeight: 120,
    padding: '14px',
    resize: 'vertical',
  };

  return (
    <>
      <button
        type="button"
        style={rowBtn}
        onClick={() => {
          setOpenKey((p) => (p === 'feedback' ? null : 'feedback'));
          setTimeout(() => feedbackInputRef.current?.focus?.(), 0);
        }}
      >
        <div style={rowLeft}>
          <div style={iconPill}>✦</div>
          <div style={rowTexts}>
            <div style={rowTitle}>
              {language === 'nl' ? 'Geef feedback' : 'Give feedback'}
            </div>
            <div style={rowValue}>
              {language === 'nl'
                ? 'Help Lokaly verbeteren'
                : 'Help improve Lokaly'}
            </div>
          </div>
        </div>
        <div style={chevron}>{openKey === 'feedback' ? '×' : '›'}</div>
      </button>

      {openKey === 'feedback' ? (
        <div style={editorWrap}>
          <textarea
            ref={feedbackInputRef}
            style={textareaStyle}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder={
              language === 'nl'
                ? 'Deel je idee, bug of verbetering…'
                : 'Share your idea, bug, or improvement…'
            }
          />

          <div style={btnRow}>
            <button
              type="button"
              style={btnGhost}
              onClick={() => {
                setOpenKey(null);
                setFeedbackText('');
              }}
            >
              {language === 'nl' ? 'Sluiten' : 'Close'}
            </button>

            <button
              type="button"
              style={{
                ...btnPrimary,
                opacity: !feedbackText.trim() || loadingFeedback ? 0.6 : 1,
              }}
              disabled={!feedbackText.trim() || loadingFeedback}
              onClick={onSubmitFeedback}
            >
              {loadingFeedback
                ? language === 'nl'
                  ? 'Versturen…'
                  : 'Sending…'
                : language === 'nl'
                ? 'Verstuur feedback'
                : 'Send feedback'}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}