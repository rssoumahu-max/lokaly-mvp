import { THEME } from '../constants/theme';

export function IconSearch({ size = 18, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10.5 18.5a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
        stroke={color}
        strokeWidth="2"
      />
      <path
        d="M16.7 16.7 21 21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconMenu({ size = 18, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 7h16" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12h16" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M4 17h16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconUser({ size = 18, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 21a8 8 0 0 0-16 0"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconStar({ size = 16, color = THEME.muted, filled = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path
        d="M12 17.3l-5.7 3.2 1.2-6.3L3 9.9l6.4-.8L12 3.3l2.6 5.8 6.4.8-4.5 4.3 1.2 6.3L12 17.3z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarFill({ fill = 0, size = 14 }) {
  const clamped = Math.max(0, Math.min(1, Number(fill) || 0));

  return (
    <span
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-block',
      }}
    >
      <span style={{ position: 'absolute', inset: 0 }}>
        <IconStar size={size} filled={false} color={THEME.muted} />
      </span>

      <span
        style={{
          position: 'absolute',
          inset: 0,
          width: `${clamped * 100}%`,
          overflow: 'hidden',
        }}
      >
        <IconStar size={size} filled={true} color={THEME.orange} />
      </span>
    </span>
  );
}

export function RenderStars({ value = 0, size = 14, gap = 4 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = v - (n - 1);
        return <StarFill key={n} fill={fill} size={size} />;
      })}
    </div>
  );
}

export function IconBookmark({ size = 16, color = THEME.muted, filled = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path
        d="M7 4.5h10a1.5 1.5 0 0 1 1.5 1.5v15l-6.5-3.6L5.5 21V6A1.5 1.5 0 0 1 7 4.5z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconShare({ size = 16, color = THEME.muted }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path
        d="M16 8a3 3 0 1 0-2.83-4"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 12a3 3 0 1 0 0 6"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 16a3 3 0 1 0 0 6"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.7 13.2l2.6 1.6"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.3 9.2l-2.6 1.6"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconGrid({ size = 16, color = THEME.muted }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path
        d="M4.5 4.5h6.5v6.5H4.5V4.5zm8.0 0h7.0v6.5h-7.0V4.5zM4.5 12.5h6.5v7.0H4.5v-7.0zm8.0 0h7.0v7.0h-7.0v-7.0z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPin({ size = 16, color = THEME.muted }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 22s7-4.5 7-12a7 7 0 1 0-14 0c0 7.5 7 12 7 12Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
}

export function IconArrowUpRight({ size = 16, color = THEME.text }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 17 17 7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 7h7v7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
