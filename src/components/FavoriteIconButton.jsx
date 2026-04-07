import React from 'react';
import { THEME } from '../constants/theme';
import { IconBookmark } from './icons';
import MediaIconButton from './MediaIconButton';

export default function FavoriteIconButton({
  active = false,
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
      <IconBookmark
        size={16}
        filled={active}
        color={active ? THEME.orange : 'rgba(255,255,255,0.92)'}
      />
    </MediaIconButton>
  );
}