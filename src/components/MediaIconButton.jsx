import React from 'react';

export default function MediaIconButton({
  buttonStyle,
  onClick,
  title,
  ariaLabel,
  children,
}) {
  return (
    <button
      type="button"
      style={buttonStyle}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}