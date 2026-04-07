import { THEME } from './theme';

export const accountSectionStyles = {
  rowBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    background: 'transparent',
    border: 'none',
    padding: '16px 0',
    cursor: 'pointer',
    textAlign: 'left',
  },

  rowLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
    flex: 1,
  },

  rowTexts: {
    minWidth: 0,
    flex: 1,
  },

  rowTitle: {
    fontFamily: THEME.font,
    fontSize: 15,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.94)',
    marginBottom: 4,
  },

  rowValue: {
    fontFamily: THEME.font,
    fontSize: 14,
    lineHeight: 1.45,
    color: 'rgba(255,255,255,0.72)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  iconPill: {
    width: 22,
    height: 22,
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    flex: '0 0 auto',
  },

  chevron: {
    flex: '0 0 auto',
    fontSize: 18,
    lineHeight: 1,
    color: 'rgba(255,255,255,0.6)',
    paddingTop: 2,
  },

  editorWrap: {
    marginTop: 14,
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: 48,
    padding: '0 14px',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.94)',
    fontFamily: THEME.font,
    fontSize: 14,
    outline: 'none',
  },

  selectInput: {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: 48,
    padding: '0 14px',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.94)',
    fontFamily: THEME.font,
    fontSize: 14,
    outline: 'none',
  },

  help: {
    marginTop: 8,
    fontFamily: THEME.font,
    fontSize: 12.5,
    lineHeight: 1.45,
    color: 'rgba(255,255,255,0.6)',
  },

  btnRow: {
    display: 'flex',
    gap: 10,
    marginTop: 14,
    flexWrap: 'wrap',
  },

  btnGhost: {
    minHeight: 42,
    padding: '0 14px',
    borderRadius: '12px 0 12px 0',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.94)',
    fontFamily: THEME.font,
    fontSize: 13.5,
    fontWeight: 700,
    cursor: 'pointer',
  },

  btnPrimary: {
    minHeight: 42,
    padding: '0 14px',
    borderRadius: '12px 0 12px 0',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.92)',
    fontFamily: THEME.font,
    fontSize: 13.5,
    fontWeight: 700,
    cursor: 'pointer',
  },
};