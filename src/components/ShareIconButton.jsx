import React from 'react';
import { IconShare } from './icons';
import MediaIconButton from './MediaIconButton';

export default function ShareIconButton({
  buttonStyle,
  onClick,
  title,
  ariaLabel,
}) {
  return (
    <MediaIconButton
      buttonStyle={buttonStyle}
      onClick={onClick}
      title={title}
      ariaLabel={ariaLabel}
    >
      <IconShare size={16} color={'rgba(255,255,255,0.92)'} />
    </MediaIconButton>
  );
}