export function getPrevIndex(currentIndex, total) {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return (currentIndex - 1 + total) % total;
}

export function getNextIndex(currentIndex, total) {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return (currentIndex + 1) % total;
}