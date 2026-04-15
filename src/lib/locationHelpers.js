// ===================== IMAGE TRANSFORM HELPER =====================
const SUPABASE_STORAGE = 'supabase.co/storage/v1/object/public/';
const SUPABASE_RENDER  = 'supabase.co/storage/v1/render/image/public/';

export function supabaseImgUrl(url, width, quality = 80) {
  if (!url || !url.includes(SUPABASE_STORAGE)) return url || null;
  return url.replace(SUPABASE_STORAGE, SUPABASE_RENDER)
    + `?width=${width}&quality=${quality}`;
}

// ===================== PRICE HELPERS (GLOBAL) =====================
const formatEuro = (v) => `€${Math.round(Number(v))}`;

export const getPriceLabel = (loc) => {
  if (!loc) return null;

  if (loc.isFree) return 'Gratis';

  const min = loc.priceMin;
  const max = loc.priceMax;

  const hasMin =
    min !== null &&
    min !== undefined &&
    min !== '' &&
    Number.isFinite(Number(min));
  const hasMax =
    max !== null &&
    max !== undefined &&
    max !== '' &&
    Number.isFinite(Number(max));

  if (hasMin && hasMax) return `${formatEuro(min)} – ${formatEuro(max)}`;
  if (hasMin) return `Vanaf ${formatEuro(min)}`;
  if (hasMax) return `Tot ${formatEuro(max)}`;

  return null;
};

export function computeDisplayRating(row) {
  const toNum = (v) => {
    if (v === null || v === undefined) return null;
    const n =
      typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  // 1) baseline: wat jij als admin invult (of legacy `rating`)
  const baselineCandidate = row?.baseline_rating ?? row?.rating;
  const baselineRating = toNum(baselineCandidate);

  // 2) weights + user aggregates
  const useBaseline = row?.use_baseline !== false; // default: true
  const baselineWeight = toNum(row?.baseline_weight) ?? 10;

  const userSum = toNum(row?.user_rating_sum) ?? 0;
  const userCount = toNum(row?.user_rating_count) ?? 0;

  // Alleen Lokaly reviews (als je baseline later uitzet)
  if (!useBaseline) {
    if (userCount <= 0) return null;
    return userSum / userCount;
  }

  const hasBaseline = baselineRating !== null;
  const baseW = hasBaseline && baselineWeight > 0 ? baselineWeight : 0;

  const denom = baseW + userCount;
  if (denom <= 0) return null;

  const baseSum = hasBaseline ? baselineRating * baseW : 0;
  return (baseSum + userSum) / denom;
}