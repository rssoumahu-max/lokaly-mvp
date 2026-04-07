import { VIBES } from '../constants/vibes';

export const getVibeColor = (vibeKey) => {
  const key = String(vibeKey || '')
    .toLowerCase()
    .trim();

  const vibe = VIBES.find((v) => {
    const slug = String(v.slug || '').toLowerCase();
    const n0 = String(v.name || '').toLowerCase();
    const n1 = String(v.name_nl || '').toLowerCase();
    const n2 = String(v.name_en || '').toLowerCase();
    return slug === key || n0 === key || n1 === key || n2 === key;
  });

  if (!vibe) return '#9ca3af';
  const match = String(vibe.color || '').match(
    /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/
  );
  return match ? match[0] : '#06b6d4';
};
