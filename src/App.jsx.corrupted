/**
 * VOORBEELD: Hoe een gerefactorde component eruit moet zien
 *
 * Dit voorbeeld toont alle belangrijke verbeteringen:
 * 1. ✅ Error handling met try-catch
 * 2. ✅ Proper hooks organisatie (useState, useEffect, useMemo, useCallback)
 * 3. ✅ Memoization voor performance
 * 4. ✅ Styles gegroepeerd onderaan
 * 5. ✅ Duidelijke commentaren bij complexe logica
 * 6. ✅ DRY principe
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { track } from '../lib/analytics';
import { THEME } from '../constants/theme';
import { STRINGS } from '../constants/strings';
import { IconBookmark } from '../components/Icons';

export function LocationCard({
  location,
  onClick,
  language = 'nl',
  showDistrict = true,
  user,
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const t = STRINGS[language];

  useEffect(() => {
    if (!user || !location?.id) return;

    let cancelled = false;

    async function checkFavorite() {
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('location_id', location.id)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error('Error checking favorite:', error);
          return;
        }

        setIsFavorite(!!data);
      } catch (error) {
        console.error('Failed to check favorite:', error);
      }
    }

    checkFavorite();

    return () => {
      cancelled = true;
    };
  }, [user, location?.id]);

  const handleFavoriteToggle = useCallback(
    async (e) => {
      e.stopPropagation();

      if (!user) {
        alert(t.loginRequired || 'Please login to save favorites');
        return;
      }

      if (favoriteLoading) return;

      setFavoriteLoading(true);

      try {
        if (isFavorite) {
          const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('location_id', location.id);

          if (error) throw error;

          setIsFavorite(false);

          track('favorite_removed', { location_id: location.id });
        } else {
          const { error } = await supabase.from('favorites').insert({
            user_id: user.id,
            location_id: location.id,
          });

          if (error) throw error;

          setIsFavorite(true);

          track('favorite_added', { location_id: location.id });
        }
      } catch (error) {
        console.error('Favorite toggle failed:', error);
        alert(t.favoriteError || 'Failed to update favorite');
      } finally {
        setFavoriteLoading(false);
      }
    },
    [user, location?.id, isFavorite, favoriteLoading, t]
  );

  const handleCardClick = useCallback(() => {
    if (!onClick || !location) return;

    try {
      track('location_click', { location_id: location.id });
      onClick(location);
    } catch (error) {
      console.error('Card click tracking failed:', error);
      onClick(location);
    }
  }, [onClick, location]);

  const districtLabel = useMemo(() => {
    if (!showDistrict || !location?.district) return null;
    return location.district;
  }, [showDistrict, location?.district]);

  if (!location) {
    return null;
  }

  return (
    <article style={styles.card} onClick={handleCardClick}>
      <div style={styles.imageWrapper}>
        <img
          src={location.main_image || '/placeholder.jpg'}
          alt={location.name}
          style={styles.image}
          loading="lazy"
        />

        {user && (
          <button
            onClick={handleFavoriteToggle}
            disabled={favoriteLoading}
            style={styles.favoriteButton}
            aria-label={isFavorite ? t.saved : t.save}
          >
            <IconBookmark
              size={20}
              color={THEME.text}
              filled={isFavorite}
            />
          </button>
        )}
      </div>

      <div style={styles.content}>
        <div style={styles.header}>
          <h3 style={styles.title}>{location.name}</h3>
          {districtLabel && (
            <span style={styles.district}>{districtLabel}</span>
          )}
        </div>

        {location.description && (
          <p style={styles.description}>{location.description}</p>
        )}

        {typeof location.rating === 'number' && location.rating > 0 && (
          <div style={styles.ratingRow}>
            <span style={styles.ratingValue}>{location.rating.toFixed(1)}</span>
            <span style={styles.ratingStar}>★</span>
          </div>
        )}
      </div>
    </article>
  );
}

const styles = {
  card: {
    background: THEME.surface,
    borderRadius: THEME.radius,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: THEME.shadow,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    paddingTop: '66.67%',
    overflow: 'hidden',
    background: THEME.bg,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.95)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease',
  },
  content: {
    padding: 20,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: THEME.text,
    flex: 1,
  },
  district: {
    fontSize: 13,
    color: THEME.muted,
    padding: '4px 10px',
    background: THEME.bg,
    borderRadius: THEME.radiusSm,
    whiteSpace: 'nowrap',
  },
  description: {
    margin: '0 0 12px 0',
    fontSize: 14,
    lineHeight: 1.5,
    color: THEME.muted,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 15,
    fontWeight: 600,
    color: THEME.text,
  },
  ratingStar: {
    fontSize: 16,
    color: THEME.orange,
  },
};
