export function shareLocation(loc, language) {
  if (typeof window === 'undefined') return;

  const baseUrl = window.location.origin + window.location.pathname;
  const url = `${baseUrl}?p=detail&loc=${encodeURIComponent(loc.id)}`;

  if (navigator.share) {
    navigator
      .share({
        title: loc.name,
        text: loc.description,
        url,
      })
      .catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert(
          language === 'nl'
            ? 'Link gekopieerd naar je klembord!'
            : 'Link copied to your clipboard!'
        );
      })
      .catch(() => {
        alert(
          language === 'nl'
            ? 'Delen wordt niet ondersteund in deze browser.'
            : 'Sharing is not supported in this browser.'
        );
      });
  } else {
    alert(
      language === 'nl'
        ? 'Delen wordt niet ondersteund in deze browser.'
        : 'Sharing is not supported in this browser.'
    );
  }
}
