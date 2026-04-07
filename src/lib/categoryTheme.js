export const CATEGORY_THEME_FALLBACK = {
  museum: { bg: '#F97316', title: '#FFF7ED' },
  expo: { bg: '#A855F7', title: '#F5F3FF' },
  galerie: { bg: '#14B8A6', title: '#F0FDFA' },
  theater: { bg: '#EC4899', title: '#FFF1F2' },
  bioscoop: { bg: '#0B0B0C', title: '#FFFFFF' },
  filmhuis: { bg: '#A78BFA', title: '#4C1D95' },
  'live-muziek': { bg: '#EF4444', title: '#FFF1F2' },
  comedy: { bg: '#F59E0B', title: '#FFFBEB' },
  'escape-room': { bg: '#5B1020', title: '#F9A8D4' },
  arcade: { bg: '#F472B6', title: '#FFF7ED' },
  'vr-experience': { bg: '#FDE047', title: '#0F766E' },
  karaoke: { bg: '#22D3EE', title: '#083344' },
  workshop: { bg: '#38BDF8', title: '#0C4A6E' },
  restaurant: { bg: '#FB7185', title: '#FFF1F2' },
  cafe: { bg: '#34D399', title: '#064E3B' },
  cocktailbar: { bg: '#F97316', title: '#FFF7ED' },
  'rooftop-bar': { bg: '#3B82F6', title: '#EFF6FF' },
  club: { bg: '#8B5CF6', title: '#F5F3FF' },
  park: { bg: '#A3E635', title: '#14532D' },
  markt: { bg: '#EAB308', title: '#422006' },
  rondvaart: { bg: '#06B6D4', title: '#083344' },
  stadswandeling: { bg: '#10B981', title: '#052E16' },
  wellness: { bg: '#F9A8D4', title: '#4A044E' },
  boulderen: { bg: '#F97316', title: '#431407' },
  sportactiviteit: { bg: '#22C55E', title: '#052E16' },
  outdoor: { bg: '#16A34A', title: '#F0FDF4' },
  kids: { bg: '#60A5FA', title: '#172554' },
  groepsactiviteit: { bg: '#2DD4BF', title: '#042F2E' },
  'hidden-gem': { bg: '#A78BFA', title: '#2E1065' },
};

export function getCategoryTheme(cat) {
  const slug = cat?.slug;
  const fallback = CATEGORY_THEME_FALLBACK[slug] || {
    bg: '#F97316',
    title: '#FFF7ED',
  };
  return {
    bg: cat?.bg_color || fallback.bg,
    title: cat?.title_color || fallback.title,
    cover: cat?.cover_url || '',
    badge: cat?.badge_text || '',
  };
}