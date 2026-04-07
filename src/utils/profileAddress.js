export function formatProfileAddress(profile) {
  const a1 = (profile?.address_line1 || '').trim();
  const hn = (profile?.house_number || '').trim();
  const pc = (profile?.postal_code || '').trim();
  const c = (profile?.city || '').trim();

  const line1 = [a1, hn].filter(Boolean).join(' ').trim();
  const line2 = [pc, c].filter(Boolean).join(' ').trim();

  if (!line1 && !line2) return '—';
  return [line1, line2].filter(Boolean).join(', ');
}