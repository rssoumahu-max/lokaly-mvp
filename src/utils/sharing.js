export function shareLocation(location, language) {
  if (typeof window === 'undefined' || !location) {
    return;
  }

  try {
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?p=home&loc=${encodeURIComponent(location.id)}`;

    if (navigator.share) {
      navigator
        .share({
          title: location.name,
          text: location.description,
          url,
        })
        .catch((err) => {
          console.warn('Share cancelled or failed:', err);
        });
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
        .catch((err) => {
          console.error('Clipboard write failed:', err);
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
  } catch (error) {
    console.error('Share location error:', error);
  }
}
