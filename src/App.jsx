import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';

import { supabase } from './supabaseClient';
import { track } from './lib/analytics';
import { useIsMobile } from './hooks/useIsMobile';
import { shareLocation } from './lib/shareLocation';
import { getVibeColor } from './lib/getVibeColor';
import { VIBES } from './constants/vibes';
import { CATEGORIES } from './constants/categories';
import { THEME } from './constants/theme';
import { STRINGS } from './constants/strings';

// Helper functie om de juiste naam te kiezen op basis van taal
function getLocalizedName(nameValue, language) {
  if (!nameValue) return '';
  if (typeof nameValue === 'string') {
    // Als het een string is, zoek in CATEGORIES/VIBES constants
    const category = CATEGORIES.find(
      (c) =>
        c.name === nameValue ||
        c.name_nl === nameValue ||
        c.name_en === nameValue ||
        c.slug === nameValue
    );
    if (category) {
      return language === 'nl' ? category.name_nl : category.name_en;
    }

    const vibe = VIBES.find(
      (v) =>
        v.name === nameValue ||
        v.name_nl === nameValue ||
        v.name_en === nameValue ||
        v.slug === nameValue
    );
    if (vibe) {
      return language === 'nl' ? vibe.name_nl : vibe.name_en;
    }

    return nameValue; // fallback
  }
  return '';
}
import {
  IconSearch,
  IconMenu,
  IconUser,
  IconStar,
  StarFill,
  RenderStars,
  IconBookmark,
  IconShare,
  IconGrid,
  IconPin,
  IconArrowUpRight,
} from './components/icons';
import Footer from './components/Footer';
import Header from './components/Header';
import VibeRow from './components/VibeRow';
import CategoryResultRowCard from './components/CategoryResultRowCard';
import HeroCard from './components/HeroCard';
import HeroCarousel from './components/HeroCarousel';
import SkeletonRow from './components/SkeletonRow';
import {
  SkeletonBox,
  SkeletonCard,
  SkeletonGrid,
} from './components/SkeletonBits';
import Top10LocationCard from './components/Top10LocationCard';
import NormalLocationCardView from './components/NormalLocationCardView';
import { computeDisplayRating, getPriceLabel } from './lib/locationHelpers';
import LocationCard from './components/LocationCard';
import { CATEGORY_THEME_FALLBACK, getCategoryTheme } from './lib/categoryTheme';
import { getPrevIndex, getNextIndex } from './lib/lightboxIndex';
import { geocodeNlPostcodeHouse } from './utils/geocoding';
import LocationModalInfoTab from './components/LocationModalInfoTab';
import LocationModalPricesTab from './components/LocationModalPricesTab';
import LocationModalHoursTab from './components/LocationModalHoursTab';
import LocationModalMediaGallery from './components/LocationModalMediaGallery';
import LocationModalReviewsTab from './components/LocationModalReviewsTab';
import { formatProfileAddress } from './utils/profileAddress';
import AccountAddressSection from './components/AccountAddressSection';
import AccountBirthDateSection from './components/AccountBirthDateSection';
import AccountUsernameSection from './components/AccountUsernameSection';
import AccountFirstNameSection from './components/AccountFirstNameSection';
import AccountLastNameSection from './components/AccountLastNameSection';
import AccountGenderSection from './components/AccountGenderSection';
import AccountNationalitySection from './components/AccountNationalitySection';
import AccountEmailSection from './components/AccountEmailSection';
import AccountPasswordSection from './components/AccountPasswordSection';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

/* ===================== LOCATIONS ===================== */

const LOCATIONS = [
  {
    id: 1,
    type: 'museum',
    name: 'Rijksmuseum',
    district: 'Zuid',
    description:
      'Wereldberoemd museum met meesterwerken zoals De Nachtwacht. Perfect voor een cultureel dagje.',
    rating: 4.9,
    vibe: 'Cultureel',
    address: 'Museumplein 1, 1071 XX Amsterdam',
    website: 'https://www.rijksmuseum.nl/',
    mainImage:
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=1200',
    lat: 52.359998,
    lng: 4.885219,
  },
  {
    id: 2,
    type: 'museum',
    name: 'Van Gogh Museum',
    district: 'Zuid',
    description:
      'Iconisch museum met de grootste collectie Van Gogh-schilderijen ter wereld.',
    rating: 4.8,
    vibe: 'Cultureel',
    address: 'Museumplein 6, 1071 DJ Amsterdam',
    website: 'https://www.vangoghmuseum.nl/',
    mainImage:
      'https://images.unsplash.com/photo-1534448311378-1e193fb2570e?auto=format&fit=crop&q=80&w=1200',
    lat: 52.358416,
    lng: 4.881076,
  },
  {
    id: 3,
    type: 'escape',
    name: 'Sherlocked – The Vault',
    district: 'Centrum',
    description:
      'Cinematic escape room in de kluis van de Beurs van Berlage. Hoge moeilijkheidsgraad en sterk verhaal.',
    rating: 4.9,
    vibe: 'Adrenaline',
    address: 'Damrak 279, 1012 ZH Amsterdam',
    website: 'https://www.sherlocked.nl/',
    mainImage:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&q=80&w=1200',
    lat: 52.376505,
    lng: 4.897602,
  },
  {
    id: 4,
    type: 'park',
    name: 'Vondelpark',
    district: 'Zuid',
    description:
      'Het bekendste park van Amsterdam. Perfect voor picknicks, skaten en mensen kijken.',
    rating: 4.7,
    vibe: 'Chillen',
    address: 'Vondelpark, 1071 AB Amsterdam',
    website: 'https://www.iamsterdam.com/nl/zien-en-doen/vondelpark',
    mainImage:
      'https://images.unsplash.com/photo-1545243424-0ce743321e11?auto=format&fit=crop&q=80&w=1200',
    lat: 52.357997,
    lng: 4.868641,
  },
  {
    id: 5,
    type: 'park',
    name: 'Westerpark',
    district: 'West',
    description:
      'Creatief park met café’s, evenementen en het Westergasterrein. Lekker voor een wandeling of borrel.',
    rating: 4.6,
    vibe: 'Met Vrienden',
    address: 'Haarlemmervaart 24, 1013 ZW Amsterdam',
    website: 'https://www.westerpark.nl/',
    mainImage:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200',
    lat: 52.386,
    lng: 4.87,
  },
  {
    id: 6,
    type: 'vr',
    name: 'VR Arcade Amsterdam',
    district: 'Noord',
    description:
      'Next-level VR experience waar je met vrienden in een virtuele wereld stapt.',
    rating: 4.8,
    vibe: 'Gamers',
    address: 'Gedempt Hamerkanaal 99, 1021 KP Amsterdam',
    website: 'https://vrarcadeamsterdam.nl/',
    mainImage:
      'https://images.unsplash.com/photo-1521568974510-449d10e6f662?auto=format&fit=crop&q=80&w=1200',
    lat: 52.392,
    lng: 4.929,
  },
  {
    id: 7,
    type: 'arcade',
    name: 'TonTon Club',
    district: 'Centrum',
    description:
      'Arcadehall met retro games, airhockey en goede drankjes. Ideaal voor een speelse avond.',
    rating: 4.5,
    vibe: 'Met Vrienden',
    address: 'St. Pietersteeg 3, 1012 XA Amsterdam',
    website: 'https://tontonclub.nl/',
    mainImage:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200',
    lat: 52.374,
    lng: 4.898,
  },
  {
    id: 8,
    type: 'film',
    name: 'Eye Filmmuseum',
    district: 'Noord',
    description:
      'Filmhuis, museum en prachtig uitzicht over het IJ. Iconische architectuur.',
    rating: 4.7,
    vibe: 'Cultureel',
    address: 'IJpromenade 1, 1031 KT Amsterdam',
    website: 'https://www.eyefilm.nl/',
    mainImage:
      'https://images.unsplash.com/photo-1557008076-799d63c58253?auto=format&fit=crop&q=80&w=1200',
    lat: 52.381,
    lng: 4.9,
  },
  {
    id: 9,
    type: 'workshop',
    name: 'Ceramic Studio West',
    district: 'West',
    description:
      'Creatieve keramiekworkshops waar je je eigen servies maakt. Rustgevend en mindful.',
    rating: 4.6,
    vibe: 'Teambuilding',
    address: 'Kostverlorenvaart 2C, 1054 TA Amsterdam',
    website: 'https://www.ceramicstudiowest.nl/',
    mainImage:
      'https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&q=80&w=1200',
    lat: 52.369,
    lng: 4.861,
  },
  {
    id: 10,
    type: 'date',
    name: 'Skybar A’DAM',
    district: 'Noord',
    description:
      'Skybar met uitzicht over heel Amsterdam. Perfect voor een romantische avond.',
    rating: 4.8,
    vibe: 'Romantisch',
    address: 'Overhoeksplein 1, 1031 KS Amsterdam',
    website: 'https://adamlookout.com/skybar/',
    mainImage:
      'https://images.unsplash.com/photo-1521292270410-a8c53642e9d0?auto=format&fit=crop&q=80&w=1200',
    lat: 52.383,
    lng: 4.901,
  },
];

/* ===================== DESCRIPTION CLAMP ===================== */
function DescriptionClamp({ text, isMobile, expanded, onToggle, style, language }) {
  const pRef = useRef(null);
  const [isClamped, setIsClamped] = useState(false);
  const clampLines = isMobile ? 2 : 3;

  useEffect(() => {
    const el = pRef.current;
    if (!el) return;
    setIsClamped(el.scrollHeight > el.clientHeight + 1);
  }, [text, clampLines]);

  return (
    <div style={{ margin: '4px 0 0 0' }}>
      <p
        ref={pRef}
        style={{
          ...style,
          margin: 0,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: expanded ? 'unset' : clampLines,
        }}
      >
        {text}
      </p>
      {(isClamped || expanded) && (
        <button
          type="button"
          onClick={onToggle}
          style={{
            display: 'block',
            marginTop: 4,
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: style.fontFamily,
            fontSize: isMobile ? 13 : 13.5,
            fontWeight: 400,
            color: 'rgba(225,230,240,0.46)',
            textDecoration: 'underline',
            textDecorationColor: 'rgba(225,230,240,0.22)',
            textUnderlineOffset: '2px',
            lineHeight: 1.5,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(225,230,240,0.72)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(225,230,240,0.46)'; }}
        >
          {expanded
            ? (language === 'nl' ? 'Minder tonen' : 'Show less')
            : (language === 'nl' ? 'Meer lezen' : 'Read more')}
        </button>
      )}
    </div>
  );
}

/* ===================== MODAL ===================== */
function LocationModal({
  location,
  onClose,
  language,
  user,
  onRefreshLocations, // ✅ dit is de refresh callback
  isFavorite,
  onToggleFavorite,
  asPage,
  allLocations,
  embed = false,
  hideNav = false,
  previewMediaItems = null,
  onOpenReviews,
}) {
  // --- Detail mini map (interactive) ---
  const detailMiniMapRef = useRef(null);
  const detailMiniMapInstanceRef = useRef(null);
  const detailMiniMarkerRef = useRef(null);
  const [detailMiniMapReady, setDetailMiniMapReady] = useState(false);

  // exact dezelfde marker-stijl als Map Page (active / “geklikt”)
  const makeDetailMapIcon = (active = false) => ({
    path: window.google.maps.SymbolPath.CIRCLE,
    fillColor: active ? '#0B0B0C' : THEME.orange,
    fillOpacity: 1,
    strokeColor: active ? THEME.orange : '#ffffff',
    strokeOpacity: 1,
    strokeWeight: active ? 3 : 2,
    scale: active ? 9 : 7,
  });

  const isMobile = useIsMobile();
  const t = STRINGS[language];
  const priceLabel = getPriceLabel(location);
  // ✅ Adres + lange beschrijving (fallbacks)
  const fullAddress =
    location?.address ||
    location?.address_line ||
    location?.addressLine ||
    location?.street_address ||
    '';

  const longDesc =
    location?.description_long || // ✅ jouw Supabase veld
    location?.descriptionLong ||
    location?.longDescription ||
    location?.long_description ||
    location?.about ||
    location?.details ||
    location?.about_long ||
    location?.long_text ||
    location?.longText ||
    '';

  // ✅ Google Maps link (adres)
  const mapsHref = fullAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        fullAddress
      )}`
    : '';

  // ✅ rating voor detail (zelfde helper als cards)
  const detailDisplayRating = computeDisplayRating(location);

  const detailStarsRow = {
    marginTop: 10,
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
    opacity: 1,
  };

  // ✅ labels die we onder de sterren gaan tonen
  const districtLabel =
    location?.districtName ||
    location?.district_name ||
    location?.district ||
    location?.neighborhood ||
    '';

  const categoryLabels =
    Array.isArray(location?.categoryNames) && location.categoryNames.length
      ? location.categoryNames
          .filter(Boolean)
          .map((name) => getLocalizedName(name, language))
      : Array.isArray(location?.category_names) &&
        location.category_names.length
      ? location.category_names
          .filter(Boolean)
          .map((name) => getLocalizedName(name, language))
      : [
          location?.categoryName ||
            location?.category_name ||
            location?.category ||
            location?.type ||
            '',
        ]
          .filter(Boolean)
          .map((name) => getLocalizedName(name, language));

  const vibeLabels =
    Array.isArray(location?.vibeNames) && location.vibeNames.length
      ? location.vibeNames
          .filter(Boolean)
          .map((name) => getLocalizedName(name, language))
      : Array.isArray(location?.vibe_names) && location.vibe_names.length
      ? location.vibe_names
          .filter(Boolean)
          .map((name) => getLocalizedName(name, language))
      : [location?.vibeName || location?.vibe_name || location?.vibe || '']
          .filter(Boolean)
          .map((name) => getLocalizedName(name, language));

  const detailMetaRow = {
    marginTop: 8,
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  };

  // ✅ korte beschrijving (zelfde fallback als hero cards)
  const detailDesc =
    location?.shortDescription ||
    location?.short_description ||
    location?.subtitle ||
    location?.tagline ||
    location?.description ||
    '';

  const detailDescStyle = {
    margin: '4px 0 0 0',
    fontFamily: THEME.font,
    fontSize: isMobile ? 14 : 15,
    fontWeight: 400,
    lineHeight: 1.5,
    color: 'rgba(225,230,240,0.78)',
    maxWidth: isMobile ? 760 : '100%',
  };

  const detailMetaPill = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 11px',
    borderRadius: '10px 0 10px 0',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(225,230,240,0.76)',
    fontFamily: THEME.font,
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: 0.15,
    whiteSpace: 'nowrap',
  };

  const eventTitleStyle = {
    margin: '24px 0 8px 0',
    fontFamily: THEME.fontDisplay,
    fontSize: isMobile ? 28 : 38,
    fontWeight: 600,
    letterSpacing: -0.4,
    lineHeight: 1.08,
    color: 'rgba(245,245,250,0.96)',
    textShadow: '0 2px 8px rgba(0,0,0,0.15)',
  };

  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  // ✅ Tabs onder de media
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'prices' | 'hours' | 'reviews'

  React.useEffect(() => {
    // Default: info
    let nextTab = 'info';

    // Als we vanuit profiel komen met "jump naar review"
    const raw = sessionStorage.getItem('lokalyReviewJump');
    if (raw) {
      try {
        const j = JSON.parse(raw);
        if (String(j.locationId) === String(location?.id)) {
          nextTab = 'reviews';
        }
      } catch (e) {
        // ignore
      }
    }

    setActiveTab(nextTab);
  }, [location?.id]);

  useEffect(() => {
    // reset als je een andere locatie opent
    setActiveIndex(0);
  }, [location?.id]);

  const [highlightReviewId, setHighlightReviewId] = React.useState(null);

  React.useEffect(() => {
    // Alleen uitvoeren als we op deze locatie zitten én de reviews-tab open staat
    if (activeTab !== 'reviews') return;

    const raw = sessionStorage.getItem('lokalyReviewJump');
    if (!raw) return;

    let j;
    try {
      j = JSON.parse(raw);
    } catch {
      return;
    }

    if (String(j.locationId) !== String(location?.id)) return;
    if (!j.reviewId) return;

    // Retry loop: Reviews worden async geladen, dus element kan iets later pas bestaan
    let tries = 0;
    const maxTries = 20;

    const tick = () => {
      tries += 1;

      const el = document.getElementById(`review-${j.reviewId}`);
      if (el) {
        setHighlightReviewId(j.reviewId);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        sessionStorage.removeItem('lokalyReviewJump');
        setTimeout(() => setHighlightReviewId(null), 2500);
        return;
      }

      if (tries < maxTries) {
        setTimeout(tick, 120);
      }
    };

    // kleine delay zodat de tab/render alvast gestart is
    setTimeout(tick, 200);
  }, [location?.id, activeTab]);

  // ✅ nieuw
  const [myExistingReview, setMyExistingReview] = useState(null); // { id, rating, comment, created_at, updated_at }
  const [reviewEditMode, setReviewEditMode] = useState(false);
  const [loadingMyReview, setLoadingMyReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);
  // ✅ DELETE: mijn review verwijderen (MOET in LocationModal staan)
  async function deleteMyReview() {
    setReviewMsg('');

    if (!user?.id || !myExistingReview?.id) return;

    const ok = window.confirm(
      language === 'nl'
        ? 'Weet je zeker dat je je review wilt verwijderen?'
        : 'Are you sure you want to delete your review?'
    );
    if (!ok) return;

    setDeletingReview(true);

    try {
      const { error } = await supabase
        .from('location_reviews')
        .delete()
        .eq('id', myExistingReview.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // UI reset (jouw states bestaan al in LocationModal)
      const deletedId = myExistingReview.id;

      setMyExistingReview(null);
      setMyRating(0);
      setMyComment('');
      setReviewEditMode(false);

      // lijst ook meteen updaten zodat je het direct ziet
      setReviews((prev) =>
        Array.isArray(prev) ? prev.filter((r) => r.id !== deletedId) : prev
      );

      // eventueel je locatie aggregates opnieuw laden
      if (typeof onRefreshLocations === 'function') {
        await onRefreshLocations();
      }

      setReviewMsg(
        language === 'nl' ? 'Review verwijderd.' : 'Review deleted.'
      );
    } catch (e) {
      console.warn(e);
      setReviewMsg(
        language === 'nl' ? 'Verwijderen mislukt.' : 'Failed to delete.'
      );
    } finally {
      setDeletingReview(false);
    }
  }
  // ✅ SAVE/UPDATE: mijn review opslaan (MOET in LocationModal staan)
  async function submitMyReview() {
    setReviewMsg('');

    const userId = user?.id;
    const locId = location?.id; // ✅ LocationModal gebruikt location prop

    if (!userId) {
      setReviewMsg(
        language === 'nl'
          ? 'Log in om te kunnen reviewen.'
          : 'Log in to review.'
      );
      return;
    }
    if (!locId) return;

    // Als je al een review hebt: eerst op "Bewerk" klikken
    if (myExistingReview && !reviewEditMode) {
      setReviewMsg(
        language === 'nl'
          ? 'Klik op ‘Bewerk’ om je review aan te passen.'
          : 'Click ‘Edit’ to change your review.'
      );
      return;
    }

    if (myRating < 1 || myRating > 5) {
      setReviewMsg(
        language === 'nl'
          ? 'Kies een rating van 1 t/m 5.'
          : 'Pick a rating from 1 to 5.'
      );
      return;
    }

    setSavingReview(true);

    try {
      const payload = {
        location_id: locId,
        user_id: userId,
        rating: myRating,
        comment: myComment?.trim() || null,
      };

      const { data, error } = await supabase
        .from('location_reviews')
        .upsert(payload, { onConflict: 'location_id,user_id' })
        .select('id, user_id, rating, comment, created_at, updated_at')
        .single();

      if (error) throw error;

      const savedReview = {
        ...(data || payload),
        user_id: userId,
        profile: {
          id: userId,
          username: user?.user_metadata?.username || null,
          first_name: user?.user_metadata?.first_name || null,
          last_name: user?.user_metadata?.last_name || null,
          avatar_url: user?.user_metadata?.avatar_url || null,
        },
      };

      setMyExistingReview(savedReview);
      setReviewEditMode(false);

      // reviewlijst direct lokaal verversen
      setReviews((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        const withoutMine = list.filter(
          (r) => String(r.user_id) !== String(userId)
        );
        return [savedReview, ...withoutMine];
      });

      setReviewMsg(language === 'nl' ? 'Review opgeslagen!' : 'Review saved!');

      // optioneel: refresh aggregates op locatiekaart
      if (typeof onRefreshLocations === 'function') {
        await onRefreshLocations();
      }
    } catch (e) {
      console.warn(e);
      setReviewMsg(language === 'nl' ? 'Opslaan mislukt.' : 'Failed to save.');
    } finally {
      setSavingReview(false);
    }
  }
  // ✅ Reviews lijst (voor de Reviews-tab)
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadReviews = React.useCallback(async () => {
    const locId = location?.id;

    if (!locId) {
      setReviews([]);
      setLoading(false);
      setErrorMsg('');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase
        .from('location_reviews')
        .select('id, user_id, rating, comment, created_at, updated_at')
        .eq('location_id', locId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = Array.isArray(data) ? data : [];
      const userIds = Array.from(
        new Set(rows.map((r) => r.user_id).filter(Boolean))
      );

      let profilesMap = {};
      if (userIds.length) {
        const { data: profiles, error: pErr } = await supabase
          .from('public_profiles')
          .select('id, username, first_name, last_name, avatar_url')
          .in('id', userIds);

        if (!pErr && Array.isArray(profiles)) {
          profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
        }
      }

      const mapped = rows.map((r) => ({
        ...r,
        profile: profilesMap[r.user_id] || null,
      }));

      setReviews(mapped);
    } catch (e) {
      console.warn(e);
      setReviews([]);
      setErrorMsg(e?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [location?.id]);

  // ✅ Rating stats (voor Trustpilot-overzicht in Review tab)
  const ratingStats = React.useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    let n = 0;

    for (const r of reviews || []) {
      const v = Math.max(1, Math.min(5, Number(r?.rating) || 0));
      if (!v) continue;
      counts[v] += 1;
      sum += v;
      n += 1;
    }

    const avg = n ? sum / n : 0;
    const maxCount = Math.max(1, ...Object.values(counts));

    return { counts, avg, total: n, maxCount };
  }, [reviews]);

  // ✅ laad bestaande review van deze user voor deze locatie
  React.useEffect(() => {
    let cancelled = false;

    async function loadMyReview() {
      const locId = location?.id;
      const userId = user?.id;

      // reset als niet ingelogd of geen locatie
      if (!locId || !userId) {
        setMyExistingReview(null);
        setMyRating(0);
        setMyComment('');
        setReviewEditMode(false);
        setLoadingMyReview(false);
        return;
      }

      setLoadingMyReview(true);
      setReviewMsg('');

      try {
        const { data, error } = await supabase
          .from('location_reviews')
          .select('id, rating, comment, created_at, updated_at')
          .eq('location_id', locId)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        const row = Array.isArray(data) && data.length ? data[0] : null;

        if (cancelled) return;

        if (row) {
          setMyExistingReview(row);
          setMyRating(row.rating || 0);
          setMyComment(row.comment || '');
          setReviewEditMode(false); // ✅ lock default
        } else {
          setMyExistingReview(null);
          setMyRating(0);
          setMyComment('');
          setReviewEditMode(false); // ✅ nieuw: eerst knop "Schrijf review" tonen
        }
      } catch (e) {
        console.warn(e);
        if (!cancelled) {
          setMyExistingReview(null);
          setReviewEditMode(true);
        }
      } finally {
        if (!cancelled) setLoadingMyReview(false);
      }
    }

    loadMyReview();
    return () => {
      cancelled = true;
    };
  }, [location?.id, user?.id]);

  // ✅ laad alle reviews (voor dit event)
  React.useEffect(() => {
    if (activeTab !== 'reviews') return;
    loadReviews();
  }, [activeTab, loadReviews]);
  const openingV2 = location?.opening_hours_v2 ?? null;

  const openingLines = React.useMemo(() => {
    // 1) Prefer V2 (structured)
    if (openingV2 && typeof openingV2 === 'object') {
      const days = [
        { key: 'mon', nl: 'Ma', en: 'Mon' },
        { key: 'tue', nl: 'Di', en: 'Tue' },
        { key: 'wed', nl: 'Wo', en: 'Wed' },
        { key: 'thu', nl: 'Do', en: 'Thu' },
        { key: 'fri', nl: 'Vr', en: 'Fri' },
        { key: 'sat', nl: 'Za', en: 'Sat' },
        { key: 'sun', nl: 'Zo', en: 'Sun' },
      ];

      return days
        .map((d) => {
          const v = openingV2[d.key];
          const label = language === 'nl' ? d.nl : d.en;

          if (!v) return null; // leeg
          if (v.status === 'closed')
            return `${label}: ${language === 'nl' ? 'Gesloten' : 'Closed'}`;
          if (v.status === 'open' && v.open && v.close)
            return `${label}: ${v.open} – ${v.close}`;

          return null;
        })
        .filter(Boolean);
    }

    // 2) Fallback: old text field
    const openingRaw =
      location?.opening_hours ??
      location?.openingHours ??
      location?.opening_times ??
      location?.openingTimes ??
      '';

    if (!openingRaw || typeof openingRaw !== 'string') return [];
    return openingRaw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [openingV2, language, location]);

  const safeAll = Array.isArray(allLocations) ? allLocations : [];

  const numericLat = Number(location?.lat);
  const numericLng = Number(location?.lng);

  const hasLatLng = Number.isFinite(numericLat) && Number.isFinite(numericLng);

  const mapsQuery = hasLatLng
    ? `${numericLat},${numericLng}`
    : location?.address || location?.name || '';

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    mapsQuery
  )}`;

  const websiteUrl = (() => {
    const raw = (location?.website || '').trim();
    if (!raw) return '';
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  })();

  const embedQuery = hasLatLng
    ? `${numericLat},${numericLng}`
    : location?.address || location?.name || 'Amsterdam';
  // Mini-map zoom (voor inzoomen/uitzoomen in de detailpagina)
  const [miniMapZoom, setMiniMapZoom] = useState(14);

  React.useEffect(() => {
    // Als je NIET op de info-tab zit, reset dan de oude map refs.
    // De map-container wordt namelijk unmounted zodra je van tab wisselt.
    if (activeTab !== 'info') {
      detailMiniMarkerRef.current = null;
      detailMiniMapInstanceRef.current = null;
      setDetailMiniMapReady(false);
      return;
    }

    if (!detailMiniMapRef.current) return;
    if (!Number.isFinite(numericLat) || !Number.isFinite(numericLng)) return;

    let cancelled = false;

    const initDetailMiniMap = () => {
      if (
        cancelled ||
        !window.google ||
        !window.google.maps ||
        !detailMiniMapRef.current
      ) {
        return;
      }

      const center = {
        lat: numericLat,
        lng: numericLng,
      };

      // Altijd opnieuw opbouwen op de CURRENT DOM node
      detailMiniMapInstanceRef.current = new window.google.maps.Map(
        detailMiniMapRef.current,
        {
          center,
          zoom: miniMapZoom,
          disableDefaultUI: true,
          clickableIcons: false,
          keyboardShortcuts: false,
          gestureHandling: 'greedy',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          backgroundColor: '#0b0b0c',
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1b1b1d' }] },
            {
              elementType: 'labels.text.fill',
              stylers: [{ color: '#cbd5e1' }],
            },
            {
              elementType: 'labels.text.stroke',
              stylers: [{ color: '#0b0b0c' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#2a2a2d' }],
            },
            {
              featureType: 'poi',
              elementType: 'geometry',
              stylers: [{ color: '#232326' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#111827' }],
            },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          ],
        }
      );

      detailMiniMarkerRef.current = new window.google.maps.Marker({
        position: center,
        map: detailMiniMapInstanceRef.current,
        icon: makeDetailMapIcon(false),
        title: location?.name || '',
      });

      setDetailMiniMapReady(true);

      // extra trigger zodat Google Maps zich netjes hertekent
      window.requestAnimationFrame(() => {
        if (!detailMiniMapInstanceRef.current) return;
        window.google.maps.event.trigger(
          detailMiniMapInstanceRef.current,
          'resize'
        );
        detailMiniMapInstanceRef.current.setCenter(center);
      });
    };

    if (window.google && window.google.maps) {
      initDetailMiniMap();
      return () => {
        cancelled = true;
      };
    }

    const existingScript = document.querySelector(
      'script[data-lokaly-google-maps="true"]'
    );

    const handleLoad = () => {
      initDetailMiniMap();
    };

    if (existingScript) {
      existingScript.addEventListener('load', handleLoad);
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.dataset.lokalyGoogleMaps = 'true';
      script.addEventListener('load', handleLoad);
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      const s = document.querySelector(
        'script[data-lokaly-google-maps="true"]'
      );
      s?.removeEventListener?.('load', handleLoad);
    };
  }, [
    activeTab,
    location?.id,
    location?.name,
    numericLat,
    numericLng,
    miniMapZoom,
  ]);

  const miniMapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    embedQuery
  )}&z=${miniMapZoom}&output=embed`;

  // Optioneel: Static map image (sneller/strakker), alleen als je key echt ingevuld is
  const keyLooksValid =
    GOOGLE_MAPS_API_KEY &&
    !['API_KEY_HERE', 'YOUR_API_KEY_HERE', 'API_KEY HERE'].includes(
      GOOGLE_MAPS_API_KEY
    );

  const staticMapUrl = keyLooksValid
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
        embedQuery
      )}&zoom=${miniMapZoom}&size=800x260&scale=2&maptype=roadmap&markers=color:orange%7C${encodeURIComponent(
        embedQuery
      )}&key=${GOOGLE_MAPS_API_KEY}`
    : null;

  // 🔹 MEDIA STATE
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState(null);

  // 🔍 LIGHTBOX (fullscreen media)
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const openLightbox = () => setLightboxOpen(true);
  const closeLightbox = () => setLightboxOpen(false);

  const goPrev = () => {
    if (!mediaItems?.length) return;
    setActiveIndex((i) => getPrevIndex(i, mediaItems.length));
  };

  const goNext = () => {
    if (!mediaItems?.length) return;
    setActiveIndex((i) => getNextIndex(i, mediaItems.length));
  };
  // ✅ SWIPE/DRAG support (mobiel + desktop) zonder eerst te klikken
  const pointerStartRef = useRef(null);
  const pointerMovedRef = useRef(false);
  const swipeHandledRef = useRef(false); // prevents double-fire between pointer and touch handlers

  const handlePointerDown = (e) => {
    if (!mediaItems || mediaItems.length < 2) return;
    if (e.pointerType === 'touch') return; // touch events handled by handleSwipeStart/End
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    swipeHandledRef.current = false;
    pointerMovedRef.current = false;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };

    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e) => {
    if (e.pointerType === 'touch') return;
    const start = pointerStartRef.current;
    if (!start) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;

    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      pointerMovedRef.current = true;
    }
  };

  const handlePointerUp = (e) => {
    if (e.pointerType === 'touch') return; // touch events handled by handleSwipeEnd
    if (!mediaItems || mediaItems.length < 2) return;

    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (!pointerMovedRef.current && absX < 8 && absY < 8) {
      openLightbox();
      return;
    }

    if (absX < 45) return;
    if (absX < absY * 1.5) return;

    pointerMovedRef.current = true;

    if (dx < 0) goNext();
    else goPrev();
  };

  const handlePointerCancel = (e) => {
    if (e.pointerType === 'touch') return;
    pointerStartRef.current = null;
  };

  // ✅ Touch swipe support (mobiel) — stabiel (start + move + end)
  const touchStartRef = useRef(null);
  const touchLockRef = useRef(null); // 'h' = horizontal locked, 'v' = vertical

  const resetTouchState = () => {
    touchStartRef.current = null;
    touchLockRef.current = null;
    swipeHandledRef.current = false;
  };

  const handleSwipeStart = (e) => {
    // always reset so a cancelled previous gesture never poisons the next one
    resetTouchState();

    if (!mediaItems || mediaItems.length < 2) return;

    const t = e.touches?.[0];
    if (!t) return;

    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleSwipeMove = (e) => {
    if (!mediaItems || mediaItems.length < 2) return;

    const start = touchStartRef.current;
    const t = e.touches?.[0];
    if (!start || !t) return;

    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;

    if (!touchLockRef.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      touchLockRef.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
    }
  };

  const handleSwipeEnd = (e) => {
    if (swipeHandledRef.current) return; // guard against double-fire within one gesture
    if (!mediaItems || mediaItems.length < 2) {
      resetTouchState();
      return;
    }

    const start = touchStartRef.current;
    const lock = touchLockRef.current;

    // clear before any early returns so state is clean for the next gesture
    touchStartRef.current = null;
    touchLockRef.current = null;

    const t = e.changedTouches?.[0];
    if (!start || !t) return;

    if (lock === 'v') return; // vertical scroll intent — ignore

    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < 40) return;
    if (absX < absY * 1.5) return;

    swipeHandledRef.current = true;
    pointerMovedRef.current = true;

    // clamp: max one step in either direction
    if (dx < 0) goNext();
    else goPrev();
  };

  const handleSwipeCancel = () => {
    resetTouchState();
  };

  // ✅ Trackpad / wheel swipe (desktop) — zodat je NIET hoeft te klikken
  const wheelLockRef = useRef(0);

  const handleWheelSwipe = (e) => {
    if (!mediaItems || mediaItems.length < 2) return;

    const absX = Math.abs(e.deltaX);
    const absY = Math.abs(e.deltaY);

    // Alleen horizontale trackpad veeg
    if (absX < 22) return;
    if (absX < absY * 1.15) return;

    // throttle: voorkomt 3-6 snelle triggers per swipe
    const now = Date.now();
    if (now - wheelLockRef.current < 320) return;
    wheelLockRef.current = now;

    // voorkom dat de pagina horizontaal 'meeschuift'
    e.preventDefault?.();

    // click-guard (zodat je niet per ongeluk lightbox opent)
    pointerMovedRef.current = true;

    if (e.deltaX > 0) goNext();
    else goPrev();
  };

  function prioritizeThumbnailFirst(items, location) {
    const thumbUrl =
      location?.image_url ||
      location?.imageUrl ||
      location?.mainImage ||
      location?.thumbnail_url ||
      location?.thumbnailUrl;

    const arr = Array.isArray(items) ? [...items] : [];
    if (!thumbUrl) return arr;

    // Bestaat de thumbnail al in de mediaItems? -> zet die vooraan
    const idx = arr.findIndex(
      (m) => m?.url === thumbUrl || m?.thumbnail_url === thumbUrl
    );
    if (idx >= 0) {
      const [thumbItem] = arr.splice(idx, 1);
      return [thumbItem, ...arr];
    }

    // Als thumbnail niet in location_media zit: voeg hem als “synthetic” item toe
    return [
      {
        id: `thumb-${location?.id || 'local'}`,
        url: thumbUrl,
        thumbnail_url: thumbUrl,
        caption: location?.name || 'Thumbnail',
        media_type: 'image',
        order_index: -1,
      },
      ...arr,
    ];
  }

  // 🔹 MEDIA LADEN UIT SUPABASE
  useEffect(() => {
    let cancelled = false;

    // ✅ Admin preview: gebruik de media die we meegeven (geen Supabase fetch)
    if (Array.isArray(previewMediaItems)) {
      setMediaItems(prioritizeThumbnailFirst(previewMediaItems, location));
      setActiveIndex(0);
      setMediaLoading(false);
      setMediaError(null);
      return;
    }

    if (!location || !location.id) {
      setMediaItems([]);
      setActiveIndex(0);
      return;
    }

    async function loadMedia() {
      try {
        setMediaLoading(true);
        setMediaError(null);

        const { data, error } = await supabase
          .from('location_media')
          .select('*')
          .eq('location_id', location.id)
          .order('order_index', { ascending: true });

        if (error) throw error;

        if (!cancelled) {
          const ordered = prioritizeThumbnailFirst(data || [], location);
          setMediaItems(ordered);
          setActiveIndex(0);
        }
      } catch (e) {
        if (!cancelled) setMediaError(e?.message || 'Media laden mislukt.');
      } finally {
        if (!cancelled) setMediaLoading(false);
      }
    }

    loadMedia();

    return () => {
      cancelled = true;
    };
  }, [
    location?.id,
    location?.image_url,
    location?.mainImage,
    previewMediaItems,
  ]);

  // 🔍 LIGHTBOX: ESC + pijltjes + body scroll lock
  useEffect(() => {
    if (!lightboxOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
        return;
      }

      // Alleen pijltjes als er meerdere items zijn
      if (!mediaItems || mediaItems.length < 2) return;

      if (e.key === 'ArrowRight') {
        setActiveIndex((i) => (i + 1) % mediaItems.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((i) => (i - 1 + mediaItems.length) % mediaItems.length);
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, mediaItems]);

  // 🔹 STYLES

  // 🔍 Lightbox styles
  const NAV_H = 70; // jouw header gebruikt o.a. padding en sticky; 70 is een goeie match

  const lightboxOverlayStyle = {
    position: 'fixed',
    inset: 0,

    zIndex: 2000,
    background: 'rgba(2,6,23,0.92)',
    backdropFilter: 'blur(6px)',

    display: 'flex',
    alignItems: isMobile ? 'center' : 'center',
    justifyContent: 'center',

    paddingTop: isMobile ? NAV_H + 8 : NAV_H + 16,
    paddingRight: isMobile ? 0 : 16,
    paddingBottom: isMobile ? 8 : 16,
    paddingLeft: isMobile ? 0 : 16,
  };

  const lightboxInnerStyle = {
    position: 'relative',
    width: isMobile ? '100%' : 'min(1000px, 96vw)',
    maxHeight: isMobile ? `calc(100vh - ${NAV_H + 16}px)` : '90vh',
    borderRadius: isMobile ? 0 : 16,
    overflow: 'hidden',
    border: isMobile ? 'none' : '1px solid rgba(148,163,184,0.18)',
    boxShadow: isMobile ? 'none' : '0 30px 70px rgba(0,0,0,0.75)',
    background: 'rgba(15,23,42,0.6)',
  };

  const lightboxMediaStyle = {
    width: '100%',
    height: 'auto',
    maxHeight: isMobile
      ? `calc(100vh - ${NAV_H + 16 + 40}px)`
      : `calc(100vh - ${70 + 16 + 16}px)`,
    objectFit: 'contain',
    display: 'block',
    background: THEME.surface,
  };

  const lightboxCloseStyle = {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 999,
    border: '1px solid rgba(148,163,184,0.25)',
    background: 'rgba(2,6,23,0.7)',
    color: '#e5e7eb',
    fontSize: 22,
    cursor: 'pointer',
    zIndex: 2,
  };

  const lightboxNavStyle = (side) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [side]: 10,
    width: 44,
    height: 44,
    borderRadius: 999,
    border: '1px solid rgba(148,163,184,0.25)',
    background: 'rgba(2,6,23,0.6)',
    color: '#e5e7eb',
    fontSize: 26,
    cursor: 'pointer',
    zIndex: 2,
  });

  const zoomHintStyle = {
    position: 'absolute',
    right: 10,
    bottom: 10,
    padding: '6px 10px',
    borderRadius: 999,
    background: 'rgba(2,6,23,0.55)',
    border: '1px solid rgba(148,163,184,0.25)',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
  };

  // ===================== LOKALY DARK (Detail page theme) =====================
  const DETAIL = {
    bg: '#0b0b0c',
    surface: 'rgba(255,255,255,0.05)',
    surface2: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.12)',
    text: 'rgba(255,255,255,0.92)',
    muted: 'rgba(255,255,255,0.66)',
    orange: THEME.orange,

    // subtiele “Lokaly glow” zoals homepage (zwart + oranje gloed)
    shellBg: `
    radial-gradient(circle at 14% 0%, rgba(255,107,61,0.22), transparent 55%),
    radial-gradient(circle at 86% 10%, rgba(255,107,61,0.14), transparent 52%),
    radial-gradient(circle at 50% 100%, rgba(255,107,61,0.10), transparent 45%),
    linear-gradient(180deg, #0b0b0c 0%, #0b0b0c 100%)
  `,
  };

  // ===================== PAGE SHELL (alleen voor asPage) =====================
  const pageShellStyle = {
    minHeight: embed ? 'auto' : '100vh',
    padding: embed ? 0 : isMobile ? 0 : '0 28px',
    background: embed ? 'transparent' : DETAIL.shellBg,
  };

  const pageCardStyle = {
    width: '100%',
    maxWidth: isMobile ? '100%' : '1360px',
    margin: '0 auto',
    borderRadius: 0,

    minHeight: embed ? 'auto' : '100vh',

    background: DETAIL.bg,
    color: DETAIL.text,
    fontFamily: THEME.font,

    // ✅ geen card-border/shadow meer (maakt het “vlak”)
    border: 'none',
    boxShadow: 'none',

    overflow: 'hidden',
    padding: 0,
    position: 'relative',
  };

  // ===================== PAGE vs MODAL SHELL =====================

  // ✅ Pas aan als jouw header hoger/lager is
  const MOBILE_HEADER_OFFSET = 64;

  const modalOverlayStyle = {
    position: 'fixed',

    // ✅ op mobiel: onder de header beginnen
    top: isMobile ? MOBILE_HEADER_OFFSET : 0,
    left: 0,
    right: 0,
    bottom: 0,

    // ✅ op mobiel geen “popup overlay gevoel”
    backgroundColor: isMobile ? 'transparent' : 'rgba(11,11,12,0.55)',
    backdropFilter: isMobile ? 'none' : 'blur(6px)',

    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',

    // ✅ mobile: card moet gewoon het hele vlak vullen
    alignItems: isMobile ? 'stretch' : 'center',
    padding: 0,
  };

  const modalCardStyle = {
    position: 'relative',

    width: '100%',
    maxWidth: isMobile ? '100%' : 860,

    height: isMobile ? 'auto' : 'auto',
    maxHeight: isMobile ? 'none' : '95vh',

    borderRadius: isMobile ? 0 : 20,

    backgroundColor: DETAIL.bg,
    color: DETAIL.text,
    fontFamily: THEME.font,

    overflowY: isMobile ? 'visible' : 'auto',
    WebkitOverflowScrolling: 'touch',
    overscrollBehavior: isMobile ? 'auto' : 'contain',

    boxShadow: isMobile ? 'none' : '0 30px 80px rgba(11,11,12,0.22)',
    border: isMobile ? 'none' : `1px solid ${DETAIL.border}`,
  };

  const outerStyle = asPage ? pageShellStyle : modalOverlayStyle;
  const innerStyle = asPage ? pageCardStyle : modalCardStyle;

  const closeButtonStyle = {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    fontSize: 20,
    background: DETAIL.surface2,
    color: DETAIL.text,
    border: `1px solid ${DETAIL.border}`,
    borderRadius: 999,
    cursor: 'pointer',
    boxShadow: '0 12px 26px rgba(11,11,12,0.10)',
  };

  const contentStyle = {
    padding: isMobile ? '16px 16px 24px' : '20px 26px 30px',
  };

  const mainImageStyle = {
    width: '100%',
    height: isMobile ? 420 : 640,
    objectFit: 'cover',
    borderRadius: 0,
    display: 'block',
    backgroundColor: 'rgba(15,23,42,0.06)',
  };

  const heroWrapStyle = {
    position: 'relative',
    width: '100%',
  };

  const detailNavPillBase = {
    padding: isMobile ? '8px 12px' : '9px 14px',
    borderRadius: isMobile ? '10px 0 10px 0' : '12px 0 12px 0',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.92)',
    fontFamily: THEME.font,
    fontWeight: 400,
    fontSize: 12.5,
    letterSpacing: 0.1,
    textTransform: 'none',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition:
      'background 0.18s ease-out, border-color 0.18s ease-out, transform 0.12s ease-out',
  };

  const heroBackBtnStyle = {
    ...detailNavPillBase,
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 6,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  };

  const heroTopRightActionsStyle = {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 6,
    display: 'flex',
    gap: 8,
    pointerEvents: 'auto',
  };

  const heroIconBtnStyle = (active = false) => ({
    width: 34,
    height: 34,
    padding: 0,
    borderRadius: isMobile ? '10px 0 10px 0' : '12px 0 12px 0',

    // active = zelfde als navActive (alleen border + kleur accent, background blijft gelijk)
    border: active
      ? '1px solid rgba(255,107,61,0.72)'
      : '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.045)',

    color: active ? 'rgba(255,107,61,0.98)' : 'rgba(255,255,255,0.92)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition:
      'background 0.18s ease-out, border-color 0.18s ease-out, transform 0.12s ease-out',
  });

  const heroCloseBtnStyle = {
    ...detailNavPillBase,
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 6,
    width: 36,
    height: 36,
    padding: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    lineHeight: '18px',
  };

  const heroFadeStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: isMobile ? 110 : 160,
    pointerEvents: 'none',
    background:
      'linear-gradient(180deg, rgba(11,11,12,0) 0%, rgba(11,11,12,0) 40%, rgba(11,11,12,0.55) 72%, rgba(11,11,12,0.92) 100%)',
  };

  const tabsWrap = {
    position: 'relative',
    display: 'flex',
    width: '100%',
    padding: '4px 18px 0px',
    marginTop: 6,

    // ✅ geen gap → tabs vullen strak de rij
    gap: 0,

    // ✅ geen horizontale scroll meer (gelijke verdeling)
    overflowX: 'hidden',

    // ✅ subtiele divider (donker) blijft
    borderBottom: '1px solid rgba(255,255,255,0.12)',
  };

  const tabsRail = {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: -1, // net op de divider
    height: 2,
    borderRadius: 999,

    // ✅ oranje lijn loopt door onder ALLE tabs
    background: 'rgba(255,107,61,0.22)',
    pointerEvents: 'none',
  };

  const tabBtn = (active) => ({
    flex: 1,
    minWidth: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: '11px 6px 13px',
    textAlign: 'center',

    fontFamily: THEME.font,
    fontSize: 13.5,
    letterSpacing: 0.2,

    color: active ? 'rgba(245,245,250,0.96)' : 'rgba(200,205,215,0.60)',
    fontWeight: active ? 600 : 500,

    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',

    position: 'relative',
    transition: 'color 0.18s ease',
  });

  const tabUnderline = (active) => ({
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: -1,
    height: 2,
    borderRadius: 999,

    // ✅ active segment “pakt” de hele tabbreedte (sluit aan op buren)
    background: active ? 'rgba(255,107,61,0.95)' : 'transparent',
  });

  const dotsRowStyle = {
    position: 'absolute',
    left: '50%',
    bottom: 12,
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 7,
    zIndex: 8, // boven fade
    pointerEvents: 'none',
  };

  const dotStyle = (active) => ({
    width: active ? 16 : 7,
    height: 7,
    borderRadius: 999,
    background: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.35)',
    boxShadow: active ? '0 10px 24px rgba(0,0,0,0.22)' : 'none',
    transition: 'all 160ms ease',
  });

  const galleryWrapperStyle = {
    marginBottom: isMobile ? 16 : 20,
  };

  const mediaFrameStyle = {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 0,
    background: 'rgba(255,255,255,0.02)',
  };

  const mediaRailStyle = {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    padding: '10px 14px 8px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };

  const mediaNavBtnStyle = (side) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [side]: 12,
    width: 38,
    height: 38,
    borderRadius: '12px 0 12px 0',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.94)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 7,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  });

  const thumbsRowStyle = {
    marginTop: 8,
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    paddingBottom: 4,
  };

  const thumbButtonStyle = (isActive) => ({
    border: isActive
      ? '2px solid rgba(250,204,21,0.9)'
      : '2px solid transparent',
    borderRadius: 12,
    padding: 0,
    background: 'transparent',
    cursor: 'pointer',
    flex: '0 0 auto',
  });

  const thumbImageStyle = {
    width: isMobile ? 64 : 72,
    height: isMobile ? 64 : 72,
    objectFit: 'cover',
    borderRadius: 10,
    display: 'block',
  };

  const videoThumbStyle = {
    ...thumbImageStyle,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 700,
    color: THEME.muted,
    background:
      'radial-gradient(circle at top, rgba(59,130,246,0.6), rgba(15,23,42,1))',
  };

  const actionsRowStyle = {
    marginTop: isMobile ? 18 : 22,
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: isMobile ? 'stretch' : 'flex-end',
    gap: 12,
  };

  const quickActionsRowStyle = {
    marginTop: 14,
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: 10,
    alignItems: 'stretch',
  };

  const quickActionBtnStyle = (variant = 'secondary') => ({
    ...(variant === 'primary' ? primaryActionStyle : secondaryActionStyle),
    width: isMobile ? '100%' : 'auto',
    minWidth: isMobile ? '100%' : 160,
  });

  // --- Mini map: Lokaly "flat editorial" theme (minder gradient, meer clean) ---
  const LOKALY_CREAM = '#FCF3EC';
  const LOKALY_BLACK = '#000000';
  const LOKALY_ORANGE = '#FF5E29';

  const miniMapCardStyle = {
    marginTop: 14,
    borderRadius: 0, // ✅ rechte hoeken
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.92)',
    border: `1px solid ${THEME.border}`,
    boxShadow: '0 14px 34px rgba(2,6,23,0.10)',
  };

  // ✅ Minimal mini map styles (no header / no controls)
  const miniMapRowStyle = {
    padding: '10px 2px 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    color: THEME.muted,
    fontSize: 13,
    fontWeight: 800,
  };

  const miniMapRowLeftStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  };

  const miniMapRowTextStyle = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const miniMapRowLinkStyle = {
    color: THEME.text,
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 900,
    opacity: 0.75,
  };

  const miniMapRowLinkHoverStyle = {
    opacity: 1,
  };

  const miniMapBodyMinimalStyle = {
    position: 'relative',
    height: isMobile ? 210 : 260,
    borderRadius: 18,
    overflow: 'hidden',
    border: `1px solid ${THEME.border}`,
    background: 'rgba(0,0,0,0.06)',
  };

  // Body (map) container iets “editorial”
  const miniMapBodyStyle = {
    height: isMobile ? 200 : 220,
    background: LOKALY_CREAM,
    position: 'relative', // ✅ nodig voor de "Open Maps" overlay
    borderTop: 'none', // ✅ geen header/strip-lijn
  };

  const miniMapOpenTextStyle = {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 5,
    padding: '6px 10px',
    fontSize: 12,
    fontWeight: 850,
    letterSpacing: 0.2,
    color: 'rgba(11,11,12,0.82)',
    background: 'rgba(255,255,255,0.78)',
    border: `1px solid ${THEME.border}`,
    textDecoration: 'none',
    backdropFilter: 'blur(10px)',
  };

  const miniMapPinWrapStyle = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 4,
    pointerEvents: 'none',
  };

  const miniMapPinRingStyle = {
    position: 'absolute',
    inset: -8,
    borderRadius: 999,
    border: '2px solid rgba(255,255,255,0.65)',
    background: 'rgba(255,107,61,0.12)',
  };

  const miniMapPinDotStyle = {
    width: 16,
    height: 16,
    borderRadius: 999,
    background: THEME.orange,
    border: '3px solid #ffffff',
    boxShadow: '0 10px 22px rgba(2,6,23,0.25)',
  };

  const primaryActionStyle = {
    width: '100%',
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    padding: isMobile ? '12px 16px' : '10px 20px',
    border: `1px solid ${THEME.orangeBorder}`,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: 0.2,

    // Urban accent (geen oud-geel meer)
    background:
      'linear-gradient(90deg, rgba(255,107,61,0.98) 0%, rgba(255,155,112,0.94) 100%)',
    color: '#0B0B0C',

    boxShadow: '0 10px 24px rgba(15,23,42,0.18)',
    textDecoration: 'none',
    textAlign: 'center',
  };

  const secondaryActionStyle = {
    ...primaryActionStyle,
    background: 'rgba(11,11,12,0.92)',
    color: '#F8FAFC',
    border: '1px solid rgba(148,163,184,0.22)',
    boxShadow: 'none',
    fontWeight: 700,
  };

  const reviewCardShellStyle = {
    padding: '12px 14px',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.03)',
  };

  const myReviewBadgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 9px',
    borderRadius: 999,
    border: '1px solid rgba(255,107,61,0.30)',
    background: 'rgba(255,107,61,0.10)',
    color: 'rgba(255,107,61,0.98)',
    fontFamily: THEME.font,
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: 0.2,
    marginBottom: 10,
  };

  const reviewErrorStyle = {
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid rgba(255,120,120,0.22)',
    background: 'rgba(255,120,120,0.08)',
    color: 'rgba(255,170,170,0.98)',
    fontFamily: THEME.font,
    fontSize: 13,
    fontWeight: 500,
  };

  const getReviewInitials = (profile, fallbackName, language) => {
    const first =
      profile?.first_name?.trim() ||
      profile?.username?.trim() ||
      fallbackName ||
      (language === 'nl' ? 'Gebruiker' : 'User');

    const last = profile?.last_name?.trim() || '';

    const raw = `${first} ${last}`.trim();
    const parts = raw.split(/\s+/).filter(Boolean);

    if (!parts.length) return 'U';

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  };

  const formatReviewDate = (value, language) => {
    const d = value ? new Date(value) : null;
    if (!d || Number.isNaN(d.getTime())) return '';

    return new Intl.DateTimeFormat(language === 'nl' ? 'nl-NL' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  };

  const metaPillStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.72)',
    border: `1px solid ${THEME.border}`,
    color: THEME.text,
    fontSize: 13,
    fontWeight: 700,
  };

  const heroOverlayStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: isMobile ? '14px 14px 14px' : '18px 18px 16px',
    background:
      'linear-gradient(180deg, rgba(11,11,12,0) 0%, rgba(11,11,12,0.55) 30%, rgba(11,11,12,0.92) 100%)',
    color: 'rgba(255,255,255,0.96)',
    pointerEvents: 'none',
  };

  const heroTitleRowStyle = {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  };

  const heroTitleStyle = {
    margin: 0,
    fontSize: isMobile ? 22 : 30,
    fontWeight: 950,
    letterSpacing: -0.6,
    lineHeight: 1.05,
    textShadow: '0 12px 30px rgba(0,0,0,0.45)',
  };

  const heroSubStyle = {
    marginTop: 8,
    fontSize: 13,
    fontWeight: 700,
    color: 'rgba(226,232,240,0.92)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  };

  const heroBadgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: isMobile ? '12px 0 12px 0' : '14px 0 14px 0',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.88)',
    fontFamily: THEME.font,
    fontWeight: 450,
    fontSize: 12.5,
    letterSpacing: 0.1,
    whiteSpace: 'nowrap',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  };

  const heroActionsStyle = {
    marginTop: 12,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    pointerEvents: 'auto',
  };

  const heroBtnBase = {
    height: 36,
    padding: '0 14px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.16)',
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.96)',
    fontWeight: 900,
    fontSize: 12.5,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
  };

  const heroBtnPrimary = {
    ...heroBtnBase,
    border: '1px solid rgba(255,94,41,0.55)',
    background: 'rgba(255,94,41,0.20)',
  };

  const heroBtnActive = {
    ...heroBtnBase,
    border: '1px solid rgba(16,185,129,0.55)',
    background: 'rgba(16,185,129,0.18)',
  };

  const metaKeyStyle = {
    color: THEME.muted,
    fontWeight: 800,
  };

  return (
    <div style={outerStyle} onClick={asPage ? undefined : onClose}>
      <div
        style={innerStyle}
        className="lokalyHideScroll"
        onClick={asPage ? undefined : (e) => e.stopPropagation()}
      >
        <style>{`
/* Hide scrollbar but keep scroll */
.lokalyHideScroll {
  scrollbar-width: none !important;      /* Firefox */
  -ms-overflow-style: none !important;   /* IE/old Edge */
  scrollbar-color: transparent transparent !important;
}

/* Chrome / Edge / Safari */
.lokalyHideScroll::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  display: none !important;
  background: transparent !important;
}

.lokalyHideScroll::-webkit-scrollbar-thumb {
  display: none !important;
  background: transparent !important;
}

.lokalyHideScroll::-webkit-scrollbar-track {
  display: none !important;
  background: transparent !important;
}

.lokalyHideScroll::-webkit-scrollbar-button {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.lokalyHideScroll::-webkit-scrollbar-corner {
  display: none !important;
  background: transparent !important;
}
`}</style>

        {/*  MEDIA GALLERY */}
        <div style={galleryWrapperStyle}>
          <div style={heroWrapStyle}>
            {/* Back + Close over de hero (1x, clean) */}
            {!hideNav && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  style={heroBackBtnStyle}
                >
                  ← {language === 'nl' ? 'Terug' : 'Back'}
                </button>

                {!asPage && (
                  <button
                    type="button"
                    onClick={onClose}
                    style={heroCloseBtnStyle}
                    aria-label={language === 'nl' ? 'Sluiten' : 'Close'}
                  >
                    ×
                  </button>
                )}
              </>
            )}

            {!asPage && (
              <button
                type="button"
                onClick={onClose}
                style={heroCloseBtnStyle}
                aria-label={t.close}
              >
                ×
              </button>
            )}

            <LocationModalMediaGallery
              language={language}
              location={location}
              mediaItems={mediaItems}
              mediaLoading={mediaLoading}
              mediaError={mediaError}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              lightboxOpen={lightboxOpen}
              openLightbox={openLightbox}
              closeLightbox={closeLightbox}
              goPrev={goPrev}
              goNext={goNext}
              handlePointerDown={handlePointerDown}
              handlePointerMove={handlePointerMove}
              handlePointerUp={handlePointerUp}
              handlePointerCancel={handlePointerCancel}
              handleSwipeStart={handleSwipeStart}
              handleSwipeMove={handleSwipeMove}
              handleSwipeEnd={handleSwipeEnd}
              handleSwipeCancel={handleSwipeCancel}
              handleWheelSwipe={handleWheelSwipe}
              pointerMovedRef={pointerMovedRef}
              mediaFrameStyle={mediaFrameStyle}
              mediaRailStyle={mediaRailStyle}
              thumbButtonStyle={thumbButtonStyle}
              thumbImageStyle={thumbImageStyle}
              mediaNavBtnStyle={mediaNavBtnStyle}
              mainImageStyle={mainImageStyle}
              heroFadeStyle={heroFadeStyle}
              dotsRowStyle={dotsRowStyle}
              dotStyle={dotStyle}
              zoomHintStyle={zoomHintStyle}
              lightboxOverlayStyle={lightboxOverlayStyle}
              lightboxInnerStyle={lightboxInnerStyle}
              lightboxCloseStyle={lightboxCloseStyle}
              lightboxNavStyle={lightboxNavStyle}
              lightboxMediaStyle={lightboxMediaStyle}
              isMobile={isMobile}
            />
          </div>
        </div>

        {/* ✅ Titel + sterren + labels + beschrijving (alles exact zelfde left start) */}
        <div
          style={{
            width: '100%',
            margin: '34px 0 0',
            paddingLeft: 16,
            paddingRight: 16,
            textAlign: 'left',
            boxSizing: 'border-box',
          }}
        >
          <h1 style={eventTitleStyle}>{location?.name}</h1>

          {detailDisplayRating != null ? (
            <div style={detailStarsRow}>
              <RenderStars value={detailDisplayRating} size={16} gap={4} />
            </div>
          ) : null}

          {/* ✅ Labels exact onder sterren, zelfde left start */}
          <div style={{ ...detailMetaRow, marginLeft: 0, paddingLeft: 0 }}>
            {districtLabel ? (
              <span style={detailMetaPill}>{districtLabel}</span>
            ) : null}
            {categoryLabels.map((label, idx) => (
              <span key={`cat-${idx}`} style={detailMetaPill}>
                {label}
              </span>
            ))}
            {vibeLabels.map((label, idx) => (
              <span key={`vibe-${idx}`} style={detailMetaPill}>
                {label}
              </span>
            ))}
          </div>

          {/* ✅ Korte beschrijving exact onder labels, zelfde left start */}
          {detailDesc ? (
            <DescriptionClamp
              text={detailDesc}
              isMobile={isMobile}
              expanded={descExpanded}
              onToggle={() => setDescExpanded((v) => !v)}
              style={detailDescStyle}
              language={language}
            />
          ) : null}
        </div>

        {!!location.website && (
          <a
            href={location.website}
            target="_blank"
            rel="noreferrer"
            style={{
              marginTop: 28,
              width: isMobile ? '86%' : 'min(420px, 100%)',
              maxWidth: 420,
              height: isMobile ? 44 : 46,
              marginLeft: 'auto',
              marginRight: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '18px 0 18px 0',
              background: THEME.orange,
              border: '1px solid rgba(255,107,61,0.25)',
              color: '#0B0B0C',
              textDecoration: 'none',
              fontFamily: THEME.font,
              fontSize: isMobile ? 14 : 15,
              fontWeight: 700,
              letterSpacing: 0.3,
              boxSizing: 'border-box',
              padding: '0 18px',
              boxShadow: '0 4px 14px rgba(255,107,61,0.22)',
              transition: 'transform 0.12s ease, box-shadow 0.12s ease',
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = 'scale(0.98)')
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,107,61,0.22)';
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,107,61,0.35)')
            }
            onClick={() => {
              track({
                event_name: 'website_click',
                page: 'detail',
                location_id: location?.id ?? null,
                user_id: user?.id || null,
                meta: { source: 'detail_page' },
              });
            }}
          >
            {language === 'nl' ? 'Website bezoeken' : 'Visit website'}
          </a>
        )}

        {/* ✅ Opslaan + Deel onder Website knop */}
        <div
          style={{
            width: 'min(420px, 86%)',
            margin: '12px auto 30px',
            display: 'flex',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(location.id);
            }}
            style={{
              height: 34,
              padding: '0 12px',
              borderRadius: '14px 0 14px 0',
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.92)',
              fontFamily: THEME.font,
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: 0.1,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              outline: 'none',
            }}
            aria-label={
              isFavorite ? t.saved || 'Opgeslagen' : t.save || 'Opslaan'
            }
            title={isFavorite ? t.saved || 'Opgeslagen' : t.save || 'Opslaan'}
          >
            <IconBookmark
              size={14}
              color={
                isFavorite ? 'rgba(255,107,61,0.98)' : 'rgba(255,255,255,0.92)'
              }
              filled={!!isFavorite}
            />
            {isFavorite ? t.saved || 'Opgeslagen' : t.save || 'Opslaan'}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              track({
                event_name: 'share_click',
                page: 'detail',
                location_id: location?.id ?? null,
                user_id: user?.id || null,
              });
              shareLocation(location, language);
            }}
            style={{
              height: 34,
              padding: '0 12px',
              borderRadius: '14px 0 14px 0',
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.92)',
              fontFamily: THEME.font,
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: 0.1,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              outline: 'none',
            }}
            aria-label={t.share || 'Deel'}
            title={t.share || 'Deel'}
          >
            <IconShare size={14} color="rgba(255,255,255,0.92)" />
            {t.share || 'Deel'}
          </button>
        </div>

        {/* ✅ Tabs direct onder de media */}
        <div style={tabsWrap}>
          <span style={tabsRail} />
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            style={tabBtn(activeTab === 'info')}
          >
            Details
            <span style={tabUnderline(activeTab === 'info')} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('prices')}
            style={tabBtn(activeTab === 'prices')}
          >
            Prijzen
            <span style={tabUnderline(activeTab === 'prices')} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hours')}
            style={tabBtn(activeTab === 'hours')}
          >
            Tijden
            <span style={tabUnderline(activeTab === 'hours')} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            style={tabBtn(activeTab === 'reviews')}
          >
            Reviews
            <span style={tabUnderline(activeTab === 'reviews')} />
          </button>
        </div>

        {/* ✅ Tab content */}
        <div style={{ paddingTop: 16, paddingBottom: 28 }}>
          {activeTab === 'info' && (
            <LocationModalInfoTab
              language={language}
              THEME={THEME}
              fullAddress={fullAddress}
              mapsHref={mapsHref}
              longDesc={longDesc}
              detailDesc={detailDesc}
              mapsUrl={mapsUrl}
              miniMapZoom={miniMapZoom}
              setMiniMapZoom={setMiniMapZoom}
              detailMiniMapRef={detailMiniMapRef}
              detailMiniMapReady={detailMiniMapReady}
            />
          )}

          {activeTab === 'prices' && (
            <LocationModalPricesTab
              language={language}
              THEME={THEME}
              location={location}
            />
          )}
          {activeTab === 'hours' && (
            <LocationModalHoursTab
              language={language}
              THEME={THEME}
              openingLines={openingLines}
            />
          )}

          {activeTab === 'reviews' && (
            <LocationModalReviewsTab
              language={language}
              user={user}
              THEME={THEME}
              RenderStars={RenderStars}
              SkeletonBox={SkeletonBox}
              reviewMsg={reviewMsg}
              loadingMyReview={loadingMyReview}
              myExistingReview={myExistingReview}
              reviewEditMode={reviewEditMode}
              setReviewEditMode={setReviewEditMode}
              myRating={myRating}
              setMyRating={setMyRating}
              myComment={myComment}
              setMyComment={setMyComment}
              savingReview={savingReview}
              deletingReview={deletingReview}
              submitMyReview={submitMyReview}
              deleteMyReview={deleteMyReview}
              ratingStats={ratingStats}
              loading={loading}
              errorMsg={errorMsg}
              loadReviews={loadReviews}
              reviews={reviews}
              highlightReviewId={highlightReviewId}
              reviewCardShellStyle={reviewCardShellStyle}
              myReviewBadgeStyle={myReviewBadgeStyle}
              reviewErrorStyle={reviewErrorStyle}
              getReviewInitials={getReviewInitials}
              formatReviewDate={formatReviewDate}
              secondaryActionStyle={secondaryActionStyle}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AuthModal({ language, user, onClose }) {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!user) setMode('login');
  }, [user]);

  // "login" | "signup" | "reset" | "setpw"
  const [mode, setMode] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Account (als user ingelogd is)
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Recovery / reset
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryPassword2, setRecoveryPassword2] = useState('');
  const redirectTo = `${window.location.origin}/`;

  const title = user
    ? language === 'nl'
      ? 'Jouw account'
      : 'Your account'
    : language === 'nl'
    ? 'Inloggen of account aanmaken'
    : 'Log in or create an account';

  // ---------------- Handlers (sluiten aan op jouw bestaande Supabase flow) ----------------
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        let loginEmail = (email || '').trim();

        if (!loginEmail) {
          throw new Error(
            language === 'nl'
              ? 'Vul je e-mail of gebruikersnaam in.'
              : 'Enter your email or username.'
          );
        }

        // Username login: als er geen @ in zit, proberen we username → email te resolven
        if (!loginEmail.includes('@')) {
          const username = loginEmail.replace(/^@/, '').trim();

          const { data, error: rpcErr } = await supabase.rpc(
            'get_login_email',
            {
              p_username: username,
            }
          );

          if (rpcErr) throw rpcErr;
          if (!data) {
            throw new Error(
              language === 'nl'
                ? 'Gebruikersnaam niet gevonden. Probeer je e-mail.'
                : 'Username not found. Try your email.'
            );
          }

          loginEmail = data; // RPC geeft email terug
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });

        if (error) throw error;
        onClose?.();
        return;
      }

      // signup
      const signupEmail = (email || '').trim();
      if (!signupEmail.includes('@')) {
        throw new Error(
          language === 'nl'
            ? 'Voor account aanmaken is een e-mail nodig.'
            : 'Email is required to create an account.'
        );
      }

      if ((password || '') !== (password2 || '')) {
        throw new Error(
          language === 'nl'
            ? 'Wachtwoorden komen niet overeen.'
            : 'Passwords do not match.'
        );
      }

      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password,
        options: { emailRedirectTo: redirectTo },
      });

      if (error) throw error;

      setSuccess(
        language === 'nl'
          ? 'Account aangemaakt! Check je inbox om je e-mail te bevestigen.'
          : 'Account created! Check your inbox to confirm your email.'
      );
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSetNewPassword(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!recoveryPassword || recoveryPassword.length < 6) {
        throw new Error(
          language === 'nl'
            ? 'Wachtwoord moet minimaal 6 tekens zijn.'
            : 'Password must be at least 6 characters.'
        );
      }
      if (recoveryPassword !== recoveryPassword2) {
        throw new Error(
          language === 'nl'
            ? 'Wachtwoorden komen niet overeen.'
            : 'Passwords do not match.'
        );
      }

      const { error } = await supabase.auth.updateUser({
        password: recoveryPassword,
      });
      if (error) throw error;

      setSuccess(
        language === 'nl'
          ? 'Wachtwoord aangepast. Je bent ingelogd.'
          : 'Password updated. You are now logged in.'
      );
      setMode('login');
      onClose?.();
    } catch (err) {
      setError(
        err.message ||
          (language === 'nl'
            ? 'Wachtwoord wijzigen mislukt.'
            : 'Password update failed.')
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      onClose?.();
    } catch (err) {
      setError(
        err.message ||
          (language === 'nl' ? 'Uitloggen mislukt.' : 'Log out failed.')
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateEmail() {
    if (!user) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;

      setSuccess(
        language === 'nl'
          ? 'Check je inbox: bevestig je nieuwe e-mail om de wijziging af te ronden.'
          : 'Check your inbox: confirm your new email to finish the change.'
      );
    } catch (err) {
      setError(err.message || 'Email update failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePassword() {
    if (!user) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (reauthError) throw reauthError;

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setCurrentPassword('');
      setNewPassword('');
      setSuccess(
        language === 'nl'
          ? 'Wachtwoord is gewijzigd.'
          : 'Password has been updated.'
      );
    } catch (err) {
      setError(
        err.message ||
          (language === 'nl'
            ? 'Wachtwoord wijzigen mislukt.'
            : 'Password update failed.')
      );
    } finally {
      setLoading(false);
    }
  }

  // ---------------- Lokaly styles (cream / glass / orange) ----------------
  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 2200,
    background: 'rgba(2,6,23,0.62)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: isMobile ? 'flex-end' : 'center',
    justifyContent: 'center',
    padding: isMobile ? 12 : 18,
  };

  const panelStyle = {
    width: '100%',
    maxWidth: 440,
    borderRadius: isMobile ? 18 : 22,
    overflow: 'hidden',
    border: '1px solid rgba(15,23,42,0.10)',
    boxShadow: '0 30px 80px rgba(15,23,42,0.20)',
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(252,243,236,0.86) 100%)',
    color: THEME.text,
    maxHeight: isMobile ? 'min(92vh, 740px)' : 'min(86vh, 760px)',
    display: 'flex',
    flexDirection: 'column',
  };

  const accentBarStyle = {
    height: 6,
    width: '100%',
    background:
      'linear-gradient(90deg, rgba(255,107,61,0.98) 0%, rgba(255,155,112,0.94) 100%)',
  };

  const contentStyle = {
    padding: isMobile ? '16px 16px 18px' : '18px 20px 20px',
    overflow: 'visible',
  };

  const closeBtnStyle = {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 999,
    border: '1px solid rgba(15,23,42,0.12)',
    background: 'rgba(255,255,255,0.88)',
    cursor: 'pointer',
    fontSize: 18,
    lineHeight: '38px',
    textAlign: 'center',
    color: 'rgba(15,23,42,0.75)',
  };

  const titleStyle = {
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: -0.2,
    margin: '2px 0 6px',
  };

  const subStyle = {
    margin: 0,
    fontFamily: THEME.font,
    fontSize: 12.5,
    fontWeight: 450,
    lineHeight: 1.25,
    color: 'rgba(235,240,255,0.62)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const tabRowStyle = {
    display: 'flex',
    gap: 6,
    padding: 4,
    borderRadius: 999,
    border: '1px solid rgba(15,23,42,0.10)',
    background: 'rgba(255,255,255,0.70)',
    boxShadow: '0 12px 28px rgba(15,23,42,0.08)',
    margin: '10px 0 14px',
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: '9px 10px',
    borderRadius: 999,
    border: active
      ? `1px solid ${THEME.orangeBorder}`
      : '1px solid transparent',
    background: active ? 'rgba(255,107,61,0.12)' : 'transparent',
    color: 'rgba(15,23,42,0.85)',
    fontSize: 12,
    fontWeight: 900,
    cursor: 'pointer',
  });

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontWeight: 800,
    color: 'rgba(15,23,42,0.65)',
    marginBottom: 6,
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 12px',
    borderRadius: 14,
    border: '1px solid rgba(15,23,42,0.12)',
    background: 'rgba(255,255,255,0.82)',
    color: 'rgba(15,23,42,0.88)',
    fontSize: 13,
    outline: 'none',
    marginBottom: 12,
  };

  const primaryButtonStyle = {
    width: '100%',
    marginTop: 6,
    padding: '11px 14px',
    borderRadius: 999,
    border: `1px solid ${THEME.orangeBorder}`,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0,
    color: '#0B0B0C',
    background:
      'linear-gradient(90deg, rgba(255,107,61,0.98) 0%, rgba(255,155,112,0.94) 100%)',
    boxShadow: '0 14px 34px rgba(15,23,42,0.16)',
  };

  const secondaryButtonStyle = {
    width: '100%',
    marginTop: 10,
    padding: '10px 14px',
    borderRadius: 999,
    border: '1px solid rgba(15,23,42,0.14)',
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.75)',
    color: 'rgba(15,23,42,0.80)',
    fontWeight: 800,
    fontSize: 13,
  };

  const linkButtonStyle = {
    background: 'transparent',
    border: 'none',
    padding: 0,
    color: 'rgba(2,132,199,0.95)',
    fontWeight: 600,
    fontSize: 12,
    cursor: 'pointer',
    margin: '2px 0 10px',
    textAlign: 'left',
  };

  const infoPillStyle = {
    padding: '10px 12px',
    borderRadius: 16,
    border: '1px solid rgba(15,23,42,0.10)',
    background: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    color: 'rgba(15,23,42,0.78)',
    marginBottom: 12,
  };

  const errorStyle = {
    marginTop: 6,
    padding: '10px 12px',
    borderRadius: 14,
    border: '1px solid rgba(239,68,68,0.22)',
    background: 'rgba(239,68,68,0.08)',
    color: 'rgba(127,29,29,0.95)',
    fontSize: 13,
    fontWeight: 800,
  };

  const successStyle = {
    marginTop: 6,
    padding: '10px 12px',
    borderRadius: 14,
    border: '1px solid rgba(16,185,129,0.22)',
    background: 'rgba(16,185,129,0.10)',
    color: 'rgba(6,95,70,0.95)',
    fontSize: 13,
    fontWeight: 800,
  };

  const termsLinkStyle = {
    color: THEME.orange,
    fontWeight: 700,
    textDecoration: 'none',
    cursor: 'pointer',
  };

  // ---------------- Render ----------------
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20000, // boven navbar (jouw navbar is 9999)
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        padding: isMobile ? 14 : 22,
        fontFamily: THEME.font,
      }}
      onClick={() => onClose?.()}
    >
      <div
        style={{
          width: 'min(1200px, 100%)',
          height: isMobile ? 'auto' : 'min(760px, calc(100vh - 44px))',
          borderRadius: isMobile ? 18 : 22,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(12,12,13,0.88)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.65)',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '0.95fr 1.05fr',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onClose?.()}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 50,
            width: 42,
            height: 42,
            borderRadius: '14px 0 14px 0',
            border: '1px solid rgba(255,255,255,0.16)',
            background: 'rgba(0,0,0,0.35)',
            color: 'rgba(255,255,255,0.92)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
          aria-label={language === 'nl' ? 'Sluiten' : 'Close'}
          title={language === 'nl' ? 'Sluiten' : 'Close'}
        >
          ×
        </button>
        {/* LEFT: form */}
        <div
          style={{
            padding: isMobile ? 18 : 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            position: 'relative',
            justifyContent: 'flex-start',
            height: '100%',
          }}
        >
          {/* close */}

          <div style={{ paddingRight: 54 }}>
            <div
              style={{
                fontFamily: THEME.fontDisplay,
                fontSize: isMobile ? 22 : 28,
                fontWeight: 650,
                letterSpacing: -0.2,
                color: 'rgba(235,240,255,0.92)',
              }}
            >
              {title}
            </div>

            {!user ? (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13.5,
                  fontWeight: 450,
                  lineHeight: 1.35,
                  color: 'rgba(235,240,255,0.68)',
                  maxWidth: 420,
                }}
              >
                {language === 'nl'
                  ? 'Bewaar je favorieten en ontdek Lokaly sneller.'
                  : 'Save favorites and discover Lokaly faster.'}
              </div>
            ) : null}
          </div>

          {/* Mode tabs (login/signup) — alleen als niet ingelogd */}
          <div style={{ flex: 0.15 }} />

          {/* Alerts */}
          {error ? (
            <div
              style={{
                borderRadius: 14,
                padding: '10px 12px',
                border: '1px solid rgba(255,140,140,0.35)',
                background: 'rgba(255,140,140,0.10)',
                color: 'rgba(255,210,210,0.95)',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          ) : null}

          {success ? (
            <div
              style={{
                borderRadius: 14,
                padding: '10px 12px',
                border: '1px solid rgba(34,197,94,0.35)',
                background: 'rgba(34,197,94,0.10)',
                color: 'rgba(187,255,214,0.92)',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {success}
            </div>
          ) : null}

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'grid',
              gap: 12,
              marginTop: isMobile ? 6 : 10, // ✅ hele form iets lager
            }}
          >
            {' '}
            {/* Email / username */}
            {(mode === 'login' || mode === 'signup') && !user ? (
              <>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: 'rgba(235,240,255,0.72)',
                    letterSpacing: 0.2,
                  }}
                >
                  {language === 'nl'
                    ? 'E-mail of gebruikersnaam'
                    : 'Email or username'}
                </div>
                <input
                  id="auth-email"
                  name="auth-email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    language === 'nl'
                      ? 'bijv. naam@email.com of @gebruikersnaam'
                      : 'e.g. name@email.com or @username'
                  }
                  style={{
                    height: 46,
                    borderRadius: '16px 0 16px 0',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(235,240,255,0.92)',
                    padding: '0 14px',
                    outline: 'none',
                    fontSize: 13.5,
                  }}
                />
              </>
            ) : null}
            {(mode === 'login' || mode === 'signup') && !user ? (
              <input
                id="auth-password"
                name="auth-password"
                type="password"
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language === 'nl' ? 'Wachtwoord' : 'Password'}
                style={{
                  height: 46,
                  borderRadius: '16px 0 16px 0',
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(235,240,255,0.92)',
                  padding: '0 14px',
                  outline: 'none',
                  fontSize: 13.5,
                }}
              />
            ) : null}
            {/* Confirm password (signup) */}
            {mode === 'signup' && !user ? (
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                placeholder={
                  language === 'nl' ? 'Herhaal wachtwoord' : 'Confirm password'
                }
                style={{
                  height: 46,
                  borderRadius: '16px 0 16px 0',
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(235,240,255,0.92)',
                  padding: '0 14px',
                  outline: 'none',
                  fontSize: 13.5,
                }}
              />
            ) : null}
            {/* RESET mode */}
            {mode === 'reset' && !user ? (
              <>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: 'rgba(235,240,255,0.72)',
                  }}
                >
                  {language === 'nl'
                    ? 'Wachtwoord reset (e-mail)'
                    : 'Reset password (email)'}
                </div>

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    language === 'nl' ? 'jouw@email.nl' : 'your@email.com'
                  }
                  style={{
                    height: 46,
                    borderRadius: '16px 0 16px 0',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(235,240,255,0.92)',
                    padding: '0 14px',
                    outline: 'none',
                    fontSize: 13.5,
                  }}
                />

                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(235,240,255,0.72)',
                    fontSize: 12.5,
                    fontWeight: 650,
                    padding: 0,
                    textAlign: 'left',
                  }}
                >
                  {language === 'nl'
                    ? '← Terug naar inloggen'
                    : '← Back to login'}
                </button>
              </>
            ) : null}
            <div style={{ height: 14 }} />
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 18,
                height: 48,
                borderRadius: '18px 0 18px 0',
                border: '1px solid rgba(255,107,61,0.55)',
                background: THEME.orange,
                color: '#0B0B0C',
                fontWeight: 800,
                fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 18px 48px rgba(255,107,61,0.22)',
              }}
            >
              {loading
                ? language === 'nl'
                  ? 'Bezig…'
                  : 'Loading…'
                : user
                ? language === 'nl'
                  ? 'Opslaan'
                  : 'Save'
                : mode === 'signup'
                ? language === 'nl'
                  ? 'Account aanmaken'
                  : 'Create account'
                : mode === 'reset'
                ? language === 'nl'
                  ? 'Stuur reset link'
                  : 'Send reset link'
                : language === 'nl'
                ? 'Inloggen'
                : 'Log in'}
            </button>
            {!user && (mode === 'login' || mode === 'signup') ? (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12.5,
                  color: 'rgba(235,240,255,0.62)',
                }}
              >
                {mode === 'login' ? (
                  <>
                    {language === 'nl'
                      ? 'Nog geen account? '
                      : 'No account yet? '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        margin: 0,
                        cursor: 'pointer',
                        color: 'rgba(255,107,61,0.98)',
                        fontWeight: 800,
                      }}
                    >
                      {language === 'nl'
                        ? 'Account aanmaken'
                        : 'Create account'}
                    </button>
                  </>
                ) : (
                  <>
                    {language === 'nl'
                      ? 'Heb je al een account? '
                      : 'Already have an account? '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        margin: 0,
                        cursor: 'pointer',
                        color: 'rgba(255,107,61,0.98)',
                        fontWeight: 800,
                      }}
                    >
                      {language === 'nl' ? 'Inloggen' : 'Log in'}
                    </button>
                  </>
                )}
              </div>
            ) : null}
          </form>

          <div
            style={{
              marginTop: 10,
              fontFamily: THEME.font,
              fontSize: 12.5,
              fontWeight: 450,
              color: 'rgba(235,240,255,0.65)',
              lineHeight: 1.35,
            }}
          >
            {language === 'nl' ? (
              <>
                Door in te loggen ga je akkoord met onze{' '}
                <a
                  href={`${window.location.pathname}?p=terms`}
                  style={termsLinkStyle}
                  onClick={() => onClose?.()} // ✅ modal sluiten
                >
                  voorwaarden
                </a>
                .
              </>
            ) : (
              <>
                By logging in you agree to our{' '}
                <a
                  href={`${window.location.pathname}?p=terms`}
                  style={termsLinkStyle}
                  onClick={() => onClose?.()}
                >
                  terms
                </a>
                .
              </>
            )}
          </div>
        </div>

        {/* RIGHT: image panel (desktop) */}
        {!isMobile ? (
          <div
            style={{
              position: 'relative',
              background: '#0B0B0C',
              overflow: 'hidden',
            }}
          >
            {/* ✅ Lokaly passende image */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  "url('https://bstijyilfgngdhpcmwfc.supabase.co/storage/v1/object/public/ui/Login.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'contrast(1.05) saturate(1.08)',
                transform: 'scale(1.02)',
              }}
            />

            {/* gradient overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(90deg, rgba(12,12,13,0.98) 0%, rgba(12,12,13,0.55) 40%, rgba(12,12,13,0.18) 70%, rgba(12,12,13,0.10) 100%)',
              }}
            />

            {/* brand / copy */}
            <div
              style={{
                position: 'absolute',
                left: 28,
                bottom: 26,
                right: 26,
                color: 'rgba(235,240,255,0.90)',
              }}
            >
              <div
                style={{
                  fontFamily: THEME.fontDisplay,
                  fontWeight: 800,
                  fontSize: 22,
                  letterSpacing: -0.2,
                }}
              >
                Lokaly.
              </div>
              <div
                style={{
                  marginTop: 8,
                  maxWidth: 420,
                  fontSize: 13.5,
                  fontWeight: 450,
                  lineHeight: 1.35,
                  color: 'rgba(235,240,255,0.72)',
                }}
              >
                {language === 'nl'
                  ? 'Ontdek verborgen parels. Bewaar je favorieten. Plan sneller je volgende uitje.'
                  : 'Discover hidden gems. Save favorites. Plan your next outing faster.'}
              </div>

              <div
                style={{
                  marginTop: 10,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: '16px 0 16px 0',
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: THEME.orange,
                    boxShadow: '0 0 0 6px rgba(255,107,61,0.16)',
                  }}
                />
                <span style={{ fontSize: 12.5, fontWeight: 650 }}>
                  {language === 'nl' ? 'Amsterdam (beta)' : 'Amsterdam (beta)'}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ===================== SECTION ROW ===================== */
function SectionRow({
  title,
  locations = [],
  onCardClick,
  language = 'nl',
  isTop10Section = false,
  favoriteIds,
  onToggleFavorite,
  onSeeAll,
  loading = false,
}) {
  const isMobile = useIsMobile();
  const t = STRINGS[language];

  const SECTION_GAP = 52;
  const rowGap = isTop10Section ? (isMobile ? 16 : 20) : isMobile ? 10 : 12;

  const rowRef = useRef(null);
  const dividerTrackRef = useRef(null);
  const rafRef = useRef(0);

  const [showArrows, setShowArrows] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // ✅ Mobiel: welke kaart is "in focus"
  const [activeIndex, setActiveIndex] = useState(0);

  // ✅ Desktop: progress (0..1) hoe ver je bent gescrold
  const [scrollProgress, setScrollProgress] = useState(1);

  // ✅ Mobiel: indicator in PX (zelfde breedte als 1 kaart)
  const [mobileIndicator, setMobileIndicator] = useState({ left: 0, width: 0 });

  const getCenteredIndex = useCallback(() => {
    const el = rowRef?.current || scrollerRef?.current;
    if (!el) return 0;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    const kids = Array.from(el.children || []);
    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    kids.forEach((node, idx) => {
      if (!node?.getBoundingClientRect) return;
      const r = node.getBoundingClientRect();
      const nodeCenter = r.left + r.width / 2;
      const d = Math.abs(nodeCenter - centerX);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = idx;
      }
    });

    return bestIdx;
  }, []);

  // --- Desktop: arrows + scroll progress ---
  useEffect(() => {
    if (isMobile) return; // pijlen + progress berekening alleen op desktop

    const el = rowRef.current;
    if (!el) return;

    const update = () => {
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      const scrollable = maxScroll > 2;

      setShowArrows(scrollable);
      setAtStart(el.scrollLeft <= 1);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);

      // progress: 0..1 (als niet scrollable -> 1 = volle lijn)
      const p = scrollable ? el.scrollLeft / maxScroll : 1;
      setScrollProgress(Math.max(0, Math.min(1, p)));
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [isMobile, locations, loading, rowGap]);

  // --- Mobiel: bepaal actieve kaart (center) + positioneer indicator onder die kaart ---
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    let raf = 0;

    const compute = () => {
      const kids = Array.from(el.children || []);
      if (!kids.length) return;

      const containerRect = el.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;

      let bestI = 0;
      let bestD = Infinity;

      kids.forEach((child, i) => {
        const r = child.getBoundingClientRect();
        const c = r.left + r.width / 2;
        const d = Math.abs(c - centerX);
        if (d < bestD) {
          bestD = d;
          bestI = i;
        }
      });

      setActiveIndex(bestI);

      // alleen op mobiel: oranje segment = kaartbreedte, en schuift mee onder de kaart
      if (isMobile && dividerTrackRef.current && kids[bestI]) {
        const trackRect = dividerTrackRef.current.getBoundingClientRect();
        const cardRect = kids[bestI].getBoundingClientRect();

        const width = Math.min(cardRect.width, trackRect.width);
        const leftRaw = cardRect.left - trackRect.left;

        const left = Math.max(0, Math.min(leftRaw, trackRect.width - width));
        setMobileIndicator({ left, width });
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const bestIdx = getCenteredIndex();
        if (bestIdx !== activeIndex) setActiveIndex(bestIdx);
      });
    };

    compute();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', compute);

    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', compute);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isMobile, loading, locations]);

  const scrollRow = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.85);
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  // ✅ full width header (zoals je desktop wens)
  const headerWrap = {
    width: '100vw',
    marginLeft: 'calc(50% - 50vw)',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: isMobile ? 14 : 18,
  };

  const titleWrap = {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: 8,
    minWidth: 0,
  };

  const titleStyle = {
    fontFamily: THEME.fontDisplay,
    fontSize: isMobile ? 20 : 23,
    fontWeight: 500,
    color: 'rgba(235,240,255,0.92)',
    letterSpacing: -0.1,
    margin: 0,
    lineHeight: 1.15,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const seeAllBtn = {
    border: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
    cursor: 'pointer',

    color: 'rgba(235,240,255,0.92)',

    fontSize: 13,
    fontWeight: 400,
    letterSpacing: 0.1,

    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    lineHeight: 1,
    opacity: 0.95,
    transition: 'color 160ms ease, opacity 160ms ease',
  };

  const chevron = {
    fontSize: 17,
    lineHeight: 1,
    opacity: 0.75,
    transform: 'translateY(-0.5px)',
  };

  const arrowBtnStyle = (rightOffset, disabled) => ({
    position: 'absolute',
    bottom: 10,
    right: rightOffset,
    zIndex: 6,
    width: 38,
    height: 38,
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(17,17,19,0.55)',
    color: 'rgba(235,240,255,0.92)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.35 : 1,
    display: 'grid',
    placeItems: 'center',
    fontSize: 20,
    lineHeight: 1,
    boxShadow: '0 18px 36px rgba(0,0,0,0.32)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition: 'transform 160ms ease, opacity 160ms ease',
  });

  const rowOuter = {
    position: 'relative',
    width: '100vw',
    marginLeft: 'calc(50% - 50vw)',
  };

  const rowInner = {
    display: 'flex',
    gap: rowGap,
    overflowX: 'auto',
    paddingTop: isMobile ? 8 : 12,
    paddingBottom: 14,
    paddingLeft: 16,
    paddingRight: 16,
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    WebkitOverflowScrolling: 'touch',
    touchAction: 'pan-y pan-x',
  };

  const divider = {
    width: '100vw',
    marginLeft: 'calc(50% - 50vw)',
    marginTop: 14,
    padding: '0 16px',
    pointerEvents: 'none',
  };

  const dividerTrack = {
    position: 'relative',
    width: '100%',
    height: 3,
  };

  const dividerBase = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 1,
    height: 1,
    background: 'rgba(235,240,255,0.18)',
  };

  // ✅ Desktop: fill progress (links -> rechts)
  const dividerActiveDesktop = (progress01) => {
    const pct = Math.max(2, Math.min(100, (Number(progress01) || 0) * 100));
    return {
      position: 'absolute',
      left: 0,
      top: 0,
      height: 2,
      width: `${pct}%`,
      borderRadius: 999,
      background: THEME.orange,
      zIndex: 2,
      boxShadow: '0 0 12px rgba(255,107,61,0.35)',
      boxShadow: '0 0 0 1px rgba(255,107,61,0.10)',
    };
  };

  // ✅ Mobiel: segment = kaartbreedte, en schuift mee
  const dividerActiveMobile = ({ left, width }) => ({
    position: 'absolute',
    top: 0,
    height: 2,
    left: left || 0,
    width: Math.max(18, width || 0),
    borderRadius: 999,
    background: THEME.orange,
    zIndex: 2,
    boxShadow: '0 0 12px rgba(255,107,61,0.35)',
    boxShadow: '0 0 0 1px rgba(255,107,61,0.10)',
  });

  return (
    <section style={{ marginTop: SECTION_GAP, marginBottom: 8 }}>
      <div style={headerWrap}>
        <div style={titleWrap}>
          <h2 style={titleStyle}>{title}</h2>
        </div>

        {onSeeAll ? (
          <button
            type="button"
            onClick={onSeeAll}
            style={seeAllBtn}
            onMouseEnter={(e) => {
              if (isMobile) return;
              e.currentTarget.style.color = 'rgba(235,240,255,0.92)';
            }}
            onMouseLeave={(e) => {
              if (isMobile) return;
              e.currentTarget.style.color = 'rgba(235,240,255,0.52)';
            }}
          >
            {t.seeAll}
            <span style={chevron} aria-hidden="true">
              ›
            </span>
          </button>
        ) : null}
      </div>

      <div style={rowOuter}>
        {/* ✅ PC: knoppen terug */}
        {!isMobile && showArrows ? (
          <>
            <button
              type="button"
              aria-label="Scroll links"
              onClick={() => scrollRow(-1)}
              disabled={atStart}
              style={arrowBtnStyle(54, atStart)}
            >
              ‹
            </button>

            <button
              type="button"
              aria-label="Scroll rechts"
              onClick={() => scrollRow(1)}
              disabled={atEnd}
              style={arrowBtnStyle(12, atEnd)}
            >
              ›
            </button>
          </>
        ) : null}

        <div
          ref={rowRef}
          style={rowInner}
          onWheel={(e) => {
            if (!rowRef.current) return;
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
              rowRef.current.scrollLeft += e.deltaY;
            }
          }}
        >
          {loading ? (
            <SkeletonRow count={isTop10Section ? 10 : 6} />
          ) : (
            locations.map((loc, index) => (
              <LocationCard
                key={loc.id}
                loc={loc}
                index={isTop10Section ? index : null}
                isTop10Card={!!isTop10Section}
                onClick={() => onCardClick?.(loc)}
                language={language}
                isFavorite={favoriteIds?.has?.(loc.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))
          )}
        </div>

        {/* ✅ Oranje lijn onder de sectie */}
        <div style={divider}>
          <div ref={dividerTrackRef} style={dividerTrack}>
            <div style={dividerBase} />
            <div
              style={
                isMobile
                  ? dividerActiveMobile(mobileIndicator)
                  : dividerActiveDesktop(scrollProgress)
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================== HOMEPAGE ===================== */

function HomePage({
  language,
  onLocationClick,
  onVibeSelect,
  onSeeAllCategory,
  onSeeAllVibes,
  locations,
  locationsLoading,
  favoriteIds,
  onToggleFavorite,
  vibes,
  categories,
}) {
  const t = STRINGS[language];

  const sourceLocations = locations ?? [];

  // 1) Top10 lijst (blijft bestaan voor de Top10-sectie)
  const top10Locations = useMemo(() => {
    return sourceLocations
      .filter(
        (loc) => loc.top10Rank && loc.top10Rank > 0 && loc.top10Rank <= 10
      )
      .sort((a, b) => a.top10Rank - b.top10Rank);
  }, [sourceLocations]);

  // 2) Admin-keuze voor Hero ("Uitgelicht")
  const heroCandidates = useMemo(() => {
    // extra safe: alleen published (voor publiek is dat sowieso al zo)
    return sourceLocations.filter(
      (loc) =>
        !!loc.heroFeatured && (loc.isPublished ?? loc.is_published ?? true)
    );
  }, [sourceLocations]);

  // 3) Hero lijst (voor carousel) + stabiele start-index per page load
  const heroSeedRef = useRef(Math.random());

  const heroList = useMemo(() => {
    return heroCandidates.length > 0
      ? heroCandidates
      : top10Locations.length > 0
      ? top10Locations
      : sourceLocations;
  }, [heroCandidates, top10Locations, sourceLocations]);

  const heroInitialIndex = useMemo(() => {
    if (!heroList || heroList.length === 0) return 0;
    return Math.floor(heroSeedRef.current * heroList.length);
  }, [heroList]);

  // (alleen nog voor jouw "popularToShow" exclude zoals je nu doet)
  const heroLocation = heroList?.[heroInitialIndex] ?? null;

  // 3) Overige secties (manual > auto fallback)
  const manualRomantic = sourceLocations.filter(
    (loc) => loc.homeSection === 'romantic'
  );
  const manualCenter = sourceLocations.filter(
    (loc) => loc.homeSection === 'center'
  );
  const manualPopular = sourceLocations.filter(
    (loc) => loc.homeSection === 'popular'
  );

  const romanticLocations =
    manualRomantic.length > 0
      ? manualRomantic
      : sourceLocations.filter(
          (loc) => loc.vibeName === 'Romantisch' || loc.vibe === 'Romantisch'
        );

  const centerLocations =
    manualCenter.length > 0
      ? manualCenter
      : sourceLocations.filter(
          (loc) => loc.district === 'Centrum' || loc.districtSlug === 'centrum'
        );

  // Populaire locaties op basis van manual of Supabase-flag
  const popularLocations =
    manualPopular.length > 0
      ? manualPopular
      : sourceLocations.filter((loc) => loc.isFeatured);

  // Zorg dat de hero niet dubbel in “Popular” komt
  const popularToShow =
    popularLocations.length > 0
      ? popularLocations.filter((loc) => loc.id !== heroLocation?.id)
      : sourceLocations.filter((loc) => loc.id !== heroLocation?.id).slice(0);

  if (!sourceLocations || sourceLocations.length === 0) {
    return null; // of een simpele fallback UI
  }

  return (
    <>
      <HeroCarousel
        locations={heroList}
        initialIndex={heroInitialIndex}
        language={language}
        onOpen={(loc) => onLocationClick(loc)}
      />

      <VibeRow
        title={t.chooseVibe}
        onVibeSelect={onVibeSelect}
        onSeeAll={onSeeAllVibes}
        vibes={vibes}
        language={language}
      />
      <SectionRow
        title={t.top10}
        locations={top10Locations}
        onCardClick={onLocationClick}
        isTop10Section
        language={language}
        onSeeAll={onSeeAllCategory}
        favoriteIds={favoriteIds}
        onToggleFavorite={onToggleFavorite}
        loading={locationsLoading}
      />
      <SectionRow
        title={t.popular}
        locations={popularToShow}
        onCardClick={onLocationClick}
        language={language}
        onSeeAll={onSeeAllCategory}
        favoriteIds={favoriteIds}
        onToggleFavorite={onToggleFavorite}
        loading={locationsLoading}
      />

      {romanticLocations.length > 0 && (
        <SectionRow
          title={t.romantic}
          locations={romanticLocations}
          onCardClick={onLocationClick}
          language={language}
          onSeeAll={onSeeAllCategory}
          favoriteIds={favoriteIds}
          onToggleFavorite={onToggleFavorite}
          loading={locationsLoading}
        />
      )}
      {centerLocations.length > 0 && (
        <SectionRow
          title={t.centerHotspots}
          locations={centerLocations}
          onCardClick={onLocationClick}
          language={language}
          onSeeAll={onSeeAllCategory}
          favoriteIds={favoriteIds}
          onToggleFavorite={onToggleFavorite}
          loading={locationsLoading}
        />
      )}
    </>
  );
}

// ✅ Category backgrounds (voorkomt "categoryColorMap is not defined")
const defaultCategoryBg =
  'radial-gradient(circle at top left, rgba(148,163,184,0.14), rgba(15,23,42,0.98))';

const makeCategoryGradient = (baseColor) => {
  if (!baseColor) return defaultCategoryBg;

  const c = String(baseColor);

  // Als het al een gradient is: gebruik direct
  if (c.includes('gradient')) return c;

  // Alleen veilig voor hex kleuren (#RGB of #RRGGBB)
  if (c.startsWith('#') && (c.length === 4 || c.length === 7)) {
    // 0.18 alpha-ish via hex suffix (werkt met #RRGGBB)
    if (c.length === 7)
      return `radial-gradient(circle at top left, ${c}2E, rgba(15,23,42,0.98))`;
    // fallback bij #RGB
    return defaultCategoryBg;
  }

  return defaultCategoryBg;
};

// ✅ Subtiele “luxe” gradient voor gekleurde category tiles
const normalizeHex = (hex) => {
  if (!hex) return null;
  const c = String(hex).trim();
  if (!c.startsWith('#')) return null;

  if (c.length === 4) {
    // #RGB -> #RRGGBB
    const r = c[1],
      g = c[2],
      b = c[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  if (c.length === 7) return c.toUpperCase();
  return null;
};

const clamp255 = (n) => Math.max(0, Math.min(255, n));

const shadeHex = (hex, pct) => {
  // pct: bijv. +14 (lichter) of -14 (donkerder)
  const h = normalizeHex(hex);
  if (!h) return hex;

  const num = parseInt(h.slice(1), 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  const factor = (100 + pct) / 100;
  r = clamp255(Math.round(r * factor));
  g = clamp255(Math.round(g * factor));
  b = clamp255(Math.round(b * factor));

  return (
    '#' +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
};

const makeLuxeTileBg = (base) => {
  if (!base) return base;
  const c = String(base);

  // als je al een gradient in Supabase zet: respecteer die
  if (c.includes('gradient')) return c;

  const hex = normalizeHex(c);
  if (!hex) return base;

  const light = shadeHex(hex, +14);
  const dark = shadeHex(hex, -14);

  // 1) zachte highlight “spot”
  // 2) lichte kleurverloop (licht -> basis -> donker)
  return `
    radial-gradient(900px circle at 20% 15%,
      rgba(255,255,255,0.30) 0%,
      rgba(255,255,255,0.12) 28%,
      rgba(255,255,255,0) 60%
    ),
    linear-gradient(135deg, ${light} 0%, ${hex} 48%, ${dark} 100%)
  `.trim();
};

const categoryColorMap =
  typeof CATEGORIES !== 'undefined' && Array.isArray(CATEGORIES)
    ? Object.fromEntries(
        CATEGORIES.map((c) => [c.name, makeCategoryGradient(c.color)])
      )
    : {};

function getVibeTheme(vibe) {
  const slug = vibe?.slug || 'all';

  const fallbackMap = {
    all: { bg: '#22D3EE', title: '#FFFFFF', cover: '' },
    'date-night': { bg: '#FB7185', title: '#FFFFFF', cover: '' },
    'met-de-crew': { bg: '#3B82F6', title: '#FFFFFF', cover: '' },
    'family-time': { bg: '#22C55E', title: '#FFFFFF', cover: '' },
    'solo-mission': { bg: '#7C3AED', title: '#FFFFFF', cover: '' },
    'rainy-day': { bg: '#64748B', title: '#FFFFFF', cover: '' },
    'na-het-werk': { bg: '#F97316', title: '#FFFFFF', cover: '' },
    'weekend-pick': { bg: '#EAB308', title: '#FFFFFF', cover: '' },
    'late-night': { bg: '#4C1D95', title: '#FFFFFF', cover: '' },
    'easy-going': { bg: '#14B8A6', title: '#FFFFFF', cover: '' },
    'actie-aan': { bg: '#EF4444', title: '#FFFFFF', cover: '' },
    'culture-fix': { bg: '#4F46E5', title: '#FFFFFF', cover: '' },
    'even-opladen': { bg: '#2DD4BF', title: '#FFFFFF', cover: '' },
    'iets-anders': { bg: '#EC4899', title: '#FFFFFF', cover: '' },
    'lekker-spelen': { bg: '#F59E0B', title: '#FFFFFF', cover: '' },
    'impressie-maken': { bg: '#0EA5E9', title: '#FFFFFF', cover: '' },
    buitenlucht: { bg: '#16A34A', title: '#FFFFFF', cover: '' },
    'binnen-knus': { bg: '#A78BFA', title: '#FFFFFF', cover: '' },
    feestmodus: { bg: '#D946EF', title: '#FFFFFF', cover: '' },
  };

  const fallback = fallbackMap[slug] || {
    bg: '#F97316',
    title: '#FFFFFF',
    cover: '',
  };

  return {
    bg: vibe?.color || vibe?.bg_color || fallback.bg,
    title: '#FFFFFF',
    cover: vibe?.cover_url || vibe?.image_url || fallback.cover || '',
  };
}

// Grote “single-word” titel zoals screenshot (Pasta/Burger)
function getBigCategoryWord(name = '') {
  if (!name) return '';
  // pak eerste chunk vóór & of -
  const primary = name.split('&')[0].split('-')[0].trim();
  return primary.length > 0 ? primary : name;
}

// Robuuste telling voor “x spots” (werkt met id/slug/naam)
function countSpotsForCategory(cat, locations = []) {
  const id = cat?.id;
  const slug = cat?.slug;
  const name = cat?.name;

  return locations.filter((loc) => {
    return (
      (id && loc.category_id === id) ||
      (slug && (loc.category_slug === slug || loc.category === slug)) ||
      (name && (loc.category_name === name || loc.category === name))
    );
  }).length;
}

function CategoryPage({
  language,
  locations,
  categories,
  vibes,
  onLocationClick,
  favoriteIds,
  onToggleFavorite,
  locationsLoading,
}) {
  const isMobile = useIsMobile();
  const t = STRINGS[language];
  const favoriteIdsSet = favoriteIds ?? new Set();

  // Supabase -> fallback naar lokale dummy-data
  const sourceLocations = locations ?? [];
  const sourceCategories =
    categories && categories.length > 0
      ? categories
      : typeof CATEGORIES !== 'undefined'
      ? CATEGORIES
      : [];
  const sourceVibes =
    vibes && vibes.length > 0
      ? vibes
      : typeof VIBES !== 'undefined'
      ? VIBES
      : [];

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedVibe, setSelectedVibe] = useState('all');
  const [hoveredCat, setHoveredCat] = useState(null);
  const [isOverview, setIsOverview] = useState(true); // 👈 bepaalt overview vs detail

  // ✅ Belangrijk: advancedOpen MOET boven useEffects staan die het gebruiken
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const catPillsRef = useRef(null);
  const catPillsScrollLeftRef = useRef(0);

  const vibePillsRef = useRef(null);
  const vibePillsScrollLeftRef = useRef(0);

  const rememberCatScroll = () => {
    if (catPillsRef.current) {
      catPillsScrollLeftRef.current = catPillsRef.current.scrollLeft;
    }
  };

  const rememberVibeScroll = () => {
    if (vibePillsRef.current) {
      vibePillsScrollLeftRef.current = vibePillsRef.current.scrollLeft;
    }
  };

  // ✅ behoud scrollpositie van categorie-bar na selectie
  useEffect(() => {
    if (!catPillsRef.current) return;
    requestAnimationFrame(() => {
      if (catPillsRef.current) {
        catPillsRef.current.scrollLeft = catPillsScrollLeftRef.current;
      }
    });
    // ✅ ook bij vibe-change / advanced toggle blijven staan waar je was
  }, [selectedCategory, selectedVibe, advancedOpen, isOverview]);

  // ✅ behoud scrollpositie van vibes-bar (alleen als advanced open is)
  useEffect(() => {
    if (!advancedOpen || !vibePillsRef.current) return;
    requestAnimationFrame(() => {
      if (vibePillsRef.current) {
        vibePillsRef.current.scrollLeft = vibePillsScrollLeftRef.current;
      }
    });
  }, [selectedVibe, advancedOpen]);

  // ---------------- PAGINATION ----------------
  const RESULTS_PER_PAGE = isMobile ? 8 : 12; // pas gerust aan
  const [page, setPage] = useState(1);

  // ---------------- SORTING ----------------
  const [sortOption, setSortOption] = useState('default');
  // default | az | za | rating_desc

  // ✅ Vibe gekozen op Home? (URL: ?p=category&vibe=xxx) → open resultaten + zet vibe filter
  const urlPresetAppliedRef = useRef(false);

  useEffect(() => {
    if (urlPresetAppliedRef.current) return;
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const p = url.searchParams.get('p') || 'home';
    const vibeParam = url.searchParams.get('vibe');

    if (p !== 'category' || !vibeParam) return;

    // voorkom dubbel uitvoeren (bijv. als Supabase vibes later binnenkomen)
    urlPresetAppliedRef.current = true;

    // probeer slug → name te mappen voor “actieve pill highlight”
    const target = vibeParam.toLowerCase();
    const found = (sourceVibes || []).find((v) => {
      const slug = (v?.slug || '').toLowerCase();
      const name = (v?.name || '').toLowerCase();
      return slug === target || name === target;
    });

    // We willen intern ALTIJD de slug bewaren (want je pills vergelijken op 'all' en op v.slug)
    const value = found ? found.slug || found.name : vibeParam;

    // normalize "alle vibes" varianten → 'all'
    const normalized = (() => {
      const s = String(value || '')
        .toLowerCase()
        .trim();
      if (
        s === 'all' ||
        s === 'alle vibes' ||
        s === 'all vibes' ||
        s === 'alle-vibes' ||
        s === 'alle_vibes'
      ) {
        return 'all';
      }
      return value;
    })();

    setSelectedCategory(null);
    setSelectedVibe(normalized);

    // ✅ naar resultaten view (niet overview grid)
    setIsOverview(false);

    // ✅ open direct de vibe filters
    setAdvancedOpen(true);

    // start op pagina 1
    setPage(1);
  }, [sourceVibes]);

  // ✅ handig: 1 reset-functie voor alle knoppen
  const resetAllFilters = () => {
    setSelectedCategory(null);
    setSelectedVibe('all');
    setSortOption('default');
    setPage(1);
    setAdvancedOpen(false);
  };

  // bij filter-wijzigingen altijd terug naar pagina 1
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedVibe, isOverview, sortOption]);

  const resetFiltersLabel =
    language === 'nl' ? 'Reset filters' : 'Reset filters';

  /* ---------- ICONS & LABELS (Urban, no-emoji) ---------- */

  const getCategoryLabel = (cat) => {
    if (!cat?.name) return '';
    return language === 'nl'
      ? cat.name_nl || cat.name
      : cat.name_en || cat.name;
  };
  const getVibeLabel = (vibe) => {
    if (!vibe?.name) return '';
    return language === 'nl'
      ? vibe.name_nl || vibe.name
      : vibe.name_en || vibe.name;
  };

  const pillButtonBase = {
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.04)',
    color: 'rgba(235,240,255,0.82)',

    // ✅ alleen linksboven + rechtsonder rond
    borderRadius: isMobile ? '12px 0 12px 0' : '14px 0 14px 0',

    padding: isMobile ? '10px 12px' : '10px 14px',
    fontFamily: THEME.font,
    fontSize: 13,
    fontWeight: 450,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    outline: 'none',
    boxShadow: 'none',
    transition:
      'transform 120ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease',
  };

  // ✅ active = NIET vullen, alleen tekst (en optioneel border) oranje
  const pillActive = {
    background: 'rgba(255,255,255,0.04)', // zelfde als base
    border: '1px solid rgba(255,107,61,0.55)',
    color: 'rgba(255,107,61,0.98)',
    boxShadow: 'none',
    transform: 'none',
  };

  // (optioneel) als je ergens selectedPillStyle gebruikt: laat ‘m gelijk aan pillActive
  const selectedPillStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,107,61,0.55)',
    color: 'rgba(255,107,61,0.98)',
  };

  function CategoryPill({ cat }) {
    const isSelected =
      selectedCategory?.slug === cat.slug ||
      selectedCategory?.name === cat.name;

    return (
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        style={{
          ...pillButtonBase,
          ...(isSelected ? pillActive : {}),
        }}
        onClick={() => {
          setSelectedCategory((cur) =>
            cur?.slug === cat.slug || cur?.name === cat.name ? null : cat
          );
          setIsOverview(false);
          setPage(1);
        }}
      >
        <span>{getCategoryLabel(cat)}</span>
      </button>
    );
  }

  function VibePill({ vibe }) {
    const value = vibe.slug || vibe.name; // ✅ altijd slug prefereren
    const isSelected = selectedVibe === value;

    return (
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        style={{
          ...pillButtonBase,
          ...(isSelected ? pillActive : null),
        }}
        onClick={() => {
          rememberVibeScroll();

          setSelectedVibe((cur) => (cur === value ? 'all' : value));

          requestAnimationFrame(() => {
            if (vibePillsRef.current) {
              vibePillsRef.current.scrollLeft = vibePillsScrollLeftRef.current;
            }
          });
        }}
      >
        <span>{getVibeLabel(vibe)}</span>
      </button>
    );
  }

  /* ---------- LAYOUT ---------- */

  const pageOuterStyle = {
    minHeight: '100vh',
    background: 'var(--lokaly-bg)', // ✅ exact zwart (of jouw dark var)
    color: 'var(--lokaly-text)', // ✅ default tekstkleur licht
  };

  const sectionStyle = {
    padding: isMobile ? '72px 14px 28px' : '96px 64px 56px',

    // ✅ full width zoals homepage
    width: '100%',
    maxWidth: 'none',
    margin: 0,
  };

  const headerStyle = {
    marginTop: isMobile ? 10 : 14,
    marginBottom: isMobile ? 16 : 18,
  };

  const hasSpecificCategory = !!selectedCategory;

  const titleText = hasSpecificCategory
    ? language === 'nl'
      ? `Locaties in ontdek ${selectedCategory.name}`
      : `Locations in discover ${selectedCategory.name}`
    : language === 'nl'
    ? 'Alle locaties'
    : 'All locations';

  const subtitleText = hasSpecificCategory
    ? language === 'nl'
      ? 'Filter op inspiratie om je perfecte volgende uitje te vinden.'
      : 'Filter by inspiration to find your next perfect outing.'
    : language === 'nl'
    ? 'Filter op inspiratie en ontdek om je perfecte volgende uitje te vinden.'
    : 'Filter by inspiration and discover to find your next perfect outing.';

  const titleStyle = {
    margin: 0,
    fontFamily: THEME.fontDisplay,
    fontWeight: 600,
    fontSize: isMobile ? 26 : 34,
    letterSpacing: -0.2,
    color: 'rgba(235,240,255,0.92)',
  };

  const descStyle = {
    margin: isMobile ? '4px 0 0 0' : '2px 0 0 0',
    fontFamily: THEME.font,
    fontSize: isMobile ? 14 : 13,
    lineHeight: isMobile ? 1.35 : 1.3,
    fontWeight: 450,
    color: 'rgba(235,240,255,0.72)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minHeight: isMobile ? '2.7em' : '2.6em',
  };

  // Compact “filters card”
  const filtersWrapperStyle = {
    marginTop: 12,
    marginBottom: 14,
    padding: isMobile ? 10 : 12,
    borderRadius: 18,
    background: 'rgba(255,255,255,0.72)',
    border: '1px solid rgba(15,23,42,0.10)',
    boxShadow: '0 16px 38px rgba(15,23,42,0.10)',
    backdropFilter: 'blur(10px)',
  };

  const filterLabelStyle = {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'rgba(15,23,42,0.55)',
    marginBottom: 8,
  };

  const filterRowStyle = {
    display: 'flex',
    gap: 8, // ✅ iets kleiner
    flexWrap: isMobile ? 'nowrap' : 'wrap',
    overflowX: isMobile ? 'auto' : 'visible',
    WebkitOverflowScrolling: 'touch',
    paddingBottom: isMobile ? 6 : 0,
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };

  const compactFilterBarStyle = {
    marginTop: 10,
    marginBottom: 10,
    padding: '10px 12px',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.60)',
    border: '1px solid rgba(15,23,42,0.10)',
    boxShadow: '0 14px 30px rgba(15,23,42,0.08)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  };

  const compactTagsStyle = {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'center',
  };

  const compactTagStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 999,

    background: 'var(--lokaly-surface)',
    border: '1px solid var(--lokaly-border)',
    color: 'var(--lokaly-text)',

    fontSize: 12,
    fontWeight: 800,
  };

  const compactActionsStyle = {
    display: 'flex',
    gap: 8,
    flexShrink: 0,
  };

  const smallActionBtn = (active = false) => ({
    ...pillButtonBase,
    padding: '8px 12px',
    borderRadius: 999,
    background: active ? THEME.orangeSoft : 'rgba(11,11,12,0.05)',
    border: active
      ? `1px solid ${THEME.orangeBorder}`
      : '1px solid rgba(15,23,42,0.10)',
    boxShadow: active ? '0 14px 30px rgba(15,23,42,0.10)' : 'none',
  });

  const backLinkStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 14,
    color: 'rgba(148,163,184,0.9)',
    cursor: 'pointer',
    marginBottom: 26,
  };

  const introLiftWrapStyle = {
    position: 'relative',
    top: isMobile ? -22 : -28, // 👈 hoger = groter gat eronder
  };

  const resetButtonStyle = {
    border: 'none',
    background: 'transparent',
    padding: 0,
    color: THEME.muted,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    textDecoration: 'underline',
    textUnderlineOffset: 3,
  };

  const resultsTopBarStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 2,
    marginBottom: 10,
    flexWrap: isMobile ? 'wrap' : 'nowrap',
  };

  const sortControlStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'flex-end',
    flexShrink: 0,
  };

  const sortLabelStyle = {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'rgba(15,23,42,0.45)',
  };

  const sortDropdownWrapStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
  };

  const sortSelectStyle = {
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',

    height: 40,
    minWidth: 170,
    padding: '0 40px 0 16px',

    // ✅ zelfde hoekstijl als je chips
    borderRadius: '16px 0 16px 0',
    border: '1px solid rgba(255,255,255,0.10)',

    // ✅ donkere background zodat tekst altijd leesbaar is
    background: 'rgba(12,12,13,0.88)',
    color: 'rgba(235,240,255,0.88)',

    fontFamily: THEME.font,
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '-0.01em',

    // ✅ dit helpt Chrome/Edge om het dropdown menu ook “dark” te renderen
    colorScheme: 'dark',

    outline: 'none',
    cursor: 'pointer',
    boxShadow: 'none',
  };

  const sortChevronStyle = {
    position: 'absolute',
    right: 14,
    pointerEvents: 'none',
    color: 'rgba(235,240,255,0.55)',
    fontSize: 12,
    lineHeight: '12px',
  };

  // desktop: grid naast elkaar; mobiel: onder elkaar
  const listStyle = isMobile
    ? {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        marginTop: 12,
      }
    : {
        display: 'grid',

        // ✅ kleiner min = meer kaarten per rij
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',

        // ✅ dichter op elkaar (horizontaal + verticaal)
        columnGap: 10,
        rowGap: 10,

        alignItems: 'stretch',
        width: '100%',
        marginTop: 16,
      };

  const countLabelStyle = {
    fontSize: 13,
    color: 'rgba(148,163,184,0.7)',
    marginBottom: 12,
  };

  const paginationRowStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: isMobile ? 'center' : 'flex-start',
    marginTop: 18,
  };

  const pagePillStyle = {
    ...pillButtonBase,
    padding: isMobile ? '6px 10px' : '7px 12px',
    fontSize: 12,
  };

  const dotsStyle = {
    padding: isMobile ? '6px 8px' : '7px 10px',
    color: 'rgba(148,163,184,0.75)',
    fontSize: 12,
    userSelect: 'none',
  };

  // ✅ Nieuwe compacte “pill bar” look (zoals je voorbeeld)
  const pillsTrayStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    overflowX: 'auto',
    overflowY: 'hidden',
    padding: '4px 2px 6px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };

  const filtersAreaStyle = {
    marginTop: 14,
    padding: isMobile ? 14 : 16,
    borderRadius: isMobile ? '16px 0 16px 0' : '18px 0 18px 0',
    border: 'none',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    boxShadow: '0 22px 70px rgba(0,0,0,0.40)',
  };

  const filtersTopRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  };

  const miniLabelStyle = {
    fontFamily: THEME.font,
    fontSize: 11,
    letterSpacing: 0.22,
    textTransform: 'uppercase',
    color: 'rgba(235,240,255,0.55)',
  };

  const actionRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  };

  const minimalBtnStyle = {
    ...pillButtonBase,
    height: 34,
    padding: '0 12px',
  };

  const advancedBtnStyle = (active) => ({
    ...pillButtonBase,
    ...(active ? selectedPillStyle : {}),
  });

  // ✅ Reset als tekst (geen rand/achtergrond)
  const resetTextBtnStyle = {
    border: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
    fontFamily: THEME.font,
    fontSize: 12.5,
    fontWeight: 450,
    color: 'rgba(235,240,255,0.82)',
    cursor: 'pointer',
    lineHeight: 1,
  };

  // ✅ Minimalistische dropdown icon button
  const dropdownIconBtnStyle = {
    border: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
    width: 22,
    height: 22,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'rgba(235,240,255,0.82)',
  };

  // 👉 alle filterlogica op 1 plek
  const locationsToRender = useMemo(() => {
    let base = sourceLocations;

    // --- 1. Filter op categorie (via slug of naam) ---
    if (selectedCategory) {
      const targetSlug = selectedCategory.slug || null;
      const targetName = selectedCategory.name || null;

      base = base.filter((loc) => {
        const locCategoryNames = Array.isArray(loc.categoryNames)
          ? loc.categoryNames
          : Array.isArray(loc.category_names)
          ? loc.category_names
          : [loc.categoryName || null].filter(Boolean);

        const locCategorySlugs = Array.isArray(loc.categorySlugs)
          ? loc.categorySlugs
          : Array.isArray(loc.category_slugs)
          ? loc.category_slugs
          : [loc.categorySlug || loc.type || loc.categoryType || null].filter(
              Boolean
            );

        const slugMatch =
          targetSlug &&
          locCategorySlugs.some(
            (slug) =>
              slug && String(slug).toLowerCase() === targetSlug.toLowerCase()
          );
        const nameMatch =
          targetName &&
          locCategoryNames.some(
            (name) =>
              name && String(name).toLowerCase() === targetName.toLowerCase()
          );

        return slugMatch || nameMatch;
      });
    }

    // --- 2. Optioneel filter op vibe ---
    if (selectedVibe && selectedVibe !== 'all') {
      base = base.filter((loc) => {
        const locVibeNames = Array.isArray(loc.vibeNames)
          ? loc.vibeNames
          : Array.isArray(loc.vibe_names)
          ? loc.vibe_names
          : [loc.vibe || loc.vibeName || null].filter(Boolean);

        const locVibeSlugs = Array.isArray(loc.vibeSlugs)
          ? loc.vibeSlugs
          : [loc.vibeSlug || null].filter(Boolean);

        const target = selectedVibe.toLowerCase();

        const nameMatch = locVibeNames.some(
          (name) => name && String(name).toLowerCase() === target
        );

        const slugMatch = locVibeSlugs.some(
          (slug) => slug && String(slug).toLowerCase() === target
        );

        return nameMatch || slugMatch;
      });
    }

    return base;
  }, [sourceLocations, selectedCategory, selectedVibe]);
  const sortedLocations = useMemo(() => {
    const arr = [...locationsToRender];

    const locale = language === 'nl' ? 'nl-NL' : 'en-US';
    const nameOf = (x) => (x?.name || '').toString();

    if (sortOption === 'az') {
      arr.sort((a, b) =>
        nameOf(a).localeCompare(nameOf(b), locale, { sensitivity: 'base' })
      );
    } else if (sortOption === 'za') {
      arr.sort((a, b) =>
        nameOf(b).localeCompare(nameOf(a), locale, { sensitivity: 'base' })
      );
    } else if (sortOption === 'rating_desc') {
      arr.sort((a, b) => {
        const rb = Number(b?.rating || 0);
        const ra = Number(a?.rating || 0);
        return (
          rb - ra ||
          nameOf(a).localeCompare(nameOf(b), locale, { sensitivity: 'base' })
        );
      });
    }

    return arr;
  }, [locationsToRender, sortOption, language]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedLocations.length / RESULTS_PER_PAGE)
  );

  const safePage = Math.min(page, totalPages);

  // als filters minder resultaten geven en je "te ver" zit, clamp terug
  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const pagedLocations = useMemo(() => {
    const start = (safePage - 1) * RESULTS_PER_PAGE;
    return sortedLocations.slice(start, start + RESULTS_PER_PAGE);
  }, [sortedLocations, safePage, RESULTS_PER_PAGE]);

  const rangeStart =
    locationsToRender.length > 0 ? (safePage - 1) * RESULTS_PER_PAGE + 1 : 0;
  const rangeEnd = Math.min(
    safePage * RESULTS_PER_PAGE,
    sortedLocations.length
  );

  const pageTokens = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const tokens = [1];
    const left = Math.max(2, safePage - 1);
    const right = Math.min(totalPages - 1, safePage + 1);

    if (left > 2) tokens.push('…');
    for (let p = left; p <= right; p++) tokens.push(p);
    if (right < totalPages - 1) tokens.push('…');
    tokens.push(totalPages);

    return tokens;
  }, [safePage, totalPages]);

  // ===================== CATEGORY OVERVIEW (Old tiles + Lokaly polish) =====================
  if (isOverview) {
    const cats = (sourceCategories || []).filter(
      (c) => c?.is_active !== false && c?.slug !== 'all'
    );

    const ovWrapStyle = {
      ...pageOuterStyle, // ✅ fix (was .pageOuterStyle)
    };

    const ovSectionStyle = {
      padding: isMobile ? '78px 14px 28px' : '96px 64px 56px',
      maxWidth: 1240,
      margin: '0 auto',
    };

    const ovHeaderStyle = {
      marginBottom: isMobile ? 14 : 18,
    };

    const ovTitleStyle = {
      margin: 0,
      fontFamily: THEME.fontDisplay, // zelfde “display” font als homepage
      fontWeight: 500, // ✅ dunner dan 600
      fontSize: isMobile ? 26 : 34,
      letterSpacing: -0.3, // ✅ net wat strakker
      color: 'rgba(235,240,255,0.92)',
    };

    const ovSubStyle = {
      marginTop: 6,
      fontFamily: THEME.font, // body font zoals homepage
      fontSize: 14,
      fontWeight: 400, // ✅ dunner dan 450
      lineHeight: 1.5,
      maxWidth: 720,
      letterSpacing: 0.05,
      color: 'rgba(235,240,255,0.72)',
    };

    const gridStyle = {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? 'repeat(2, minmax(0, 1fr))'
        : 'repeat(3, minmax(0, 1fr))',
      gap: isMobile ? 12 : 16,
    };

    // “Nav button” rounding: links-boven & rechts-onder rond
    const tileBase = {
      position: 'relative',
      border: 'none',
      outline: 'none',
      WebkitTapHighlightColor: 'transparent',
      borderRadius: isMobile ? '18px 0 18px 0' : '22px 0 22px 0',
      overflow: 'hidden',
      cursor: 'pointer',
      padding: isMobile ? 14 : 16,
      textAlign: 'left',
      minHeight: isMobile ? 118 : 164,
      boxShadow: '0 18px 44px rgba(0,0,0,0.35)',
      transition: 'transform 160ms ease, box-shadow 200ms ease',
      background: 'var(--lokaly-surface)',
    };

    // ✅ Eerst imgSize bepalen (moet boven tileTitle!)
    const tileMinH = isMobile ? 118 : 164; // match met tileBase minHeight
    const imgSize = Math.round(tileMinH * (isMobile ? 0.72 : 0.78));
    const imgOffsetX = Math.round(imgSize * 0.15);
    const imgOffsetY = Math.round(imgSize * 0.34);

    const tileTitle = {
      fontFamily: THEME.fontDisplay || THEME.font,
      fontWeight: 500, // ✅ dunner
      letterSpacing: -0.3, // ✅ strakker
      lineHeight: 1.14,
      margin: 0,

      // ✅ ruimte voor image frame rechts (nu werkt imgSize)
      paddingRight: Math.max(isMobile ? 62 : 90, Math.round(imgSize * 0.62)),

      paddingBottom: 2,
      display: 'block',
      maxWidth: '100%',
    };

    // ✅ Image frame (responsief)
    const catImgWrap = {
      position: 'absolute',
      right: -imgOffsetX,
      bottom: -imgOffsetY,
      width: imgSize,
      height: imgSize,
      borderRadius: 6,
      overflow: 'hidden',
      transform: 'rotate(16deg)',
      boxShadow: '0 22px 46px rgba(0,0,0,0.32)',
      border: 'none',
      background: 'transparent',
      pointerEvents: 'none',
    };

    const catImg = {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
    };

    function splitTitleLines(name = '') {
      const raw = String(name).trim();
      if (!raw) return [];

      // Split op spaties, maar plak "&" aan het woord ervoor: "Arcades &" / "Retro"
      const parts = raw.split(/\s+/);
      const lines = [];

      for (let i = 0; i < parts.length; i++) {
        const w = parts[i];
        if (w === '&' && lines.length > 0) {
          lines[lines.length - 1] = `${lines[lines.length - 1]} &`;
        } else {
          lines.push(w);
        }
      }

      return lines;
    }

    function getTitleFontSize(name = '', isMobile = false) {
      const n = String(name);
      const len = n.length;

      // basis (kleiner)
      let size = isMobile ? 16 : 20;

      // langer = kleiner
      if (len >= 18) size = isMobile ? 15 : 18;
      if (len >= 26) size = isMobile ? 14 : 16;
      if (len >= 34) size = isMobile ? 13 : 15;

      return size;
    }

    return (
      <div style={ovWrapStyle}>
        <section style={ovSectionStyle}>
          <header style={ovHeaderStyle}>
            <h1 style={ovTitleStyle}>{t.categoriesTitle}</h1>
            <div style={ovSubStyle}>{t.categoriesIntro}</div>
          </header>

          <div style={gridStyle}>
            {cats.map((cat) => {
              const displayName =
                language === 'nl'
                  ? cat?.name_nl || cat?.name || ''
                  : cat?.name_en || cat?.name_nl || cat?.name || '';
              const th = getCategoryTheme(cat); // { bg, title, cover, badge }
              const key = cat?.id || cat?.slug || cat?.name;

              const isHover = hoveredCat === (cat?.slug || key);

              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setIsOverview(false);
                  }}
                  onMouseEnter={() => setHoveredCat(cat?.slug || key)}
                  onMouseLeave={() => setHoveredCat(null)}
                  style={{
                    ...tileBase,
                    background: th?.bg
                      ? `linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.55) 100%), ${th.bg}`
                      : tileBase.background,
                    transform: isHover ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: isHover
                      ? '0 22px 52px rgba(0,0,0,0.45)'
                      : tileBase.boxShadow,
                  }}
                >
                  <h3
                    style={{
                      ...tileTitle,
                      color: '#FFFFFF',
                      fontSize: getTitleFontSize(displayName, isMobile),
                    }}
                  >
                    {splitTitleLines(displayName)
                      .slice(0, isMobile ? 2 : 3)
                      .map((line, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {line}
                        </span>
                      ))}
                  </h3>

                  {!!th?.cover && (
                    <div style={catImgWrap}>
                      <img src={th.cover} alt={displayName} style={catImg} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  /* ========= VIEW 2: DETAIL (FILTERS + LOCATIES) ========= */

  return (
    <div style={pageOuterStyle}>
      <section style={sectionStyle}>
        <div style={introLiftWrapStyle}>
          <div style={backLinkStyle} onClick={() => setIsOverview(true)}>
            <span style={{ fontSize: 18, transform: 'translateY(1px)' }}>
              ←
            </span>
            <span>
              {language === 'nl' ? 'Terug naar inspiratie' : 'Back to inspiration'}
            </span>
          </div>

          <header style={headerStyle}>
            <h1 style={titleStyle}>{titleText}</h1>
            <p style={descStyle}>{subtitleText}</p>
          </header>
        </div>

        {/* ✅ Filters (zonder omkaderend blok) */}

        {/* Top row: label + acties */}
        <div style={filtersTopRowStyle}>
          <div style={miniLabelStyle}>
            {language === 'nl' ? 'Ontdek' : 'Discover'}
          </div>

          <div style={actionRowStyle}>
            <button
              type="button"
              style={resetTextBtnStyle}
              onClick={resetAllFilters}
            >
              {language === 'nl' ? 'Reset' : 'Reset'}
            </button>

            {advancedOpen && (
              <button
                type="button"
                style={minimalBtnStyle}
                onClick={() => setAdvancedOpen(false)}
              >
                {language === 'nl' ? 'Sluit' : 'Close'}
              </button>
            )}
          </div>
        </div>

        {/* ✅ BAR 1: Categorieën */}
        <div
          ref={catPillsRef}
          style={pillsTrayStyle}
          onScroll={rememberCatScroll}
        >
          <button
            type="button"
            style={{
              ...pillButtonBase,
              ...(!selectedCategory ? selectedPillStyle : {}),
            }}
            onClick={() => {
              setSelectedCategory(null);
              setSelectedVibe('all');
              setSortOption('default');
              setPage(1);
            }}
          >
            <span>
              {language === 'nl' ? 'Alle ontdek' : 'All discover'}
            </span>
          </button>

          {sourceCategories.map((cat) => (
            <CategoryPill key={cat.id || cat.slug || cat.name} cat={cat} />
          ))}
        </div>

        {/* ✅ Geavanceerd zoeken knop */}
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            style={dropdownIconBtnStyle}
            aria-label={
              language === 'nl'
                ? advancedOpen
                  ? 'Vibes inklappen'
                  : 'Vibes uitklappen'
                : advancedOpen
                ? 'Collapse vibes'
                : 'Expand vibes'
            }
            title={
              language === 'nl'
                ? advancedOpen
                  ? 'Vibes inklappen'
                  : 'Vibes uitklappen'
                : advancedOpen
                ? 'Collapse vibes'
                : 'Expand vibes'
            }
          >
            <span
              style={{
                display: 'inline-block',
                fontSize: 16,
                lineHeight: '16px',
                transform: advancedOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 160ms ease',
              }}
            >
              ▾
            </span>
          </button>

          {!advancedOpen && selectedVibe !== 'all' && (
            <span style={{ fontSize: 13, color: 'var(--lokaly-muted)' }}>
              {language === 'nl'
                ? `Vibe: ${selectedVibe}`
                : `Vibe: ${selectedVibe}`}
            </span>
          )}
        </div>

        {/* ✅ BAR 2: Vibes */}
        {advancedOpen && (
          <div style={{ marginTop: 10 }}>
            <div style={{ ...miniLabelStyle, marginBottom: 8 }}>Vibes</div>

            <div
              ref={vibePillsRef}
              style={pillsTrayStyle}
              onScroll={rememberVibeScroll}
            >
              <button
                type="button"
                style={{
                  ...pillButtonBase,
                  ...(selectedVibe === 'all' ? selectedPillStyle : {}),
                }}
                onClick={() => {
                  setSelectedVibe('all');
                  setPage(1);
                }}
              >
                <span>{language === 'nl' ? 'Alle inspiratie' : 'All inspiration'}</span>
              </button>

              {sourceVibes
                .filter(
                  (v) =>
                    v.slug !== 'all' &&
                    v.name !== 'Alle vibes' &&
                    v.name !== 'All vibes'
                )
                .map((vibe) => (
                  <VibePill
                    key={vibe.id || vibe.slug || vibe.name}
                    vibe={vibe}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Resultaten */}
        <div>
          <div style={resultsTopBarStyle}>
            <div style={{ ...countLabelStyle, marginBottom: 0 }}>
              {locationsToRender.length === 0
                ? language === 'nl'
                  ? 'Geen locaties gevonden.'
                  : 'No locations found.'
                : language === 'nl'
                ? `Toont ${rangeStart}-${rangeEnd} van ${sortedLocations.length} resultaten (pagina ${safePage}/${totalPages})`
                : `Showing ${rangeStart}-${rangeEnd} of ${locationsToRender.length} results (page ${safePage}/${totalPages})`}
            </div>

            <div style={sortControlStyle}>
              <div style={sortControlStyle}>
                <div style={sortDropdownWrapStyle}>
                  <select
                    value={sortOption}
                    onChange={(e) => {
                      setSortOption(e.target.value);
                      setPage(1);
                    }}
                    style={sortSelectStyle}
                    aria-label={language === 'nl' ? 'Sorteren' : 'Sort'}
                  >
                    <option value="default">
                      {language === 'nl' ? 'Aanbevolen' : 'Recommended'}
                    </option>
                    <option value="az">A–Z</option>
                    <option value="za">Z–A</option>
                    <option value="rating_desc">
                      {language === 'nl' ? 'Rating' : 'Rating'}
                    </option>
                  </select>
                  <span style={sortChevronStyle}>▾</span>
                </div>
              </div>
            </div>
          </div>

          <div style={listStyle}>
            {locationsLoading ? (
              <SkeletonGrid count={9} />
            ) : (
              pagedLocations.map((loc) =>
                isMobile ? (
                  <CategoryResultRowCard
                    key={loc.id || loc.name}
                    loc={loc}
                    language={language}
                    onClick={(picked) => onLocationClick?.(picked)}
                  />
                ) : (
                  <LocationCard
                    key={loc.id || loc.name}
                    loc={loc}
                    onClick={() => onLocationClick?.(loc)}
                    language={language}
                    forceFullWidthOnMobile={true}
                    isFavorite={favoriteIds?.has?.(loc.id) || false}
                    onToggleFavorite={onToggleFavorite}
                  />
                )
              )
            )}
          </div>

          {!locationsLoading && totalPages > 1 && (
            <div
              style={{
                ...paginationRowStyle,
                width: '100%',
                justifyContent: 'center',
                marginTop: 18,
              }}
            >
              <button
                type="button"
                style={{
                  ...pagePillStyle,
                  ...(safePage === 1
                    ? { opacity: 0.45, cursor: 'not-allowed' }
                    : {}),
                }}
                onClick={() =>
                  safePage > 1 && setPage((p) => Math.max(1, p - 1))
                }
              >
                {language === 'nl' ? 'Vorige' : 'Prev'}
              </button>

              {pageTokens.map((token, idx) =>
                token === '…' ? (
                  <span key={`dots-${idx}`} style={dotsStyle}>
                    …
                  </span>
                ) : (
                  <button
                    key={`page-${token}`}
                    type="button"
                    style={{
                      ...pagePillStyle,
                      ...(token === safePage ? selectedPillStyle : {}),
                    }}
                    onClick={() => setPage(token)}
                  >
                    {token}
                  </button>
                )
              )}

              <button
                type="button"
                style={{
                  ...pagePillStyle,
                  ...(safePage === totalPages
                    ? { opacity: 0.45, cursor: 'not-allowed' }
                    : {}),
                }}
                onClick={() =>
                  safePage < totalPages &&
                  setPage((p) => Math.min(totalPages, p + 1))
                }
              >
                {language === 'nl' ? 'Volgende' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function VibePage({
  language,
  locations,
  categories,
  vibes,
  onLocationClick,
  favoriteIds,
  onToggleFavorite,
  locationsLoading,
}) {
  const isMobile = useIsMobile();
  const t = STRINGS[language];
  const favoriteIdsSet = favoriteIds ?? new Set();

  // Supabase -> fallback naar lokale dummy-data
  const sourceLocations = locations ?? [];
  const sourceCategories =
    categories && categories.length > 0
      ? categories
      : typeof CATEGORIES !== 'undefined'
      ? CATEGORIES
      : [];
  const sourceVibes =
    vibes && vibes.length > 0
      ? vibes
      : typeof VIBES !== 'undefined'
      ? VIBES
      : [];

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedVibe, setSelectedVibe] = useState('all');
  const [hoveredCat, setHoveredCat] = useState(null);
  const [isOverview, setIsOverview] = useState(true); // 👈 bepaalt overview vs detail

  // ✅ Belangrijk: advancedOpen MOET boven useEffects staan die het gebruiken
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const catPillsRef = useRef(null);
  const catPillsScrollLeftRef = useRef(0);

  const vibePillsRef = useRef(null);
  const vibePillsScrollLeftRef = useRef(0);

  const rememberCatScroll = () => {
    if (catPillsRef.current) {
      catPillsScrollLeftRef.current = catPillsRef.current.scrollLeft;
    }
  };

  const rememberVibeScroll = () => {
    if (vibePillsRef.current) {
      vibePillsScrollLeftRef.current = vibePillsRef.current.scrollLeft;
    }
  };

  // ✅ behoud scrollpositie van categorie-bar na selectie
  useEffect(() => {
    if (!catPillsRef.current) return;
    requestAnimationFrame(() => {
      if (catPillsRef.current) {
        catPillsRef.current.scrollLeft = catPillsScrollLeftRef.current;
      }
    });
    // ✅ ook bij vibe-change / advanced toggle blijven staan waar je was
  }, [selectedCategory, selectedVibe, advancedOpen, isOverview]);

  // ✅ behoud scrollpositie van vibes-bar (alleen als advanced open is)
  useEffect(() => {
    if (!advancedOpen || !vibePillsRef.current) return;
    requestAnimationFrame(() => {
      if (vibePillsRef.current) {
        vibePillsRef.current.scrollLeft = vibePillsScrollLeftRef.current;
      }
    });
  }, [selectedVibe, advancedOpen]);

  // ---------------- PAGINATION ----------------
  const RESULTS_PER_PAGE = isMobile ? 8 : 12; // pas gerust aan
  const [page, setPage] = useState(1);

  // ---------------- SORTING ----------------
  const [sortOption, setSortOption] = useState('default');
  // default | az | za | rating_desc

  // ✅ Vibe gekozen op Home? (URL: ?p=category&vibe=xxx) → open resultaten + zet vibe filter
  const urlPresetAppliedRef = useRef(false);

  useEffect(() => {
    if (urlPresetAppliedRef.current) return;
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const p = url.searchParams.get('p') || 'home';
    const vibeParam = url.searchParams.get('vibe');

    if (p !== 'category' || !vibeParam) return;

    // voorkom dubbel uitvoeren (bijv. als Supabase vibes later binnenkomen)
    urlPresetAppliedRef.current = true;

    // probeer slug → name te mappen voor “actieve pill highlight”
    const target = vibeParam.toLowerCase();
    const found = (sourceVibes || []).find((v) => {
      const slug = (v?.slug || '').toLowerCase();
      const name = (v?.name || '').toLowerCase();
      return slug === target || name === target;
    });

    // We willen intern ALTIJD de slug bewaren (want je pills vergelijken op 'all' en op v.slug)
    const value = found ? found.slug || found.name : vibeParam;

    // normalize "alle vibes" varianten → 'all'
    const normalized = (() => {
      const s = String(value || '')
        .toLowerCase()
        .trim();
      if (
        s === 'all' ||
        s === 'alle vibes' ||
        s === 'all vibes' ||
        s === 'alle-vibes' ||
        s === 'alle_vibes'
      ) {
        return 'all';
      }
      return value;
    })();

    setSelectedCategory(null);
    setSelectedVibe(normalized);

    // ✅ naar resultaten view (niet overview grid)
    setIsOverview(false);

    // ✅ open direct de vibe filters
    setAdvancedOpen(true);

    // start op pagina 1
    setPage(1);
  }, [sourceVibes]);

  // ✅ handig: 1 reset-functie voor alle knoppen
  const resetAllFilters = () => {
    setSelectedCategory(null);
    setSelectedVibe('all');
    setSortOption('default');
    setPage(1);
    setAdvancedOpen(false);
  };

  // bij filter-wijzigingen altijd terug naar pagina 1
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedVibe, isOverview, sortOption]);

  const resetFiltersLabel =
    language === 'nl' ? 'Reset filters' : 'Reset filters';

  /* ---------- ICONS & LABELS (Urban, no-emoji) ---------- */

  const getCategoryLabel = (cat) => {
    if (!cat?.name) return '';
    return language === 'nl'
      ? cat.name_nl || cat.name
      : cat.name_en || cat.name;
  };
  const getVibeLabel = (vibe) => {
    if (!vibe?.name) return '';
    return language === 'nl'
      ? vibe.name_nl || vibe.name
      : vibe.name_en || vibe.name;
  };

  const pillButtonBase = {
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.04)',
    color: 'rgba(235,240,255,0.82)',

    // ✅ alleen linksboven + rechtsonder rond
    borderRadius: isMobile ? '12px 0 12px 0' : '14px 0 14px 0',

    padding: isMobile ? '10px 12px' : '10px 14px',
    fontFamily: THEME.font,
    fontSize: 13,
    fontWeight: 450,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    outline: 'none',
    boxShadow: 'none',
    transition:
      'transform 120ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease',
  };

  // ✅ active = NIET vullen, alleen tekst (en optioneel border) oranje
  const pillActive = {
    background: 'rgba(255,255,255,0.04)', // zelfde als base
    border: '1px solid rgba(255,107,61,0.55)',
    color: 'rgba(255,107,61,0.98)',
    boxShadow: 'none',
    transform: 'none',
  };

  // (optioneel) als je ergens selectedPillStyle gebruikt: laat ‘m gelijk aan pillActive
  const selectedPillStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,107,61,0.55)',
    color: 'rgba(255,107,61,0.98)',
  };

  function CategoryPill({ cat }) {
    const isSelected =
      selectedCategory?.slug === cat.slug ||
      selectedCategory?.name === cat.name;

    return (
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        style={{
          ...pillButtonBase,
          ...(isSelected ? pillActive : {}),
        }}
        onClick={() => {
          setSelectedCategory((cur) =>
            cur?.slug === cat.slug || cur?.name === cat.name ? null : cat
          );
          setSelectedVibe('all');
          setIsOverview(false);
          setAdvancedOpen(true);
          setPage(1);
        }}
      >
        <span>{getCategoryLabel(cat)}</span>
      </button>
    );
  }

  function VibePill({ vibe }) {
    const value = vibe.slug || vibe.name; // ✅ altijd slug prefereren
    const isSelected = selectedVibe === value;

    return (
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        style={{
          ...pillButtonBase,
          ...(isSelected ? pillActive : null),
        }}
        onClick={() => {
          rememberVibeScroll();

          setSelectedVibe((cur) => (cur === value ? 'all' : value));

          requestAnimationFrame(() => {
            if (vibePillsRef.current) {
              vibePillsRef.current.scrollLeft = vibePillsScrollLeftRef.current;
            }
          });
        }}
      >
        <span>{getVibeLabel(vibe)}</span>
      </button>
    );
  }

  /* ---------- LAYOUT ---------- */

  const pageOuterStyle = {
    minHeight: '100vh',
    background: 'var(--lokaly-bg)', // ✅ exact zwart (of jouw dark var)
    color: 'var(--lokaly-text)', // ✅ default tekstkleur licht
  };

  const sectionStyle = {
    padding: isMobile ? '72px 14px 28px' : '96px 64px 56px',

    // ✅ full width zoals homepage
    width: '100%',
    maxWidth: 'none',
    margin: 0,
  };

  const headerStyle = {
    marginTop: isMobile ? 10 : 14,
    marginBottom: isMobile ? 16 : 18,
  };

  const hasSpecificCategory = !!selectedCategory;

  const titleText = hasSpecificCategory
    ? language === 'nl'
      ? `Locaties in ontdek ${selectedCategory.name}`
      : `Locations in discover ${selectedCategory.name}`
    : language === 'nl'
    ? 'Alle locaties'
    : 'All locations';

  const subtitleText = hasSpecificCategory
    ? language === 'nl'
      ? 'Filter op inspiratie om je perfecte volgende uitje te vinden.'
      : 'Filter by inspiration to find your next perfect outing.'
    : language === 'nl'
    ? 'Filter op inspiratie en ontdek om je perfecte volgende uitje te vinden.'
    : 'Filter by inspiration and discover to find your next perfect outing.';

  const titleStyle = {
    margin: 0,
    fontFamily: THEME.fontDisplay,
    fontWeight: 600,
    fontSize: isMobile ? 26 : 34,
    letterSpacing: -0.2,
    color: 'rgba(235,240,255,0.92)',
  };

  const descStyle = {
    margin: isMobile ? '4px 0 0 0' : '2px 0 0 0',
    fontFamily: THEME.font,
    fontSize: isMobile ? 14 : 13,
    lineHeight: isMobile ? 1.35 : 1.3,
    fontWeight: 450,
    color: 'rgba(235,240,255,0.72)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minHeight: isMobile ? '2.7em' : '2.6em',
  };

  // Compact “filters card”
  const filtersWrapperStyle = {
    marginTop: 12,
    marginBottom: 14,
    padding: isMobile ? 10 : 12,
    borderRadius: 18,
    background: 'rgba(255,255,255,0.72)',
    border: '1px solid rgba(15,23,42,0.10)',
    boxShadow: '0 16px 38px rgba(15,23,42,0.10)',
    backdropFilter: 'blur(10px)',
  };

  const filterLabelStyle = {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'rgba(15,23,42,0.55)',
    marginBottom: 8,
  };

  const filterRowStyle = {
    display: 'flex',
    gap: 8, // ✅ iets kleiner
    flexWrap: isMobile ? 'nowrap' : 'wrap',
    overflowX: isMobile ? 'auto' : 'visible',
    WebkitOverflowScrolling: 'touch',
    paddingBottom: isMobile ? 6 : 0,
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };

  const compactFilterBarStyle = {
    marginTop: 10,
    marginBottom: 10,
    padding: '10px 12px',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.60)',
    border: '1px solid rgba(15,23,42,0.10)',
    boxShadow: '0 14px 30px rgba(15,23,42,0.08)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  };

  const compactTagsStyle = {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'center',
  };

  const compactTagStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 999,

    background: 'var(--lokaly-surface)',
    border: '1px solid var(--lokaly-border)',
    color: 'var(--lokaly-text)',

    fontSize: 12,
    fontWeight: 800,
  };

  const compactActionsStyle = {
    display: 'flex',
    gap: 8,
    flexShrink: 0,
  };

  const smallActionBtn = (active = false) => ({
    ...pillButtonBase,
    padding: '8px 12px',
    borderRadius: 999,
    background: active ? THEME.orangeSoft : 'rgba(11,11,12,0.05)',
    border: active
      ? `1px solid ${THEME.orangeBorder}`
      : '1px solid rgba(15,23,42,0.10)',
    boxShadow: active ? '0 14px 30px rgba(15,23,42,0.10)' : 'none',
  });

  const backLinkStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 14,
    color: 'rgba(148,163,184,0.9)',
    cursor: 'pointer',
    marginBottom: 26,
  };

  const introLiftWrapStyle = {
    position: 'relative',
    top: isMobile ? -22 : -28, // 👈 hoger = groter gat eronder
  };

  const resetButtonStyle = {
    border: 'none',
    background: 'transparent',
    padding: 0,
    color: THEME.muted,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    textDecoration: 'underline',
    textUnderlineOffset: 3,
  };

  const resultsTopBarStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 2,
    marginBottom: 10,
    flexWrap: isMobile ? 'wrap' : 'nowrap',
  };

  const sortControlStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'flex-end',
    flexShrink: 0,
  };

  const sortLabelStyle = {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'rgba(15,23,42,0.45)',
  };

  const sortDropdownWrapStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
  };

  const sortSelectStyle = {
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',

    height: 40,
    minWidth: 170,
    padding: '0 40px 0 16px',

    // ✅ zelfde hoekstijl als je chips
    borderRadius: '16px 0 16px 0',
    border: '1px solid rgba(255,255,255,0.10)',

    // ✅ donkere background zodat tekst altijd leesbaar is
    background: 'rgba(12,12,13,0.88)',
    color: 'rgba(235,240,255,0.88)',

    fontFamily: THEME.font,
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '-0.01em',

    // ✅ dit helpt Chrome/Edge om het dropdown menu ook “dark” te renderen
    colorScheme: 'dark',

    outline: 'none',
    cursor: 'pointer',
    boxShadow: 'none',
  };

  const sortChevronStyle = {
    position: 'absolute',
    right: 14,
    pointerEvents: 'none',
    color: 'rgba(235,240,255,0.55)',
    fontSize: 12,
    lineHeight: '12px',
  };

  // desktop: grid naast elkaar; mobiel: onder elkaar
  const listStyle = isMobile
    ? {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        marginTop: 12,
      }
    : {
        display: 'grid',

        // ✅ kleiner min = meer kaarten per rij
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',

        // ✅ dichter op elkaar (horizontaal + verticaal)
        columnGap: 10,
        rowGap: 10,

        alignItems: 'stretch',
        width: '100%',
        marginTop: 16,
      };

  const countLabelStyle = {
    fontSize: 13,
    color: 'rgba(148,163,184,0.7)',
    marginBottom: 12,
  };

  const paginationRowStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: isMobile ? 'center' : 'flex-start',
    marginTop: 18,
  };

  const pagePillStyle = {
    ...pillButtonBase,
    padding: isMobile ? '6px 10px' : '7px 12px',
    fontSize: 12,
  };

  const dotsStyle = {
    padding: isMobile ? '6px 8px' : '7px 10px',
    color: 'rgba(148,163,184,0.75)',
    fontSize: 12,
    userSelect: 'none',
  };

  // ✅ Nieuwe compacte “pill bar” look (zoals je voorbeeld)
  const pillsTrayStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    overflowX: 'auto',
    overflowY: 'hidden',
    padding: '4px 2px 6px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };

  const filtersAreaStyle = {
    marginTop: 14,
    padding: isMobile ? 14 : 16,
    borderRadius: isMobile ? '16px 0 16px 0' : '18px 0 18px 0',
    border: 'none',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    boxShadow: '0 22px 70px rgba(0,0,0,0.40)',
  };

  const filtersTopRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  };

  const miniLabelStyle = {
    fontFamily: THEME.font,
    fontSize: 11,
    letterSpacing: 0.22,
    textTransform: 'uppercase',
    color: 'rgba(235,240,255,0.55)',
  };

  const actionRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  };

  const minimalBtnStyle = {
    ...pillButtonBase,
    height: 34,
    padding: '0 12px',
  };

  const advancedBtnStyle = (active) => ({
    ...pillButtonBase,
    ...(active ? selectedPillStyle : {}),
  });

  // ✅ Reset als tekst (geen rand/achtergrond)
  const resetTextBtnStyle = {
    border: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
    fontFamily: THEME.font,
    fontSize: 12.5,
    fontWeight: 450,
    color: 'rgba(235,240,255,0.82)',
    cursor: 'pointer',
    lineHeight: 1,
  };

  // ✅ Minimalistische dropdown icon button
  const dropdownIconBtnStyle = {
    border: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
    width: 22,
    height: 22,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'rgba(235,240,255,0.82)',
  };

  // 👉 alle filterlogica op 1 plek
  const locationsToRender = useMemo(() => {
    let base = sourceLocations;

    // --- 1. Filter op categorie (via slug of naam) ---
    if (selectedCategory) {
      const targetSlug = selectedCategory.slug || null;
      const targetName = selectedCategory.name || null;

      base = base.filter((loc) => {
        const locCategoryNames = Array.isArray(loc.categoryNames)
          ? loc.categoryNames
          : Array.isArray(loc.category_names)
          ? loc.category_names
          : [loc.categoryName || null].filter(Boolean);

        const locCategorySlugs = Array.isArray(loc.categorySlugs)
          ? loc.categorySlugs
          : Array.isArray(loc.category_slugs)
          ? loc.category_slugs
          : [loc.categorySlug || loc.type || loc.categoryType || null].filter(
              Boolean
            );

        const slugMatch =
          targetSlug &&
          locCategorySlugs.some(
            (slug) =>
              slug && String(slug).toLowerCase() === targetSlug.toLowerCase()
          );
        const nameMatch =
          targetName &&
          locCategoryNames.some(
            (name) =>
              name && String(name).toLowerCase() === targetName.toLowerCase()
          );

        return slugMatch || nameMatch;
      });
    }

    // --- 2. Optioneel filter op vibe ---
    if (selectedVibe && selectedVibe !== 'all') {
      base = base.filter((loc) => {
        const locVibeNames = Array.isArray(loc.vibeNames)
          ? loc.vibeNames
          : Array.isArray(loc.vibe_names)
          ? loc.vibe_names
          : [loc.vibe || loc.vibeName || null].filter(Boolean);

        const locVibeSlugs = Array.isArray(loc.vibeSlugs)
          ? loc.vibeSlugs
          : [loc.vibeSlug || null].filter(Boolean);

        const target = selectedVibe.toLowerCase();

        const nameMatch = locVibeNames.some(
          (name) => name && String(name).toLowerCase() === target
        );

        const slugMatch = locVibeSlugs.some(
          (slug) => slug && String(slug).toLowerCase() === target
        );

        return nameMatch || slugMatch;
      });
    }

    return base;
  }, [sourceLocations, selectedCategory, selectedVibe]);
  const sortedLocations = useMemo(() => {
    const arr = [...locationsToRender];

    const locale = language === 'nl' ? 'nl-NL' : 'en-US';
    const nameOf = (x) => (x?.name || '').toString();

    if (sortOption === 'az') {
      arr.sort((a, b) =>
        nameOf(a).localeCompare(nameOf(b), locale, { sensitivity: 'base' })
      );
    } else if (sortOption === 'za') {
      arr.sort((a, b) =>
        nameOf(b).localeCompare(nameOf(a), locale, { sensitivity: 'base' })
      );
    } else if (sortOption === 'rating_desc') {
      arr.sort((a, b) => {
        const rb = Number(b?.rating || 0);
        const ra = Number(a?.rating || 0);
        return (
          rb - ra ||
          nameOf(a).localeCompare(nameOf(b), locale, { sensitivity: 'base' })
        );
      });
    }

    return arr;
  }, [locationsToRender, sortOption, language]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedLocations.length / RESULTS_PER_PAGE)
  );

  const safePage = Math.min(page, totalPages);

  // als filters minder resultaten geven en je "te ver" zit, clamp terug
  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const pagedLocations = useMemo(() => {
    const start = (safePage - 1) * RESULTS_PER_PAGE;
    return sortedLocations.slice(start, start + RESULTS_PER_PAGE);
  }, [sortedLocations, safePage, RESULTS_PER_PAGE]);

  const rangeStart =
    locationsToRender.length > 0 ? (safePage - 1) * RESULTS_PER_PAGE + 1 : 0;
  const rangeEnd = Math.min(
    safePage * RESULTS_PER_PAGE,
    sortedLocations.length
  );

  const pageTokens = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const tokens = [1];
    const left = Math.max(2, safePage - 1);
    const right = Math.min(totalPages - 1, safePage + 1);

    if (left > 2) tokens.push('…');
    for (let p = left; p <= right; p++) tokens.push(p);
    if (right < totalPages - 1) tokens.push('…');
    tokens.push(totalPages);

    return tokens;
  }, [safePage, totalPages]);

  // ===================== CATEGORY OVERVIEW (Old tiles + Lokaly polish) =====================
  if (isOverview) {
    const cats = (sourceCategories || []).filter(
      (c) => c?.is_active !== false && c?.slug !== 'all'
    );

    const ovWrapStyle = {
      ...pageOuterStyle, // ✅ fix (was .pageOuterStyle)
    };

    const ovSectionStyle = {
      padding: isMobile ? '78px 14px 28px' : '96px 64px 56px',
      maxWidth: 1240,
      margin: '0 auto',
    };

    const ovHeaderStyle = {
      marginBottom: isMobile ? 14 : 18,
    };

    const ovTitleStyle = {
      margin: 0,
      fontFamily: THEME.fontDisplay, // zelfde “display” font als homepage
      fontWeight: 500, // ✅ dunner dan 600
      fontSize: isMobile ? 26 : 34,
      letterSpacing: -0.3, // ✅ net wat strakker
      color: 'rgba(235,240,255,0.92)',
    };

    const ovSubStyle = {
      marginTop: 6,
      fontFamily: THEME.font, // body font zoals homepage
      fontSize: 14,
      fontWeight: 400, // ✅ dunner dan 450
      lineHeight: 1.5,
      maxWidth: 720,
      letterSpacing: 0.05,
      color: 'rgba(235,240,255,0.72)',
    };

    const gridStyle = {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? 'repeat(2, minmax(0, 1fr))'
        : 'repeat(3, minmax(0, 1fr))',
      gap: isMobile ? 12 : 16,
    };

    // “Nav button” rounding: links-boven & rechts-onder rond
    const tileBase = {
      position: 'relative',
      border: 'none',
      outline: 'none',
      WebkitTapHighlightColor: 'transparent',
      borderRadius: isMobile ? '18px 0 18px 0' : '22px 0 22px 0',
      overflow: 'hidden',
      cursor: 'pointer',
      padding: isMobile ? 14 : 16,
      textAlign: 'left',
      minHeight: isMobile ? 118 : 164,
      boxShadow: '0 18px 44px rgba(0,0,0,0.35)',
      transition: 'transform 160ms ease, box-shadow 200ms ease',
      background: 'var(--lokaly-surface)',
    };

    // ✅ Eerst imgSize bepalen (moet boven tileTitle!)
    const tileMinH = isMobile ? 118 : 164; // match met tileBase minHeight
    const imgSize = Math.round(tileMinH * (isMobile ? 0.72 : 0.78));
    const imgOffsetX = Math.round(imgSize * 0.15);
    const imgOffsetY = Math.round(imgSize * 0.34);

    const tileTitle = {
      fontFamily: THEME.fontDisplay || THEME.font,
      fontWeight: 500, // ✅ dunner
      letterSpacing: -0.3, // ✅ strakker
      lineHeight: 1.14,
      margin: 0,

      // ✅ ruimte voor image frame rechts (nu werkt imgSize)
      paddingRight: Math.max(isMobile ? 62 : 90, Math.round(imgSize * 0.62)),

      paddingBottom: 2,
      display: 'block',
      maxWidth: '100%',
    };

    // ✅ Image frame (responsief)
    const catImgWrap = {
      position: 'absolute',
      right: -imgOffsetX,
      bottom: -imgOffsetY,
      width: imgSize,
      height: imgSize,
      borderRadius: 6,
      overflow: 'hidden',
      transform: 'rotate(16deg)',
      boxShadow: '0 22px 46px rgba(0,0,0,0.32)',
      border: 'none',
      background: 'transparent',
      pointerEvents: 'none',
    };

    const catImg = {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
    };

    function splitTitleLines(name = '') {
      const raw = String(name).trim();
      if (!raw) return [];

      // Split op spaties, maar plak "&" aan het woord ervoor: "Arcades &" / "Retro"
      const parts = raw.split(/\s+/);
      const lines = [];

      for (let i = 0; i < parts.length; i++) {
        const w = parts[i];
        if (w === '&' && lines.length > 0) {
          lines[lines.length - 1] = `${lines[lines.length - 1]} &`;
        } else {
          lines.push(w);
        }
      }

      return lines;
    }

    function getTitleFontSize(name = '', isMobile = false) {
      const n = String(name);
      const len = n.length;

      // basis (kleiner)
      let size = isMobile ? 16 : 20;

      // langer = kleiner
      if (len >= 18) size = isMobile ? 15 : 18;
      if (len >= 26) size = isMobile ? 14 : 16;
      if (len >= 34) size = isMobile ? 13 : 15;

      return size;
    }

    return (
      <div style={ovWrapStyle}>
        <section style={ovSectionStyle}>
          <header style={ovHeaderStyle}>
            <h1 style={ovTitleStyle}>
              {language === 'nl' ? 'Inspiratie' : 'Inspiration'}
            </h1>
            <div style={ovSubStyle}>
              {language === 'nl'
                ? 'Browse door alle inspiratie en ontdek wat past bij jouw mood.'
                : 'Browse all inspiration and discover what fits your mood.'}
            </div>
          </header>

          <div style={gridStyle}>
            {sourceVibes.map((vibe) => {
              const displayName =
                language === 'nl'
                  ? vibe?.name_nl || vibe?.name || ''
                  : vibe?.name_en || vibe?.name_nl || vibe?.name || '';

              const th = getVibeTheme(vibe);
              const key = vibe?.id || vibe?.slug || vibe?.name;
              const slugKey = String(vibe?.slug || '')
                .toLowerCase()
                .trim();
              const isHover = hoveredCat === (vibe?.slug || key);

              const VIBE_PAGE_STYLE_MAP = {
                'date-night': { a: '#FB7185', b: '#DB2777' },
                'met-de-crew': { a: '#3B82F6', b: '#22D3EE' },
                'family-time': { a: '#22C55E', b: '#84CC16' },
                'solo-mission': { a: '#7C3AED', b: '#A855F7' },
                'rainy-day': { a: '#475569', b: '#94A3B8' },
                'na-het-werk': { a: '#F97316', b: '#F59E0B' },
                'weekend-pick': { a: '#EAB308', b: '#F97316' },
                'late-night': { a: '#4C1D95', b: '#7C3AED' },
                'easy-going': { a: '#14B8A6', b: '#60A5FA' },
                'actie-aan': { a: '#F97316', b: '#EF4444' },
                'culture-fix': { a: '#4F46E5', b: '#A855F7' },
                'even-opladen': { a: '#2DD4BF', b: '#22C55E' },
                'iets-anders': { a: '#EC4899', b: '#8B5CF6' },
                'lekker-spelen': { a: '#F59E0B', b: '#FDE047' },
                'impressie-maken': { a: '#0EA5E9', b: '#3B82F6' },
                buitenlucht: { a: '#16A34A', b: '#22C55E' },
                'binnen-knus': { a: '#A78BFA', b: '#F472B6' },
                feestmodus: { a: '#D946EF', b: '#8B5CF6' },
              };

              const homepageColors = VIBE_PAGE_STYLE_MAP[slugKey];

              return (
                <button
                  key={key}
                  onClick={() => {
                    const value = vibe?.slug || vibe?.name;
                    setSelectedCategory(null);
                    setSelectedVibe(value);
                    setAdvancedOpen(true);
                    setPage(1);
                    setIsOverview(false);
                  }}
                  onMouseEnter={() => setHoveredCat(vibe?.slug || key)}
                  onMouseLeave={() => setHoveredCat(null)}
                  style={{
                    ...tileBase,
                    background: homepageColors
                      ? `linear-gradient(135deg, ${homepageColors.a} 0%, ${homepageColors.b} 100%)`
                      : th?.bg || tileBase.background,
                    transform: isHover ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: isHover
                      ? '0 22px 52px rgba(0,0,0,0.45)'
                      : tileBase.boxShadow,
                  }}
                >
                  <h3
                    style={{
                      ...tileTitle,
                      color: '#FFFFFF',
                      fontSize: isMobile
                        ? Math.max(12, getTitleFontSize(displayName, true) - 1)
                        : getTitleFontSize(displayName, false),
                      lineHeight: isMobile ? 1.05 : 1.02,
                      maxWidth: isMobile ? '58%' : tileTitle.maxWidth,
                    }}
                  >
                    {splitTitleLines(displayName)
                      .slice(0, isMobile ? 3 : 3)
                      .map((line, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: 'block',
                            whiteSpace: 'normal',
                            overflow: 'visible',
                            textOverflow: 'clip',
                          }}
                        >
                          {line}
                        </span>
                      ))}
                  </h3>

                  {!!th?.cover && (
                    <div style={catImgWrap}>
                      <img src={th.cover} alt={displayName} style={catImg} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  /* ========= VIEW 2: DETAIL (FILTERS + LOCATIES) ========= */

  return (
    <div style={pageOuterStyle}>
      <section style={sectionStyle}>
        <div style={introLiftWrapStyle}>
          <div style={backLinkStyle} onClick={() => setIsOverview(true)}>
            <span style={{ fontSize: 18, transform: 'translateY(1px)' }}>
              ←
            </span>
            <span>
              {language === 'nl'
                ? 'Terug naar ontdek'
                : 'Back to discover'}
            </span>
          </div>

          <header style={headerStyle}>
            <h1 style={titleStyle}>{titleText}</h1>
            <p style={descStyle}>{subtitleText}</p>
          </header>
        </div>

        {/* ✅ Filters (zonder omkaderend blok) */}

        {/* ✅ Filters (zonder omkaderend blok) */}

        {/* Top row: label + acties */}
        <div style={filtersTopRowStyle}>
          <div style={miniLabelStyle}>
            {language === 'nl' ? 'Ontdek' : 'Discover'}
          </div>

          <div style={actionRowStyle}>
            <button
              type="button"
              style={resetTextBtnStyle}
              onClick={resetAllFilters}
            >
              {language === 'nl' ? 'Reset' : 'Reset'}
            </button>

            {advancedOpen && (
              <button
                type="button"
                style={minimalBtnStyle}
                onClick={() => setAdvancedOpen(false)}
              >
                {language === 'nl' ? 'Sluit' : 'Close'}
              </button>
            )}
          </div>
        </div>

        {/* ✅ BAR 1: Categorieën */}
        <div
          ref={catPillsRef}
          style={pillsTrayStyle}
          onScroll={rememberCatScroll}
        >
          <button
            type="button"
            style={{
              ...pillButtonBase,
              ...(!selectedCategory ? selectedPillStyle : {}),
            }}
            onClick={() => {
              setSelectedCategory(null);
              setSelectedVibe('all');
              setSortOption('default');
              setPage(1);
            }}
          >
            <span>
              {language === 'nl' ? 'Alle ontdek' : 'All discover'}
            </span>
          </button>

          {sourceCategories.map((cat) => (
            <CategoryPill key={cat.id || cat.slug || cat.name} cat={cat} />
          ))}
        </div>

        {/* ✅ Geavanceerd zoeken knop */}
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            style={dropdownIconBtnStyle}
            aria-label={
              language === 'nl'
                ? advancedOpen
                  ? 'Vibes inklappen'
                  : 'Vibes uitklappen'
                : advancedOpen
                ? 'Collapse vibes'
                : 'Expand vibes'
            }
            title={
              language === 'nl'
                ? advancedOpen
                  ? 'Vibes inklappen'
                  : 'Vibes uitklappen'
                : advancedOpen
                ? 'Collapse vibes'
                : 'Expand vibes'
            }
          >
            <span
              style={{
                display: 'inline-block',
                fontSize: 16,
                lineHeight: '16px',
                transform: advancedOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 160ms ease',
              }}
            >
              ▾
            </span>
          </button>

          {!advancedOpen && selectedVibe !== 'all' && (
            <span style={{ fontSize: 13, color: 'var(--lokaly-muted)' }}>
              {language === 'nl'
                ? `Vibe: ${selectedVibe}`
                : `Vibe: ${selectedVibe}`}
            </span>
          )}
        </div>

        {/* ✅ BAR 2: Vibes */}
        {advancedOpen && (
          <div style={{ marginTop: 10 }}>
            <div style={{ ...miniLabelStyle, marginBottom: 8 }}>Vibes</div>

            <div
              ref={vibePillsRef}
              style={pillsTrayStyle}
              onScroll={rememberVibeScroll}
            >
              <button
                type="button"
                style={{
                  ...pillButtonBase,
                  ...(selectedVibe === 'all' ? selectedPillStyle : {}),
                }}
                onClick={() => {
                  setSelectedVibe('all');
                  setPage(1);
                }}
              >
                <span>{language === 'nl' ? 'Alle inspiratie' : 'All inspiration'}</span>
              </button>

              {sourceVibes
                .filter(
                  (v) =>
                    v.slug !== 'all' &&
                    v.name !== 'Alle vibes' &&
                    v.name !== 'All vibes'
                )
                .map((vibe) => (
                  <VibePill
                    key={vibe.id || vibe.slug || vibe.name}
                    vibe={vibe}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Resultaten */}
        <div>
          <div style={resultsTopBarStyle}>
            <div style={{ ...countLabelStyle, marginBottom: 0 }}>
              {locationsToRender.length === 0
                ? language === 'nl'
                  ? 'Geen locaties gevonden.'
                  : 'No locations found.'
                : language === 'nl'
                ? `Toont ${rangeStart}-${rangeEnd} van ${sortedLocations.length} resultaten (pagina ${safePage}/${totalPages})`
                : `Showing ${rangeStart}-${rangeEnd} of ${locationsToRender.length} results (page ${safePage}/${totalPages})`}
            </div>

            <div style={sortControlStyle}>
              <div style={sortControlStyle}>
                <div style={sortDropdownWrapStyle}>
                  <select
                    value={sortOption}
                    onChange={(e) => {
                      setSortOption(e.target.value);
                      setPage(1);
                    }}
                    style={sortSelectStyle}
                    aria-label={language === 'nl' ? 'Sorteren' : 'Sort'}
                  >
                    <option value="default">
                      {language === 'nl' ? 'Aanbevolen' : 'Recommended'}
                    </option>
                    <option value="az">A–Z</option>
                    <option value="za">Z–A</option>
                    <option value="rating_desc">
                      {language === 'nl' ? 'Rating' : 'Rating'}
                    </option>
                  </select>
                  <span style={sortChevronStyle}>▾</span>
                </div>
              </div>
            </div>
          </div>

          <div style={listStyle}>
            {locationsLoading ? (
              <SkeletonGrid count={9} />
            ) : (
              pagedLocations.map((loc) =>
                isMobile ? (
                  <CategoryResultRowCard
                    key={loc.id || loc.name}
                    loc={loc}
                    language={language}
                    onClick={(picked) => onLocationClick?.(picked)}
                  />
                ) : (
                  <LocationCard
                    key={loc.id || loc.name}
                    loc={loc}
                    onClick={() => onLocationClick?.(loc)}
                    language={language}
                    forceFullWidthOnMobile={true}
                    isFavorite={favoriteIds?.has?.(loc.id) || false}
                    onToggleFavorite={onToggleFavorite}
                  />
                )
              )
            )}
          </div>

          {!locationsLoading && totalPages > 1 && (
            <div
              style={{
                ...paginationRowStyle,
                width: '100%',
                justifyContent: 'center',
                marginTop: 18,
              }}
            >
              <button
                type="button"
                style={{
                  ...pagePillStyle,
                  ...(safePage === 1
                    ? { opacity: 0.45, cursor: 'not-allowed' }
                    : {}),
                }}
                onClick={() =>
                  safePage > 1 && setPage((p) => Math.max(1, p - 1))
                }
              >
                {language === 'nl' ? 'Vorige' : 'Prev'}
              </button>

              {pageTokens.map((token, idx) =>
                token === '…' ? (
                  <span key={`dots-${idx}`} style={dotsStyle}>
                    …
                  </span>
                ) : (
                  <button
                    key={`page-${token}`}
                    type="button"
                    style={{
                      ...pagePillStyle,
                      ...(token === safePage ? selectedPillStyle : {}),
                    }}
                    onClick={() => setPage(token)}
                  >
                    {token}
                  </button>
                )
              )}

              <button
                type="button"
                style={{
                  ...pagePillStyle,
                  ...(safePage === totalPages
                    ? { opacity: 0.45, cursor: 'not-allowed' }
                    : {}),
                }}
                onClick={() =>
                  safePage < totalPages &&
                  setPage((p) => Math.min(totalPages, p + 1))
                }
              >
                {language === 'nl' ? 'Volgende' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ===================== ADMIN DASHBOARD ===================== */

function AdminDashboard({
  language,
  user,
  profile,
  categories,
  vibes,
  onRefreshLocations,
  locations,
  onOpenLocation,
}) {
  const isMobile = useIsMobile();
  const isAdmin = !!profile?.is_admin;
  // --- Admin LIGHT theme (white bg + black text) ---
  const ADMIN = {
    bg: '#FFFFFF',
    surface: '#FFFFFF', // cards/panels
    surface2: '#F6F7F9', // subtiele blokken / inputs
    border: 'rgba(15,23,42,0.12)',

    text: '#0B0B0C',
    muted: 'rgba(11,11,12,0.62)',
    faint: 'rgba(11,11,12,0.46)',

    // accent mag oranje blijven (optioneel)
    orange: THEME.orange,
    orangeBorder: 'rgba(255,107,61,0.35)',
  };

  const [tab, setTab] = useState('events'); // events | new | stats
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const [districts, setDistricts] = useState([]);

  // lijst
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all'); // all | published | draft
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState('updated_desc'); // updated_desc | updated_asc | name_asc | name_desc | top10_asc
  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 10 / 25 / 50

  const [top10Open, setTop10Open] = useState(false);
  const [heroOpen, setHeroOpen] = useState(false);
  const [topViewedOpen, setTopViewedOpen] = useState(false);
  const [topFavOpen, setTopFavOpen] = useState(false);
  const [editingExisting, setEditingExisting] = useState(false);
  const [topEventClicksOpen, setTopEventClicksOpen] = useState(false);

  // reset terug naar pagina 1 als je zoek/filter/sort wijzigt
  useEffect(() => {
    setPage(1);
  }, [q, filter, sortBy, pageSize]);

  // edit/create
  const emptyForm = {
    id: null,
    name: '',
    description_short: '',
    description_long: '', // ✅ NIEUW
    address: '',
    lat: '',
    lng: '',
    district_id: '',
    category_id: '',
    vibe_id: '',
    category_ids: [],
    vibe_ids: [],
    home_section: '',
    website_url: '',
    booking_url: '',
    is_featured: false,
    hero_featured: false,
    top10_rank: '',
    opening_hours: '',
    opening_hours_v2: null,
    is_published: false,
    mediaFiles: [],
    thumbnailPick: 0,
    image_url: '',
    price_min: '',
    price_max: '',
    is_free: false,
    price_items: [],
    price_note: '',
    price_source_url: '',
  };

  const [form, setForm] = useState(emptyForm);
  // --- media (bestaande gallery items voor dit event) ---
  const [existingMedia, setExistingMedia] = useState([]);
  const [existingMediaLoading, setExistingMediaLoading] = useState(false);

  // --- previews voor nieuw geselecteerde uploads (local object URLs) ---
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState([]);

  const addPriceItem = () => {
    setForm((p) => ({
      ...p,
      price_items: [
        ...(Array.isArray(p.price_items) ? p.price_items : []),
        {
          title: '',
          type: 'fixed',
          amount: '',
          min: '',
          max: '',
          unit: 'p.p.',
          note: '',
        },
      ],
    }));
  };

  const updatePriceItem = (idx, patch) => {
    setForm((p) => {
      const arr = Array.isArray(p.price_items) ? [...p.price_items] : [];
      arr[idx] = { ...(arr[idx] || {}), ...patch };
      return { ...p, price_items: arr };
    });
  };

  const removePriceItem = (idx) => {
    setForm((p) => {
      const arr = Array.isArray(p.price_items) ? [...p.price_items] : [];
      arr.splice(idx, 1);
      return { ...p, price_items: arr };
    });
  };
  const DAYS = [
    { key: 'mon', nl: 'Ma', en: 'Mon' },
    { key: 'tue', nl: 'Di', en: 'Tue' },
    { key: 'wed', nl: 'Wo', en: 'Wed' },
    { key: 'thu', nl: 'Do', en: 'Thu' },
    { key: 'fri', nl: 'Vr', en: 'Fri' },
    { key: 'sat', nl: 'Za', en: 'Sat' },
    { key: 'sun', nl: 'Zo', en: 'Sun' },
  ];

  const TIME_OPTIONS = React.useMemo(() => {
    const out = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m++) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        out.push(`${hh}:${mm}`);
      }
    }
    return out;
  }, []);

  const getHoursV2 = () =>
    form.opening_hours_v2 && typeof form.opening_hours_v2 === 'object'
      ? form.opening_hours_v2
      : {};

  const setDay = (dayKey, nextVal) => {
    setForm((p) => {
      const base =
        p.opening_hours_v2 && typeof p.opening_hours_v2 === 'object'
          ? p.opening_hours_v2
          : {};
      return {
        ...p,
        opening_hours_v2: {
          ...base,
          [dayKey]: nextVal, // null | {status:'closed'} | {status:'open', open, close}
        },
      };
    });
  };

  useEffect(() => {
    const files = form.mediaFiles || [];
    if (!files.length) {
      setMediaPreviewUrls([]);
      return;
    }

    const urls = files.map((f) => URL.createObjectURL(f));
    setMediaPreviewUrls(urls);

    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [form.mediaFiles]);

  const loadExistingMedia = async (locationId) => {
    if (!locationId) {
      setExistingMedia([]);
      return;
    }
    setExistingMediaLoading(true);
    try {
      const { data, error } = await supabase
        .from('location_media')
        .select('id, url, thumbnail_url, caption, order_index, created_at')
        .eq('location_id', locationId)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setExistingMedia(data || []);
    } finally {
      setExistingMediaLoading(false);
    }
  };

  const makeThumbnail = async (locationId, url) => {
    if (!locationId || !url) return;
    setLoading(true);
    resetMessages();
    try {
      const { error } = await supabase
        .from('locations')
        .update({ image_url: url })
        .eq('id', locationId);

      if (error) throw error;

      setForm((p) => ({ ...p, image_url: url }));
      setOk('Thumbnail bijgewerkt ✅');
      if (onRefreshLocations) await onRefreshLocations();
    } catch (e) {
      setErr(e?.message || 'Thumbnail wijzigen mislukt.');
    } finally {
      setLoading(false);
    }
  };

  const deleteMediaRow = async (mediaId) => {
    const sure = window.confirm('Afbeelding verwijderen?');
    if (!sure) return;

    setExistingMediaLoading(true);
    resetMessages();

    try {
      // 1) haal storage_path op
      const { data: row, error: getErr } = await supabase
        .from('location_media')
        .select('id, storage_path, url')
        .eq('id', mediaId)
        .single();

      if (getErr) throw getErr;

      // 2) delete uit storage (als storage_path bestaat)
      if (row?.storage_path) {
        const { error: storErr } = await supabase.storage
          .from('event-images')
          .remove([row.storage_path]);

        if (storErr) throw storErr;
      }

      // 3) delete db row
      const { error: delErr } = await supabase
        .from('location_media')
        .delete()
        .eq('id', mediaId);

      if (delErr) throw delErr;

      await loadExistingMedia(form.id);

      // 4) Als je net de thumbnail had weggegooid: zet thumbnail naar 1e overgebleven
      // (simpel MVP gedrag)
      const nextThumb = (existingMedia || []).find(
        (m) => m.id !== mediaId
      )?.url;
      if (
        form.image_url &&
        row?.url &&
        form.image_url === row.url &&
        nextThumb
      ) {
        await supabase
          .from('locations')
          .update({ image_url: nextThumb })
          .eq('id', form.id);
        setForm((p) => ({ ...p, image_url: nextThumb }));
      }

      setOk('Afbeelding verwijderd.');
    } catch (e) {
      setErr(e?.message || 'Verwijderen mislukt.');
    } finally {
      setExistingMediaLoading(false);
    }
  };

  const moveMedia = async (mediaId, dir) => {
    // dir = -1 (omhoog) of +1 (omlaag)
    const list = [...(existingMedia || [])].sort(
      (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
    );

    const idx = list.findIndex((m) => m.id === mediaId);
    const swapWith = list[idx + dir];
    if (idx < 0 || !swapWith) return;

    const a = list[idx];
    const b = swapWith;

    setExistingMediaLoading(true);
    resetMessages();

    try {
      // ✅ veilige fallback als order_index leeg is
      const aOrder = Number.isFinite(a.order_index) ? a.order_index : idx;
      const bOrder = Number.isFinite(b.order_index) ? b.order_index : idx + dir;

      // swap order_index
      const { error: e1 } = await supabase
        .from('location_media')
        .update({ order_index: bOrder })
        .eq('id', a.id);
      if (e1) throw e1;

      const { error: e2 } = await supabase
        .from('location_media')
        .update({ order_index: aOrder })
        .eq('id', b.id);
      if (e2) throw e2;

      await loadExistingMedia(form.id);
      setOk('Volgorde aangepast.');
    } catch (e) {
      setErr(e?.message || 'Volgorde wijzigen mislukt.');
    } finally {
      setExistingMediaLoading(false);
    }
  };

  const previewCat = useMemo(
    () =>
      (categories || []).find((c) => String(c.id) === String(form.category_id)),
    [categories, form.category_id]
  );

  const previewVibe = useMemo(
    () => (vibes || []).find((v) => String(v.id) === String(form.vibe_id)),
    [vibes, form.vibe_id]
  );

  // gallery voor preview = (1) nieuwe uploads previews, anders (2) bestaande media
  const previewMediaItems = useMemo(() => {
    const newOnes = (mediaPreviewUrls || []).map((url, idx) => ({
      id: `new-${idx}`,
      media_type: 'image',
      url,
      thumbnail_url: url,
      caption: form.name?.trim() || null,
      order_index: idx,
    }));

    const existingOnes = (existingMedia || []).map((m, idx) => ({
      id: m.id ?? `old-${idx}`,
      media_type: m.media_type || 'image',
      url: m.url,
      thumbnail_url: m.thumbnail_url || m.url,
      caption: m.caption || null,
      order_index: Number.isFinite(m.order_index) ? m.order_index : idx,
    }));

    return newOnes.length ? newOnes : existingOnes;
  }, [mediaPreviewUrls, existingMedia, form.name]);

  const previewImage =
    (mediaPreviewUrls?.length
      ? mediaPreviewUrls[
          Math.min(
            Math.max(
              Number.isInteger(form.thumbnailPick) ? form.thumbnailPick : 0,
              0
            ),
            mediaPreviewUrls.length - 1
          )
        ]
      : null) ||
    form.image_url ||
    '';

  const previewLocation = useMemo(() => {
    return {
      id: form.id || 'preview',
      name: form.name || 'Voorbeeld event',
      description_short: form.description_short || '',
      address: form.address || '',
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null,
      opening_hours: form.opening_hours || '',
      website: form.website_url || '',
      booking_url: form.booking_url || '',
      image_url: previewImage,

      category_id: form.category_id || null,
      vibe_id: form.vibe_id || null,
      categoryName: previewCat?.name || previewCat?.title || null,
      vibe: previewVibe?.name || previewVibe?.title || null,

      district_id: form.district_id || null,
    };
  }, [form, previewCat, previewVibe, previewImage]);

  // ---------- styles (lokaly-ish / clean) ----------
  const pageOuter = {
    width: '100%',
    minHeight: '100vh',
    background: '#FFFFFF',
    color: ADMIN.text,
    padding: isMobile ? '20px 16px 60px' : '24px 24px 70px',
  };

  const pageWrap = {
    width: '100%',
    maxWidth: 'none',
    margin: 0,
  };

  const h1 = {
    margin: 0,
    fontFamily: THEME.fontDisplay || THEME.font,
    fontWeight: 700,
    fontSize: isMobile ? 20 : 24,
    letterSpacing: -0.3,
    color: ADMIN.text,
  };

  const sub = {
    margin: '6px 0 0',
    color: ADMIN.muted,
    fontSize: 13.5,
    lineHeight: 1.5,
    fontWeight: 400,
  };

  const card = {
    marginTop: 16,
    border: 'none',
    background: 'transparent',
    borderRadius: 0,
    boxShadow: 'none',
    overflow: 'visible',
    color: ADMIN.text,
  };

  const cardInner = {
    padding: isMobile ? 14 : 16,
    color: ADMIN.text,
  };

  const topBar = {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isMobile ? 12 : 14,
    background: 'transparent',
    borderBottom: 'none',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    color: ADMIN.text,
  };

  // Segmented control (light)
  const tabs = {
    display: 'inline-flex',
    gap: 6,
    padding: 5,
    borderRadius: 999,
    border: `1px solid ${ADMIN.border}`,
    background: ADMIN.surface2,
  };

  const tabBtn = (active) => ({
    height: 36,
    padding: '0 14px',
    borderRadius: 999,
    border: active
      ? `1px solid ${ADMIN.orangeBorder}`
      : `1px solid transparent`,
    background: active ? 'rgba(255,107,61,0.14)' : 'transparent',

    color: active ? ADMIN.orange : ADMIN.text,

    fontSize: 13,
    fontWeight: active ? 600 : 500,
    cursor: 'pointer',
    outline: 'none',
  });

  const label = {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: ADMIN.faint,
    marginBottom: 8,
  };

  const input = {
    width: '100%',
    height: 44,
    padding: '0 14px',
    borderRadius: 12,
    border: `1px solid ${ADMIN.border}`,
    background: '#FFFFFF',
    color: ADMIN.text,
    fontFamily: THEME.font,
    fontSize: 13.5,
    fontWeight: 400,
    outline: 'none',
    boxShadow: 'none',
  };

  const row2 = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: 12,
    alignItems: 'end',
  };

  const actionsRow = {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: isMobile ? 'flex-start' : 'flex-end',
    marginTop: 12,
  };

  const newEditStack = {
    display: 'grid',
    gap: 14,
  };

  const newEditActions = {
    display: 'grid',
    gap: 10,
    marginTop: 14,
  };

  const newEditBtnRow3 = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
    gap: 8,
  };

  const newEditBtnRow2 = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
    gap: 8,
  };

  const newEditBtnFull = {
    width: '100%',
    justifyContent: 'center',
  };

  // --- NEW/EDIT layout helpers (strak & consistent met Events-tab) ---
  const newEditHeader = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  };

  const newEditTitle = {
    fontFamily: THEME.fontDisplay,
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: -0.2,
    color: ADMIN.text,
  };

  const newEditSub = {
    fontSize: 13,
    fontWeight: 400,
    letterSpacing: 0,
    color: ADMIN.muted,
  };

  const statusPill = (published) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 10px',
    borderRadius: 999,
    border: `1px solid ${published ? 'rgba(22,101,52,0.25)' : THEME.border}`,
    background: published ? 'rgba(22,101,52,0.10)' : 'rgba(15,23,42,0.06)',
    color: published ? '#166534' : 'rgba(15,23,42,0.70)',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '-0.01em',
  });

  const sectionCard = {
    border: `1px solid ${ADMIN.border}`,
    background: ADMIN.surface,
    borderRadius: 12,
    padding: 14,
    color: ADMIN.text,
  };

  const sectionKicker = {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: ADMIN.faint,
    marginBottom: 12,
  };

  // --- STATS (minimal + aligned with other admin pages) ---
  const statsHeaderRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 14,
    flexWrap: 'wrap',
    marginBottom: 4,
  };

  const statsTitle = {
    fontFamily: THEME.fontDisplay,
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: -0.1,
    color: ADMIN.text,
  };

  const statsSub = {
    fontSize: 13,
    fontWeight: 400,
    color: ADMIN.muted,
  };

  const kpiGrid = (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0, 1fr))',
    gap: 14,
  });

  const kpiCard = {
    ...sectionCard,
    padding: 16,
  };

  const kpiLabel = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'rgba(15,23,42,0.62)',
    marginBottom: 8,
  };

  const kpiValue = {
    fontFamily: THEME.fontDisplay,
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: -0.4,
  };

  const tableCard = {
    ...sectionCard,
    padding: 16,
  };

  const tableTitle = {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: ADMIN.faint,
    marginBottom: 12,
  };

  const statsTable = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thStyle = {
    padding: '12px 10px',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: ADMIN.faint,
    borderBottom: `1px solid ${ADMIN.border}`,
    whiteSpace: 'nowrap',
  };

  const tdStyle = {
    padding: '14px 10px',
    fontSize: 13.5,
    color: ADMIN.text,
    borderTop: `1px solid ${ADMIN.border}`,
    verticalAlign: 'middle',
  };

  const tdStrong = {
    ...tdStyle,
    fontWeight: 600,
  };

  const statusPillTiny = (published) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: 999,
    border: `1px solid ${published ? 'rgba(22,101,52,0.25)' : THEME.border}`,
    background: published ? 'rgba(22,101,52,0.10)' : 'rgba(15,23,42,0.06)',
    color: published ? '#166534' : 'rgba(15,23,42,0.70)',
    fontSize: 12,
    fontWeight: 850,
    letterSpacing: '0.01em',
  });

  const rightNum = {
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
  };

  const newEditGrid = (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1.55fr 0.95fr',
    gap: 16,
    alignItems: 'start',
  });

  const stickySide = (isMobile) => ({
    position: isMobile ? 'static' : 'sticky',
    top: 12,
  });

  const paginationRowStyle = {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    flexWrap: 'wrap',
  };

  // ✅ basis pill (bestaat hier nog niet → daarom crash)
  const pillButtonBase = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,

    border: `1px solid ${ADMIN.border}`,
    background: ADMIN.surface2, // ✅ lichtgrijs/witachtig
    color: 'rgba(11,11,12,0.72)', // ✅ zwart/grijs

    borderRadius: '16px 0 16px 0',
    padding: '0 12px',
    height: 34,

    fontFamily: THEME.font,
    fontSize: 13,
    fontWeight: 600,

    cursor: 'pointer',
    whiteSpace: 'nowrap',
    outline: 'none',
    boxShadow: 'none',
  };

  const pagePillStyle = {
    ...pillButtonBase,
    height: 32,
    padding: '0 10px',
    fontSize: 12.5,
  };

  const selectedPillStyle = {
    background: 'rgba(255,107,61,0.12)', // ✅ oranje soft
    border: `1px solid ${ADMIN.orangeBorder}`,
    color: ADMIN.text,
  };

  // ================== ADMIN TABLE (compact + icon actions) ==================
  // ================== ADMIN TABLE (compact + icon actions) ==================
  const adminTable = {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  };

  const th = {
    padding: '8px 8px',
    fontSize: 11,
    fontWeight: 700,
    color: 'rgba(11,11,12,0.55)', // ✅ zwart/grijs
  };

  const tdBase = {
    padding: '8px 8px',
    fontSize: 13,
    fontWeight: 520,
    color: ADMIN.text, // ✅ zwart
    verticalAlign: 'middle',
  };

  const tdName = {
    ...tdBase,
    fontWeight: 650,
    letterSpacing: -0.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const tdMuted = {
    ...tdBase,
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(11,11,12,0.62)', // ✅ zwart/grijs
  };

  const tdActions = {
    ...tdBase,
    padding: '6px 8px',
    textAlign: 'right',
  };

  const statusWrap = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(11,11,12,0.70)', // ✅ zwart/grijs
  };

  const statusDot = (published) => ({
    width: 10,
    height: 10,
    borderRadius: 999,
    background: published ? '#16a34a' : '#94a3b8', // groen / grijs
    boxShadow: '0 0 0 3px rgba(15,23,42,0.04)',
    flexShrink: 0,
  });

  const actionWrap = {
    display: 'inline-flex',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: isMobile ? 'wrap' : 'nowrap',
  };

  const iconBtn = ({ active = false, danger = false } = {}) => ({
    width: 34,
    height: 34,
    padding: 0,
    borderRadius: 999,

    border: `1px solid ${
      danger
        ? 'rgba(185,28,28,0.35)'
        : active
        ? 'rgba(255,106,0,0.35)'
        : 'var(--lokaly-border)'
    }`,

    background: danger
      ? 'rgba(185,28,28,0.10)'
      : active
      ? 'rgba(255,106,0,0.12)'
      : 'var(--lokaly-surface)',

    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',

    color: danger ? 'rgba(255,120,120,0.95)' : 'var(--lokaly-text)',
  });

  // ---------- Icons (admin actions) ----------
  const Icon = ({ children, size = 18, ...rest }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );

  const IEdit = (p) => (
    <Icon {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Icon>
  );

  const IEye = (p) => (
    <Icon {...p}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );

  const ITrash = (p) => (
    <Icon {...p}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </Icon>
  );

  const IPublish = (p) => (
    <Icon {...p}>
      <path d="M12 3v12" />
      <path d="M7 8l5-5 5 5" />
      <path d="M5 21h14" />
    </Icon>
  );

  const IUnpublish = (p) => (
    <Icon {...p}>
      <path d="M12 21V9" />
      <path d="M7 16l5 5 5-5" />
      <path d="M5 3h14" />
    </Icon>
  );

  const IPlus = (p) => (
    <Icon {...p}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Icon>
  );

  const IRefresh = (p) => (
    <Icon {...p}>
      <path d="M21 3v6h-6" />
      <path d="M21 9a9 9 0 1 1-2.64-6.36L21 9" />
    </Icon>
  );

  // ---------- Small UI bits ----------
  const dotsStyle = {
    padding: '0 6px',
    color: 'rgba(15,23,42,0.55)',
    fontWeight: 900,
  };

  // Reset (tekst-only zoals Category resultaten)
  const resetTextButton = {
    border: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,

    fontFamily: THEME.font,
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '-0.01em',

    color: ADMIN.text,
    cursor: 'pointer',
    textDecoration: 'underline',
    textUnderlineOffset: 3,
    opacity: 0.75,
  };

  // Buttons (light admin, leesbaar)
  const btn = (variant = 'solid') => {
    const base = {
      borderRadius: 12,
      padding: '10px 12px',
      fontWeight: 700,
      cursor: 'pointer',
      border: `1px solid ${ADMIN.border}`,
      fontFamily: THEME.font,
      fontSize: 13,
      outline: 'none',
    };

    if (variant === 'solid') {
      return {
        ...base,
        background: THEME.orange,
        color: '#FFFFFF',
        border: `1px solid ${THEME.orangeBorder}`,
      };
    }

    if (variant === 'soft') {
      return {
        ...base,
        background: THEME.orangeSoft,
        color: ADMIN.text,
        border: `1px solid ${THEME.orangeBorder}`,
      };
    }

    // ghost (default)
    return {
      ...base,
      background: '#FFFFFF',
      color: ADMIN.text,
      border: `1px solid ${ADMIN.border}`,
    };
  };

  // ---------- helpers ----------
  const resetMessages = () => {
    setErr('');
    setOk('');
  };

  const loadDistricts = async () => {
    const { data, error } = await supabase
      .from('districts')
      .select('id, name, slug')
      .order('name', { ascending: true });

    if (!error) setDistricts(data || []);
  };

  const loadEvents = async () => {
    setLoading(true);
    resetMessages();
    try {
      const { data, error } = await supabase
        .from('locations')
        .select(
          'id, name, is_published, updated_at, created_at, image_url, top10_rank, is_featured, hero_featured'
        )
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // ✅ Geen zoeken/filteren hier — alleen data opslaan
      setEvents(data || []);
    } catch (e) {
      setErr(e?.message || 'Laden mislukt.');
    } finally {
      setLoading(false);
    }
  };

  const needle = (q || '').trim().toLowerCase();

  const visibleEvents = (events || [])
    .filter((evt) => {
      // filter published/draft
      if (filter === 'published') return !!evt.is_published;
      if (filter === 'draft') return !evt.is_published;
      return true;
    })
    .filter((evt) => {
      // zoek op naam
      if (!needle) return true;
      return (evt.name || '').toLowerCase().includes(needle);
    })
    .sort((a, b) => {
      const aDate = new Date(a.updated_at || a.created_at || 0).getTime();
      const bDate = new Date(b.updated_at || b.created_at || 0).getTime();

      if (sortBy === 'updated_desc') return bDate - aDate;
      if (sortBy === 'updated_asc') return aDate - bDate;

      if (sortBy === 'name_asc')
        return (a.name || '').localeCompare(b.name || '', 'nl', {
          sensitivity: 'base',
        });
      if (sortBy === 'name_desc')
        return (b.name || '').localeCompare(a.name || '', 'nl', {
          sensitivity: 'base',
        });

      if (sortBy === 'top10_asc') {
        const ar = Number.isFinite(+a.top10_rank) ? +a.top10_rank : 9999;
        const br = Number.isFinite(+b.top10_rank) ? +b.top10_rank : 9999;
        return ar - br;
      }

      return bDate - aDate;
    });
  // --- pagination (MOET NA visibleEvents staan) ---
  const totalPages = Math.max(
    1,
    Math.ceil((visibleEvents?.length || 0) / pageSize)
  );

  const safePage = Math.min(page, totalPages);

  const pagedEvents = (visibleEvents || []).slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );
  const top10Overview = useMemo(() => {
    return (events || [])
      .filter((e) => Number.isFinite(+e.top10_rank) && +e.top10_rank > 0)
      .sort((a, b) => (+a.top10_rank || 9999) - (+b.top10_rank || 9999))
      .slice(0, 10);
  }, [events]);

  const heroOverview = useMemo(() => {
    return (events || [])
      .filter((e) => !!e.hero_featured)
      .sort((a, b) =>
        (a.name || '').localeCompare(b.name || '', 'nl', {
          sensitivity: 'base',
        })
      );
  }, [events]);

  // compacte page buttons zoals: 1 2 3 … 9 10
  const buildPageTokens = (total, current) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const tokens = new Set([
      1,
      2,
      total - 1,
      total,
      current - 1,
      current,
      current + 1,
    ]);
    const arr = Array.from(tokens)
      .filter((n) => n >= 1 && n <= total)
      .sort((a, b) => a - b);

    const out = [];
    for (let i = 0; i < arr.length; i++) {
      out.push(arr[i]);
      if (i < arr.length - 1 && arr[i + 1] - arr[i] > 1) out.push('…');
    }
    return out;
  };

  const pageTokens = buildPageTokens(totalPages, safePage);

  const startNew = () => {
    resetMessages();
    setEditingExisting(false); // ✅ nieuw event
    setForm(emptyForm);
    setExistingMedia([]);
    setTab('new');
  };

  const editEvent = async (id) => {
    setEditingExisting(true);
    setLoading(true);
    resetMessages();

    try {
      const { data, error } = await supabase
        .from('locations')
        .select(
          `
          id,
          name,
          description_short,
          description_long,
          address,
          lat,
          lng,
          district_id,
          category_id,
          vibe_id,
          home_section,
          website_url,
          booking_url,
          is_featured,
          hero_featured,
          top10_rank,
          opening_hours,
          opening_hours_v2,
          price_min,
          price_max,
          is_free,
          price_items,
          price_note,
          price_source_url,
          price_updated_at,
          is_published,
          image_url
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;

      const [
        { data: categoryLinks, error: categoryLinksError },
        { data: vibeLinks, error: vibeLinksError },
      ] = await Promise.all([
        supabase
          .from('location_categories')
          .select('category_id')
          .eq('location_id', id),
        supabase.from('location_vibes').select('vibe_id').eq('location_id', id),
      ]);

      if (categoryLinksError) throw categoryLinksError;
      if (vibeLinksError) throw vibeLinksError;

      const loadedCategoryIds = Array.isArray(categoryLinks)
        ? categoryLinks.map((r) => r.category_id).filter(Boolean)
        : [];

      const loadedVibeIds = Array.isArray(vibeLinks)
        ? vibeLinks.map((r) => r.vibe_id).filter(Boolean)
        : [];

      setForm({
        ...emptyForm,
        ...data,
        home_section: data?.home_section ?? '',
        lat: data?.lat ?? '',
        lng: data?.lng ?? '',
        top10_rank: data?.top10_rank ?? '',
        image_url: data?.image_url ?? '',

        category_id: loadedCategoryIds[0] || data?.category_id || '',
        vibe_id: loadedVibeIds[0] || data?.vibe_id || '',
        category_ids: loadedCategoryIds.length
          ? loadedCategoryIds
          : data?.category_id
          ? [data.category_id]
          : [],
        vibe_ids: loadedVibeIds.length
          ? loadedVibeIds
          : data?.vibe_id
          ? [data.vibe_id]
          : [],

        price_items: Array.isArray(data?.price_items) ? data.price_items : [],
        price_note: data?.price_note || '',
        price_source_url: data?.price_source_url || '',
      });

      setTab('new');
      await loadExistingMedia(id);
    } catch (e) {
      setErr(e?.message || 'Openen mislukt.');
    } finally {
      setLoading(false);
    }
  };

  const uploadMediaFilesIfAny = async (locationId) => {
    const files = form.mediaFiles || [];
    if (!files.length) return { thumbUrl: '' };

    // bepaal start order_index (zodat bij edit nieuwe files achteraan komen)
    let startIndex = 0;
    if ((existingMedia || []).length) {
      startIndex =
        Math.max(...existingMedia.map((m) => m.order_index ?? 0)) + 1;
    }

    const rowsToInsert = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || !file.type?.startsWith('image/')) continue;

      const safeName = (file.name || 'image')
        .replace(/[^a-z0-9._-]/gi, '_')
        .toLowerCase();

      const path = `locations/${locationId}/${Date.now()}_${i}_${safeName}`;

      const uploadRes = await supabase.storage
        .from('event-images')
        .upload(path, file, { upsert: false, contentType: file.type });

      if (uploadRes.error) throw uploadRes.error;

      const pub = supabase.storage.from('event-images').getPublicUrl(path);
      const publicUrl = pub?.data?.publicUrl || '';

      rowsToInsert.push({
        location_id: locationId,
        media_type: 'image', // ✅ FIX: verplicht in DB
        url: publicUrl,
        storage_path: path,
        order_index: startIndex + i,
        thumbnail_url: publicUrl, // (optioneel maar handig)
        caption: form.name?.trim() || null, // (optioneel)
      });
    }

    if (rowsToInsert.length) {
      const { error } = await supabase
        .from('location_media')
        .insert(rowsToInsert);
      if (error) throw error;
    }

    // thumbnail bepalen: gekozen index uit de *nieuwe* uploads
    const pick =
      Number.isFinite(form.thumbnailPick) && rowsToInsert[form.thumbnailPick]
        ? form.thumbnailPick
        : 0;

    const thumbUrl = rowsToInsert[pick]?.url || rowsToInsert[0]?.url || '';
    return { thumbUrl };
  };

  // ✅ Publish-checklist: wat moet minimaal gevuld zijn?
  const getPublishIssues = () => {
    const issues = [];

    if (!form.name?.trim()) issues.push('Titel is verplicht');
    if (!form.category_id) issues.push('Categorie is verplicht');
    if (!form.vibe_id) issues.push('Vibe is verplicht');
    if (!form.address?.trim()) issues.push('Adres is verplicht');
    if (!form.description_short?.trim())
      issues.push('Korte beschrijving is verplicht');

    // Afbeeldingen: al bestaande media óf nieuwe uploads óf al ingestelde image_url
    const hasAnyImage =
      !!form.image_url ||
      (existingMedia?.length ?? 0) > 0 ||
      (form.mediaFiles?.length ?? 0) > 0;

    if (!hasAnyImage) issues.push('Minstens 1 afbeelding uploaden');

    return issues;
  };

  const save = async (mode = 'normal') => {
    // mode: normal | draft | publish
    setLoading(true);
    resetMessages();

    try {
      if (!user) throw new Error('Je moet ingelogd zijn.');
      if (!isAdmin) throw new Error('Geen admin rechten.');

      if (!form.name?.trim()) throw new Error('Titel/naam is verplicht.');

      // publish toggles
      const isPublished =
        mode === 'draft'
          ? false
          : mode === 'publish'
          ? true
          : !!form.is_published;

      const selectedCategoryIds =
        Array.isArray(form.category_ids) && form.category_ids.length
          ? form.category_ids.filter(Boolean)
          : form.category_id
          ? [form.category_id]
          : [];

      const selectedVibeIds =
        Array.isArray(form.vibe_ids) && form.vibe_ids.length
          ? form.vibe_ids.filter(Boolean)
          : form.vibe_id
          ? [form.vibe_id]
          : [];

      if (!selectedCategoryIds.length)
        throw new Error('Kies minimaal 1 categorie.');
      if (!selectedVibeIds.length) throw new Error('Kies minimaal 1 vibe.');

      // 🚫 Als je publiceert: voorkom half-lege events
      if (mode === 'publish') {
        const issues = getPublishIssues();
        if (issues.length) {
          throw new Error(
            `Kan niet publiceren. Nog nodig: ${issues.join(' • ')}`
          );
        }
      }

      const basePayload = {
        name: form.name.trim(),
        description_short: form.description_short?.trim() || null,
        description_long: form.description_long?.trim() || null,
        address: form.address?.trim() || null,
        lat: form.lat === '' ? null : Number(form.lat),
        lng: form.lng === '' ? null : Number(form.lng),
        district_id: form.district_id || null,

        // legacy single-value fallback blijft bestaan
        category_id: selectedCategoryIds[0] || null,
        vibe_id: selectedVibeIds[0] || null,

        home_section: form.home_section || null,
        website_url: form.website_url?.trim() || null,
        booking_url: form.booking_url?.trim() || null,

        is_free: !!form.is_free,
        price_min: form.is_free
          ? 0
          : form.price_min === ''
          ? null
          : Number(form.price_min),
        price_max: form.is_free
          ? 0
          : form.price_max === ''
          ? null
          : Number(form.price_max),
        price_items: Array.isArray(form.price_items) ? form.price_items : null,
        price_note: form.price_note?.trim() || null,
        price_source_url: form.price_source_url?.trim() || null,
        price_updated_at: new Date().toISOString(),

        is_featured: !!form.is_featured,
        hero_featured: !!form.hero_featured,
        top10_rank: form.top10_rank === '' ? null : Number(form.top10_rank),

        opening_hours: form.opening_hours?.trim() || null,
        opening_hours_v2:
          form.opening_hours_v2 && typeof form.opening_hours_v2 === 'object'
            ? form.opening_hours_v2
            : null,

        is_published: isPublished,
        published_at: isPublished ? new Date().toISOString() : null,
      };

      let locationId = form.id;

      if (!locationId) {
        // INSERT
        const { data, error } = await supabase
          .from('locations')
          .insert({
            ...basePayload,
            created_by: user.id,
          })
          .select('id')
          .single();

        if (error) throw error;
        locationId = data.id;
      } else {
        // UPDATE
        const { error } = await supabase
          .from('locations')
          .update(basePayload)
          .eq('id', locationId);

        if (error) throw error;
      }

      // sync many-to-many categories
      const { error: deleteCategoriesError } = await supabase
        .from('location_categories')
        .delete()
        .eq('location_id', locationId);

      if (deleteCategoriesError) throw deleteCategoriesError;

      if (selectedCategoryIds.length) {
        const categoryRows = selectedCategoryIds.map((categoryId) => ({
          location_id: locationId,
          category_id: categoryId,
        }));

        const { error: insertCategoriesError } = await supabase
          .from('location_categories')
          .insert(categoryRows);

        if (insertCategoriesError) throw insertCategoriesError;
      }

      // sync many-to-many vibes
      const { error: deleteVibesError } = await supabase
        .from('location_vibes')
        .delete()
        .eq('location_id', locationId);

      if (deleteVibesError) throw deleteVibesError;

      if (selectedVibeIds.length) {
        const vibeRows = selectedVibeIds.map((vibeId) => ({
          location_id: locationId,
          vibe_id: vibeId,
        }));

        const { error: insertVibesError } = await supabase
          .from('location_vibes')
          .insert(vibeRows);

        if (insertVibesError) throw insertVibesError;
      }

      // upload images (if any) + kies thumbnail
      const { thumbUrl } = await uploadMediaFilesIfAny(locationId);

      if (thumbUrl) {
        const { error: imgErr } = await supabase
          .from('locations')
          .update({ image_url: thumbUrl })
          .eq('id', locationId);

        if (imgErr) throw imgErr;
      }

      setOk(
        mode === 'draft' ? 'Opgeslagen als concept (draft).' : 'Opgeslagen!'
      );

      setForm((p) => ({
        ...p,
        id: locationId,
        category_id: selectedCategoryIds[0] || '',
        vibe_id: selectedVibeIds[0] || '',
        category_ids: selectedCategoryIds,
        vibe_ids: selectedVibeIds,
        image_url: thumbUrl || p.image_url,
        mediaFiles: [],
        thumbnailPick: 0,
      }));

      await loadExistingMedia(locationId);
      await loadEvents();
      if (onRefreshLocations) await onRefreshLocations();
    } catch (e) {
      setErr(e?.message || 'Opslaan mislukt.');
    } finally {
      setLoading(false);
    }
  };

  const previewEvent = (evt) => {
    const full = (locations || []).find((l) => l?.id === evt?.id) || evt;

    // opent de officiële detail page (zelfde flow als Home/Category/Map)
    if (onOpenLocation) onOpenLocation(full);
  };

  const togglePublish = async (evt) => {
    setLoading(true);
    resetMessages();
    try {
      const next = !evt.is_published;

      const { error } = await supabase
        .from('locations')
        .update({
          is_published: next,
          published_at: next ? new Date().toISOString() : null,
        })
        .eq('id', evt.id);

      if (error) throw error;

      setOk(next ? 'Gepubliceerd ✅' : 'Terug naar concept ✅');
      await loadEvents();
      if (onRefreshLocations) await onRefreshLocations();
    } catch (e) {
      setErr(e?.message || 'Wijzigen mislukt.');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (evt) => {
    const sure = window.confirm(`Verwijderen: "${evt.name}" ?`);
    if (!sure) return;

    setLoading(true);
    resetMessages();
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', evt.id);
      if (error) throw error;

      setOk('Verwijderd.');
      await loadEvents();
      if (onRefreshLocations) await onRefreshLocations();
    } catch (e) {
      setErr(e?.message || 'Verwijderen mislukt.');
    } finally {
      setLoading(false);
    }
  };

  // Stats (simpel MVP) + Top favorieten
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    favoritesTotal: 0,
    topFavorites: [],
    topViewed: [],
    topClicks: [], // ✅ toevoegen
    topEventClicks: [], // ✅ toevoegen
    daily: [],
    kpis: { sessions7d: 0, views7d: 0, websiteClicks7d: 0, favAdds7d: 0 },
  });

  const loadStats = async () => {
    setLoading(true);
    resetMessages();
    try {
      const { count: total } = await supabase
        .from('locations')
        .select('id', { count: 'exact', head: true });

      const { count: published } = await supabase
        .from('locations')
        .select('id', { count: 'exact', head: true })
        .eq('is_published', true);

      const { count: drafts } = await supabase
        .from('locations')
        .select('id', { count: 'exact', head: true })
        .eq('is_published', false);

      const { count: favs } = await supabase
        .from('favorites')
        .select('location_id', { count: 'exact', head: true });

      const { data: topFavorites, error: topErr } = await supabase
        .rpc('get_admin_top_favorites');

      if (topErr) throw topErr;
      const { data: topViewedRaw, error: topViewedErr } = await supabase
        .rpc('get_admin_top_views');

      if (topViewedErr) throw topViewedErr;

      const topViewed = (topViewedRaw || []).map((r) => ({
        location_id: r.location_id,
        name: r.name,
        is_published: r.is_published,
        category_name: r.category_name || null,
        vibe_name: r.vibe_name || null,
        view_count: r.views || 0,
      }));

      // ✅ Top 10 website clicks
      const { data: topClicksRaw, error: topClicksErr } = await supabase
        .from('locations')
        .select(
          'id,name,is_published,website_click_count,categories:category_id(name),vibes:vibe_id(name)'
        )
        .order('website_click_count', { ascending: false, nullsLast: true })
        .limit(10);

      if (topClicksErr) throw topClicksErr;

      const topClicks = (topClicksRaw || []).map((r) => ({
        location_id: r.id,
        name: r.name,
        is_published: r.is_published,
        category_name: r.categories?.name || null,
        vibe_name: r.vibes?.name || null,
        website_click_count: r.website_click_count || 0,
      }));

      // ✅ Top 20 event clicks (open detail / card clicks)
      const { data: topEventClicksRaw, error: topEventClicksErr } =
        await supabase
          .from('locations')
          .select(
            'id,name,is_published,event_click_count,categories:category_id(name),vibes:vibe_id(name)'
          )
          .order('event_click_count', { ascending: false, nullsLast: true })
          .limit(20);

      if (topEventClicksErr) throw topEventClicksErr;

      const topEventClicks = (topEventClicksRaw || []).map((r) => ({
        location_id: r.id,
        name: r.name,
        is_published: r.is_published,
        category_name: r.categories?.name || null,
        vibe_name: r.vibes?.name || null,
        event_click_count: r.event_click_count || 0,
      }));

      const { data: daily, error: dailyErr } = await supabase
        .from('admin_daily_analytics')
        .select('day,sessions,location_views,website_clicks,favorites_added')
        .order('day', { ascending: false })
        .limit(14);

      if (dailyErr) throw dailyErr;

      const last7 = (daily || []).slice(0, 7);
      const kpis = {
        sessions7d: last7.reduce((s, r) => s + (r.sessions || 0), 0),
        views7d: last7.reduce((s, r) => s + (r.location_views || 0), 0),
        websiteClicks7d: last7.reduce((s, r) => s + (r.website_clicks || 0), 0),
        favAdds7d: last7.reduce((s, r) => s + (r.favorites_added || 0), 0),
      };

      setStats({
        total: total || 0,
        published: published || 0,
        drafts: drafts || 0,
        favoritesTotal: favs || 0,
        topFavorites: topFavorites || [],
        topViewed,
        topClicks,
        topEventClicks, // ✅ toevoegen
        daily,
        kpis,
      });
    } catch (e) {
      setErr(e?.message || 'Stats laden mislukt.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadDistricts();
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    if (tab === 'stats') loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, isAdmin]);

  if (!user) {
    return (
      <div style={pageOuter}>
        <div style={pageWrap}>
          <h1 style={h1}>Admin</h1>
          <p style={sub}>Log eerst in om je dashboard te openen.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={pageOuter}>
        <div style={pageWrap}>
          <h1 style={h1}>Admin</h1>
          <p style={sub}>Je account heeft geen admin rechten.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageOuter}>
      <div style={pageWrap}>
        <style>{`
      html, body {
        background: #FFFFFF !important;
      }
      .adminForm{
        display: grid;
        gap: 18px; /* ✅ extra ruimte tussen elk veldblok */
      }
  .adminForm input::placeholder,
  .adminForm textarea::placeholder{
    color: rgba(11,11,12,0.45);
  }
  .adminForm input,
  .adminForm textarea,
  .adminForm select{
    color: #0B0B0C;
  }
  .adminForm option{
    color: #0B0B0C;
  }
`}</style>
        <h1 style={h1}>Admin dashboard</h1>
        <p style={sub}>
          Events beheren (aanmaken, wijzigen, concept/publish) + image upload +
          basis stats.
        </p>

        <div style={card}>
          <div style={topBar}>
            <div style={tabs}>
              <button
                style={tabBtn(tab === 'events')}
                onClick={() => setTab('events')}
              >
                Events
              </button>
              <button style={tabBtn(tab === 'new')} onClick={startNew}>
                Nieuw / Bewerken
              </button>
              <button
                style={tabBtn(tab === 'stats')}
                onClick={() => setTab('stats')}
              >
                Statistieken
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: ADMIN.muted,
                }}
              >
                {loading ? 'Bezig…' : ''}
              </span>
            </div>
          </div>

          <div style={cardInner}>
            {err ? (
              <div
                style={{ marginBottom: 10, color: '#b91c1c', fontWeight: 900 }}
              >
                {err}
              </div>
            ) : null}
            {ok ? (
              <div
                style={{ marginBottom: 10, color: '#166534', fontWeight: 900 }}
              >
                {ok}
              </div>
            ) : null}

            {/* EVENTS TAB */}
            {tab === 'events' && (
              <>
                {/* CURATIE OVERVIEW */}
                {/* TOP 10 (op rank) — inklapbaar */}
                <div style={{ ...sectionCard, background: ADMIN.surface }}>
                  <button
                    type="button"
                    onClick={() => setTop10Open((v) => !v)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                    aria-expanded={top10Open}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 650,
                        color: ADMIN.text,
                      }}
                    >
                      Top 10 (op rank)
                    </div>

                    <div
                      style={{
                        color: 'rgba(11,11,12,0.70)',
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {top10Open ? 'Inklappen' : 'Uitklappen'}
                      <span style={{ fontSize: 14, lineHeight: 1 }}>
                        {top10Open ? '▾' : '▸'}
                      </span>
                    </div>
                  </button>

                  {top10Open ? (
                    <div style={{ marginTop: 12, overflowX: 'auto' }}>
                      <table style={adminTable}>
                        <thead>
                          <tr style={{ textAlign: 'left' }}>
                            <th style={th}>Rank</th>
                            <th style={th}>Naam</th>
                            <th style={th}>Status</th>
                            <th style={{ ...th, textAlign: 'right' }}>
                              Acties
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {top10Overview.length === 0 ? (
                            <tr>
                              <td style={tdMuted} colSpan={4}>
                                Nog geen Top10 ranks ingesteld.
                              </td>
                            </tr>
                          ) : (
                            top10Overview.map((e) => (
                              <tr
                                key={e.id}
                                style={{
                                  borderTop: `1px solid rgba(255,255,255,0.10)`,
                                }}
                              >
                                <td style={tdMuted}>
                                  {String(e.top10_rank ?? '').replace(
                                    /^0+/,
                                    ''
                                  ) || '—'}
                                </td>

                                <td style={tdName} title={e.name || ''}>
                                  {e.name || '—'}
                                </td>

                                <td style={tdBase}>
                                  <span
                                    style={statusWrap}
                                    title={
                                      e.is_published ? 'Published' : 'Draft'
                                    }
                                  >
                                    <span style={statusDot(!!e.is_published)} />
                                    {e.is_published ? 'Published' : 'Draft'}
                                  </span>
                                </td>

                                <td style={tdActions}>
                                  <div style={actionWrap}>
                                    <button
                                      type="button"
                                      style={iconBtn()}
                                      onClick={() => editEvent(e.id)}
                                      title="Bewerken"
                                      aria-label="Bewerken"
                                    >
                                      <IEdit />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>

                {/* EXTRA SPACE tussen de 2 tabellen */}
                <div style={{ height: 18 }} />

                {/* UITGELICHT (HERO) — inklapbaar */}
                <div style={{ ...sectionCard, background: ADMIN.surface }}>
                  <button
                    type="button"
                    onClick={() => setHeroOpen((v) => !v)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                    aria-expanded={heroOpen}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 650,
                        color: ADMIN.text,
                      }}
                    >
                      Uitgelicht (Hero)
                    </div>

                    <div
                      style={{
                        color: 'rgba(11,11,12,0.70)',
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {heroOpen ? 'Inklappen' : 'Uitklappen'}
                      <span style={{ fontSize: 14, lineHeight: 1 }}>
                        {heroOpen ? '▾' : '▸'}
                      </span>
                    </div>
                  </button>

                  {heroOpen ? (
                    <div style={{ marginTop: 12, overflowX: 'auto' }}>
                      <table style={adminTable}>
                        <thead>
                          <tr style={{ textAlign: 'left' }}>
                            <th style={th}>Naam</th>
                            <th style={th}>Status</th>
                            <th style={{ ...th, textAlign: 'right' }}>
                              Acties
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {heroOverview.length === 0 ? (
                            <tr>
                              <td style={tdMuted} colSpan={3}>
                                Nog geen events als “Uitgelicht (Hero)”
                                aangevinkt.
                              </td>
                            </tr>
                          ) : (
                            heroOverview.map((e) => (
                              <tr
                                key={e.id}
                                style={{
                                  borderTop: `1px solid rgba(255,255,255,0.10)`,
                                }}
                              >
                                <td style={tdName} title={e.name || ''}>
                                  {e.name || '—'}
                                </td>

                                <td style={tdBase}>
                                  <span
                                    style={statusWrap}
                                    title={
                                      e.is_published ? 'Published' : 'Draft'
                                    }
                                  >
                                    <span style={statusDot(!!e.is_published)} />
                                    {e.is_published ? 'Published' : 'Draft'}
                                  </span>
                                </td>

                                <td style={tdActions}>
                                  <div style={actionWrap}>
                                    <button
                                      type="button"
                                      style={iconBtn()}
                                      onClick={() => editEvent(e.id)}
                                      title="Bewerken"
                                      aria-label="Bewerken"
                                    >
                                      <IEdit />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>

                <div
                  style={{
                    ...row2,
                    marginTop: 18,
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
                  }}
                >
                  <div>
                    <div style={label}>Zoek</div>
                    <input
                      style={input}
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Zoek op naam…"
                    />
                  </div>

                  <div>
                    <div style={label}>Filter</div>
                    <select
                      style={input}
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">Alle</option>
                      <option value="published">Gepubliceerd</option>
                      <option value="draft">Concept (draft)</option>
                    </select>
                  </div>

                  <div>
                    <div style={label}>Sorteren</div>
                    <select
                      style={input}
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="updated_desc">
                        Laatst bijgewerkt (nieuw → oud)
                      </option>
                      <option value="updated_asc">
                        Laatst bijgewerkt (oud → nieuw)
                      </option>
                      <option value="name_asc">Naam (A → Z)</option>
                      <option value="name_desc">Naam (Z → A)</option>
                      <option value="top10_asc">
                        Top 10 rank (laag → hoog)
                      </option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: 14, overflowX: 'auto' }}>
                  <table style={adminTable}>
                    <thead>
                      <tr style={{ textAlign: 'left' }}>
                        <th style={th}>Naam</th>
                        <th style={th}>Status</th>
                        <th style={th}>Updated</th>
                        <th style={{ ...th, textAlign: 'right' }}>Acties</th>
                      </tr>
                    </thead>

                    <tbody>
                      {pagedEvents.map((evt) => (
                        <tr
                          key={evt.id}
                          style={{ borderTop: `1px solid ${THEME.border}` }}
                        >
                          <td style={tdName} title={evt.name || ''}>
                            {evt.name}
                          </td>

                          <td style={tdBase}>
                            <span
                              style={statusWrap}
                              title={evt.is_published ? 'Published' : 'Draft'}
                            >
                              <span style={statusDot(!!evt.is_published)} />
                              {evt.is_published ? 'Published' : 'Draft'}
                            </span>
                          </td>

                          <td style={tdMuted}>
                            {(evt.updated_at || evt.created_at || '')
                              .toString()
                              .slice(0, 10)}
                          </td>

                          <td style={tdActions}>
                            <div style={actionWrap}>
                              <button
                                type="button"
                                style={iconBtn()}
                                onClick={() => editEvent(evt.id)}
                                title="Bewerken"
                                aria-label="Bewerken"
                              >
                                <IEdit />
                              </button>

                              <button
                                type="button"
                                style={iconBtn({ active: !!evt.is_published })}
                                onClick={() => togglePublish(evt)}
                                title={
                                  evt.is_published ? 'Unpublish' : 'Publish'
                                }
                                aria-label={
                                  evt.is_published ? 'Unpublish' : 'Publish'
                                }
                              >
                                {evt.is_published ? (
                                  <IUnpublish />
                                ) : (
                                  <IPublish />
                                )}
                              </button>

                              <button
                                type="button"
                                style={iconBtn()}
                                onClick={() => previewEvent(evt)}
                                title="Preview"
                                aria-label="Preview"
                              >
                                <IEye />
                              </button>

                              <button
                                type="button"
                                style={iconBtn({ danger: true })}
                                onClick={() => remove(evt)}
                                title="Verwijder"
                                aria-label="Verwijder"
                              >
                                <ITrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {(visibleEvents?.length || 0) === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            style={{
                              padding: '12px 8px',
                              color: 'rgba(255,255,255,0.75)',
                              fontWeight: 800,
                              fontSize: 12,
                            }}
                          >
                            Geen events gevonden.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>

                  {/* Results + page size */}
                  <div
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 900,
                        color: 'rgba(255,255,255,0.75)',
                      }}
                    >
                      {visibleEvents?.length || 0} resultaten
                    </div>

                    <div
                      style={{ display: 'flex', gap: 10, alignItems: 'center' }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 900,
                          color: 'rgba(255,255,255,0.75)',
                        }}
                      >
                        Per pagina
                      </div>
                      <select
                        style={{ ...input, width: 110, padding: '10px 10px' }}
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setPage(1);
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div style={paginationRowStyle}>
                      <button
                        type="button"
                        style={{
                          ...pagePillStyle,
                          ...(safePage === 1
                            ? { opacity: 0.45, cursor: 'not-allowed' }
                            : {}),
                        }}
                        onClick={() =>
                          safePage > 1 && setPage((p) => Math.max(1, p - 1))
                        }
                      >
                        Vorige
                      </button>

                      {pageTokens.map((token, idx) =>
                        token === '…' ? (
                          <span key={`dots-${idx}`} style={dotsStyle}>
                            …
                          </span>
                        ) : (
                          <button
                            key={`page-${token}`}
                            type="button"
                            style={{
                              ...pagePillStyle,
                              ...(token === safePage ? selectedPillStyle : {}),
                            }}
                            onClick={() => setPage(token)}
                          >
                            {token}
                          </button>
                        )
                      )}

                      <button
                        type="button"
                        style={{
                          ...pagePillStyle,
                          ...(safePage === totalPages
                            ? { opacity: 0.45, cursor: 'not-allowed' }
                            : {}),
                        }}
                        onClick={() =>
                          safePage < totalPages &&
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                      >
                        Volgende
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* NEW/EDIT TAB */}
            {tab === 'new' && (
              <div style={newEditStack}>
                <div style={newEditHeader}>
                  <div>
                    <div style={newEditTitle}>
                      {form.id ? 'Event bewerken' : 'Nieuw event'}
                    </div>
                    <div style={newEditSub}>
                      {form.id
                        ? `ID: ${form.id}`
                        : 'Sla op om een ID + preview te krijgen'}
                    </div>
                  </div>

                  <div
                    style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                  >
                    <span style={statusPill(!!form.is_published)}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 999,
                          background: form.is_published
                            ? '#16a34a'
                            : 'rgba(255,255,255,0.28)',
                          display: 'inline-block',
                        }}
                      />
                      {form.is_published ? 'Published' : 'Draft'}
                    </span>

                    <button
                      type="button"
                      style={resetTextButton}
                      onClick={startNew}
                    >
                      Reset
                    </button>
                  </div>
                </div>
                <div className="adminForm">
                  <div style={row2}>
                    <div>
                      <div style={label}>Titel</div>
                      <input
                        style={input}
                        value={form.name}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="Bijv. Electric Ladyland Museum"
                      />
                    </div>
                  </div>

                  <div>
                    <div style={label}>Adres</div>
                    <input
                      style={input}
                      value={form.address ?? ''}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, address: e.target.value }))
                      }
                      placeholder="Straat + huisnr, Amsterdam"
                    />
                  </div>

                  {/* ✅ KORTE beschrijving (kaart/hero) */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={label}>Beschrijving (kort)</div>
                    <textarea
                      style={{ ...input, minHeight: 90, resize: 'vertical' }}
                      value={form.description_short}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          description_short: e.target.value,
                        }))
                      }
                      placeholder="Korte, pakkende omschrijving (komt op kaart + hero)…"
                    />
                  </div>

                  {/* ✅ VOLLEDIGE beschrijving (detailpagina) */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={label}>Beschrijving (volledig)</div>
                    <textarea
                      style={{ ...input, minHeight: 160, resize: 'vertical' }}
                      value={form.description_long ?? ''}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          description_long: e.target.value,
                        }))
                      }
                      placeholder="Volledige info (alleen zichtbaar op de detailpagina)…"
                    />
                  </div>
                </div>

                <div style={row2}>
                  <div>
                    <div style={label}>Categorieën</div>
                    <div
                      style={{
                        ...input,
                        minHeight: 140,
                        padding: 12,
                        display: 'grid',
                        gap: 10,
                        alignContent: 'start',
                        overflowY: 'auto',
                      }}
                    >
                      {(categories || []).map((c) => {
                        const checked = (form.category_ids || []).includes(
                          c.id
                        );

                        return (
                          <label
                            key={c.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              fontWeight: 500,
                              fontSize: 14,
                              color: ADMIN.text,
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const nextIds = e.target.checked
                                  ? [...(form.category_ids || []), c.id]
                                  : (form.category_ids || []).filter(
                                      (id) => id !== c.id
                                    );

                                setForm((p) => ({
                                  ...p,
                                  category_ids: nextIds,
                                  category_id: nextIds[0] || '',
                                }));
                              }}
                            />
                            <span>{c.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div style={label}>Vibes</div>
                    <div
                      style={{
                        ...input,
                        minHeight: 140,
                        padding: 12,
                        display: 'grid',
                        gap: 10,
                        alignContent: 'start',
                        overflowY: 'auto',
                      }}
                    >
                      {(vibes || []).map((v) => {
                        const checked = (form.vibe_ids || []).includes(v.id);

                        return (
                          <label
                            key={v.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              fontWeight: 500,
                              fontSize: 14,
                              color: ADMIN.text,
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const nextIds = e.target.checked
                                  ? [...(form.vibe_ids || []), v.id]
                                  : (form.vibe_ids || []).filter(
                                      (id) => id !== v.id
                                    );

                                setForm((p) => ({
                                  ...p,
                                  vibe_ids: nextIds,
                                  vibe_id: nextIds[0] || '',
                                }));
                              }}
                            />
                            <span>{v.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div style={row2}>
                  <div>
                    <div style={label}>Stadsdeel</div>
                    <select
                      style={input}
                      value={form.district_id}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, district_id: e.target.value }))
                      }
                    >
                      <option value="">(optioneel)</option>
                      {(districts || []).map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div style={label}>Featured + Top10</div>
                    <div
                      style={{ display: 'flex', gap: 10, alignItems: 'center' }}
                    >
                      <label
                        style={{
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center',
                          fontWeight: 900,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!form.is_featured}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              is_featured: e.target.checked,
                            }))
                          }
                        />
                        Featured
                      </label>
                      <label
                        style={{
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center',
                          fontWeight: 900,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!form.hero_featured}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              hero_featured: e.target.checked,
                            }))
                          }
                        />
                        Uitgelicht (Hero)
                      </label>

                      <input
                        style={{ ...input, width: 140 }}
                        value={form.top10_rank}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, top10_rank: e.target.value }))
                        }
                        placeholder="Top10 rank"
                      />
                    </div>
                  </div>
                </div>
                {/* Sectie (optioneel) */}
                <div style={row2}>
                  <div>
                    <div style={label}>Sectie (optioneel)</div>
                    <select
                      style={input}
                      value={form.home_section}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, home_section: e.target.value }))
                      }
                    >
                      <option value="">Geen</option>
                      <option value="popular">Populaire locaties</option>
                      <option value="romantic">Romantische spots</option>
                      <option value="center">Hotspots in Centrum</option>
                    </select>
                  </div>

                  <div>
                    <div style={label}>&nbsp;</div>
                    <div
                      style={{
                        fontSize: 12,
                        color: ADMIN.muted,
                        lineHeight: 1.4,
                        fontWeight: 450,
                      }}
                    >
                      Laat leeg als je dit event niet in een homepage-sectie wil
                      tonen.
                    </div>
                  </div>
                </div>

                <div style={row2}>
                  <div>
                    <div style={label}>Latitude</div>
                    <input
                      style={input}
                      value={form.lat ?? ''}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, lat: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <div style={label}>Longitude</div>
                    <input
                      style={input}
                      value={form.lng ?? ''}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, lng: e.target.value }))
                      }
                      placeholder="4.89…"
                    />
                  </div>
                </div>
                <div style={row2}>
                  <div>
                    <div style={label}>Prijs vanaf (€/optioneel)</div>
                    <input
                      style={input}
                      type="number"
                      step="1"
                      value={form.price_min ?? ''}
                      disabled={!!form.is_free}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, price_min: e.target.value }))
                      }
                      placeholder="Bijv. 15"
                    />
                  </div>

                  <div>
                    <div style={label}>Prijs tot (€/optioneel)</div>
                    <input
                      style={input}
                      type="number"
                      step="1"
                      value={form.price_max ?? ''}
                      disabled={!!form.is_free}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, price_max: e.target.value }))
                      }
                      placeholder="Bijv. 35"
                    />
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!form.is_free}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setForm((p) => ({
                        ...p,
                        is_free: checked,
                        price_min: checked ? '' : p.price_min,
                        price_max: checked ? '' : p.price_max,
                      }));
                    }}
                  />
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: ADMIN.text,
                      opacity: 0.9,
                      letterSpacing: 0.2,
                    }}
                  >
                    Gratis
                  </div>
                </div>

                {/* ===== PRIJZDETAILS (PLAK DIT BLOK TUSSEN "GRATIS" EN "WEBSITE URL") ===== */}
                <div style={{ marginTop: 14 }}>
                  <div style={label}>Prijsdetails (optioneel)</div>

                  <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
                    {(Array.isArray(form.price_items)
                      ? form.price_items
                      : []
                    ).map((it, idx) => (
                      <div
                        key={idx}
                        style={{
                          border: '1px solid rgba(255,255,255,0.10)',
                          background: 'rgba(255,255,255,0.04)',
                          borderRadius: 16,
                          padding: 12,
                          display: 'grid',
                          gap: 10,
                        }}
                      >
                        {/* Rij 1: titel + type */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 160px',
                            gap: 10,
                          }}
                        >
                          <input
                            className="adminForm"
                            style={input}
                            placeholder="Titel (bv. Arcade per play / Escape room 60 min / Ticket)"
                            value={it.title || ''}
                            onChange={(e) =>
                              updatePriceItem(idx, { title: e.target.value })
                            }
                          />

                          <select
                            className="adminForm"
                            style={input}
                            value={it.type || 'fixed'}
                            onChange={(e) =>
                              updatePriceItem(idx, { type: e.target.value })
                            }
                          >
                            <option value="fixed">Vast</option>
                            <option value="from">Vanaf</option>
                            <option value="range">Range</option>
                            <option value="variable">Varieert</option>
                          </select>
                        </div>

                        {/* Rij 2: bedragen + unit */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr 120px',
                            gap: 10,
                          }}
                        >
                          <input
                            className="adminForm"
                            style={input}
                            placeholder="Bedrag (bv. 12.5)"
                            disabled={(it.type || 'fixed') !== 'fixed'}
                            value={it.amount ?? ''}
                            onChange={(e) =>
                              updatePriceItem(idx, { amount: e.target.value })
                            }
                          />

                          <input
                            className="adminForm"
                            style={input}
                            placeholder="Min (bv. 10)"
                            disabled={
                              (it.type || 'fixed') !== 'from' &&
                              (it.type || 'fixed') !== 'range'
                            }
                            value={it.min ?? ''}
                            onChange={(e) =>
                              updatePriceItem(idx, { min: e.target.value })
                            }
                          />

                          <input
                            className="adminForm"
                            style={input}
                            placeholder="Max (bv. 18)"
                            disabled={(it.type || 'fixed') !== 'range'}
                            value={it.max ?? ''}
                            onChange={(e) =>
                              updatePriceItem(idx, { max: e.target.value })
                            }
                          />

                          <select
                            className="adminForm"
                            style={input}
                            value={it.unit || 'p.p.'}
                            onChange={(e) =>
                              updatePriceItem(idx, { unit: e.target.value })
                            }
                          >
                            <option value="p.p.">p.p.</option>
                            <option value="per team">per team</option>
                            <option value="per uur">per uur</option>
                            <option value="per play">per play</option>
                            <option value="per ronde">per ronde</option>
                            <option value="per ticket">per ticket</option>
                          </select>
                        </div>

                        {/* Rij 3: notitie + delete */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 110px',
                            gap: 10,
                          }}
                        >
                          <input
                            className="adminForm"
                            style={input}
                            placeholder="Notitie (optioneel) — bv. ‘afhankelijk van dag/tijd’"
                            value={it.note || ''}
                            onChange={(e) =>
                              updatePriceItem(idx, { note: e.target.value })
                            }
                          />

                          <button
                            type="button"
                            onClick={() => removePriceItem(idx)}
                            style={{
                              height: 40,
                              borderRadius: '12px 0 12px 0',
                              border: '1px solid rgba(255,255,255,0.14)',
                              background: 'rgba(255,255,255,0.06)',
                              color: 'rgba(255,255,255,0.90)',
                              cursor: 'pointer',
                              fontWeight: 700,
                            }}
                          >
                            Verwijder
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add row button */}
                  <button
                    type="button"
                    onClick={addPriceItem}
                    style={{
                      marginTop: 10,
                      height: 40,
                      padding: '0 14px',
                      borderRadius: '12px 0 12px 0',
                      border: '1px solid rgba(255,107,61,0.35)',
                      background: 'rgba(255,107,61,0.10)',
                      color: 'rgba(255,107,61,0.95)',
                      cursor: 'pointer',
                      fontWeight: 800,
                      justifySelf: 'start',
                    }}
                  >
                    + prijsregel toevoegen
                  </button>

                  {/* General note + source link */}
                  <div style={{ height: 12 }} />

                  <input
                    className="adminForm"
                    style={input}
                    placeholder="Algemene prijsnotitie (optioneel) — bv. ‘prijzen kunnen wijzigen’"
                    value={form.price_note || ''}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, price_note: e.target.value }))
                    }
                  />

                  <div style={{ height: 10 }} />

                  <input
                    className="adminForm"
                    style={input}
                    placeholder="Link naar actuele prijzen (optioneel)"
                    value={form.price_source_url || ''}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        price_source_url: e.target.value,
                      }))
                    }
                  />
                </div>
                {/* ===== EINDE PRIJZDETAILS BLOK ===== */}

                <div style={row2}>
                  <div>
                    <div style={label}>Website URL</div>
                    <input
                      style={input}
                      value={form.website_url ?? ''}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, website_url: e.target.value }))
                      }
                      placeholder="https://…"
                    />
                  </div>
                  <div>
                    <div style={label}>Booking URL</div>
                    <input
                      style={input}
                      value={form.booking_url ?? ''}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, booking_url: e.target.value }))
                      }
                      placeholder="https://…"
                    />
                  </div>
                </div>

                <div>
                  <div style={label}>Openingstijden (dropdown)</div>

                  <div style={{ display: 'grid', gap: 10 }}>
                    {DAYS.map((d) => {
                      const v2 = getHoursV2();
                      const cur = v2[d.key] ?? null;

                      const status =
                        cur?.status === 'open'
                          ? 'open'
                          : cur?.status === 'closed'
                          ? 'closed'
                          : '';

                      const openVal = cur?.open ?? '';
                      const closeVal = cur?.close ?? '';

                      return (
                        <div
                          key={d.key}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '70px 140px 1fr 1fr',
                            gap: 10,
                            alignItems: 'center',
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 650,
                              color: ADMIN.text,
                            }}
                          >
                            {language === 'nl' ? d.nl : d.en}
                          </div>

                          <select
                            className="adminForm"
                            style={input}
                            value={status}
                            onChange={(e) => {
                              const s = e.target.value;
                              if (s === '') return setDay(d.key, null);
                              if (s === 'closed')
                                return setDay(d.key, { status: 'closed' });
                              return setDay(d.key, {
                                status: 'open',
                                open: openVal || '10:00',
                                close: closeVal || '18:00',
                              });
                            }}
                          >
                            <option value="">— leeg —</option>
                            <option value="closed">Gesloten</option>
                            <option value="open">Open</option>
                          </select>

                          <select
                            className="adminForm"
                            style={input}
                            disabled={status !== 'open'}
                            value={status === 'open' ? openVal : ''}
                            onChange={(e) => {
                              const nextOpen = e.target.value;
                              setDay(d.key, {
                                status: 'open',
                                open: nextOpen,
                                close: closeVal || nextOpen,
                              });
                            }}
                          >
                            <option value="">Open</option>
                            {TIME_OPTIONS.map((t) => (
                              <option key={`o-${d.key}-${t}`} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>

                          <select
                            className="adminForm"
                            style={input}
                            disabled={status !== 'open'}
                            value={status === 'open' ? closeVal : ''}
                            onChange={(e) => {
                              const nextClose = e.target.value;
                              setDay(d.key, {
                                status: 'open',
                                open: openVal || nextClose,
                                close: nextClose,
                              });
                            }}
                          >
                            <option value="">Sluit</option>
                            {TIME_OPTIONS.map((t) => (
                              <option key={`c-${d.key}-${t}`} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: ADMIN.muted,
                      lineHeight: 1.4,
                    }}
                  >
                    Per dag kun je leeg laten, gesloten kiezen, of open + tijden
                    (op de minuut).
                  </div>
                </div>

                <div style={row2}>
                  {/* LINKS: multi images + thumbnail keuze + bestaande gallery */}
                  <div>
                    <div style={label}>Afbeeldingen (meerdere)</div>

                    <input
                      style={input}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setForm((p) => ({
                          ...p,
                          mediaFiles: files,
                          thumbnailPick: 0,
                        }));
                      }}
                    />

                    {/* Preview van nieuwe uploads + thumbnail keuze */}
                    {form.mediaFiles?.length ? (
                      <div style={{ marginTop: 10 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: ADMIN.muted,
                          }}
                        >
                          Nieuwe uploads (kies thumbnail):
                        </div>

                        <div
                          style={{
                            marginTop: 8,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                            gap: 10,
                          }}
                        >
                          {form.mediaFiles.map((file, idx) => (
                            <label
                              key={`${file.name}-${idx}`}
                              style={{
                                border: `1px solid ${ADMIN.border}`,
                                borderRadius: 14,
                                padding: 10,
                                background: 'rgba(255,255,255,0.06)',
                                cursor: 'pointer',
                                outline:
                                  form.thumbnailPick === idx
                                    ? '2px solid rgba(255,106,0,0.55)'
                                    : 'none',
                              }}
                            >
                              {/* echte afbeelding preview */}
                              <div
                                style={{
                                  width: '100%',
                                  height: 90,
                                  borderRadius: 12,
                                  overflow: 'hidden',
                                  border: `1px solid ${THEME.border}`,
                                  background: 'rgba(15,23,42,0.04)',
                                }}
                              >
                                {mediaPreviewUrls[idx] ? (
                                  <img
                                    src={mediaPreviewUrls[idx]}
                                    alt=""
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      display: 'block',
                                    }}
                                  />
                                ) : null}
                              </div>

                              {/* thumbnail keuze */}
                              <div
                                style={{
                                  marginTop: 8,
                                  display: 'flex',
                                  gap: 8,
                                  alignItems: 'center',
                                }}
                              >
                                <input
                                  type="radio"
                                  name="thumbPick"
                                  checked={form.thumbnailPick === idx}
                                  onChange={() =>
                                    setForm((p) => ({
                                      ...p,
                                      thumbnailPick: idx,
                                    }))
                                  }
                                />
                                <div
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 900,
                                    color: 'rgba(15,23,42,0.75)',
                                  }}
                                >
                                  Thumbnail
                                </div>
                              </div>

                              <div
                                style={{
                                  marginTop: 6,
                                  fontSize: 11,
                                  fontWeight: 900,
                                  color: 'rgba(15,23,42,0.55)',
                                }}
                              >
                                {file.name}
                              </div>
                            </label>
                          ))}
                        </div>

                        <button
                          type="button"
                          style={{ ...btn('ghost'), marginTop: 10 }}
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              mediaFiles: [],
                              thumbnailPick: 0,
                            }))
                          }
                        >
                          Selectie wissen
                        </button>
                      </div>
                    ) : null}

                    {/* Huidige thumbnail */}
                    {form.image_url ? (
                      <div style={{ marginTop: 14 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 900,
                            color: 'rgba(15,23,42,0.65)',
                          }}
                        >
                          Huidige thumbnail:
                        </div>
                        <img
                          src={form.image_url}
                          alt=""
                          style={{
                            marginTop: 8,
                            width: '100%',
                            maxWidth: 320,
                            borderRadius: 14,
                            border: `1px solid ${THEME.border}`,
                          }}
                        />
                      </div>
                    ) : null}

                    {/* Bestaande gallery (alleen als event bestaat) */}
                    {form.id ? (
                      <div style={{ marginTop: 14 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 900,
                            color: 'rgba(15,23,42,0.65)',
                          }}
                        >
                          Bestaande gallery:
                        </div>

                        {existingMediaLoading ? (
                          <div
                            style={{
                              marginTop: 8,
                              fontWeight: 900,
                              color: 'rgba(15,23,42,0.55)',
                            }}
                          >
                            Laden…
                          </div>
                        ) : (
                          <div
                            style={{
                              marginTop: 8,
                              display: 'grid',
                              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                              gap: 10,
                            }}
                          >
                            {(existingMedia || []).map((m) => (
                              <div
                                key={m.id}
                                style={{
                                  border: `1px solid ${THEME.border}`,
                                  borderRadius: 14,
                                  overflow: 'hidden',
                                  background: 'rgba(255,255,255,0.85)',
                                }}
                              >
                                <img
                                  src={m.thumbnail_url || m.url}
                                  alt=""
                                  style={{
                                    width: '100%',
                                    height: 90,
                                    objectFit: 'cover',
                                    display: 'block',
                                  }}
                                />
                                <div
                                  style={{
                                    padding: 8,
                                    display: 'flex',
                                    gap: 8,
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  <button
                                    type="button"
                                    style={btn('soft')}
                                    onClick={() =>
                                      makeThumbnail(form.id, m.url)
                                    }
                                  >
                                    Maak thumbnail
                                  </button>

                                  <button
                                    type="button"
                                    style={btn('ghost')}
                                    onClick={() => moveMedia(m.id, -1)}
                                    title="Omhoog"
                                  >
                                    ↑
                                  </button>

                                  <button
                                    type="button"
                                    style={btn('ghost')}
                                    onClick={() => moveMedia(m.id, +1)}
                                    title="Omlaag"
                                  >
                                    ↓
                                  </button>

                                  <button
                                    type="button"
                                    style={btn('ghost')}
                                    onClick={() => deleteMediaRow(m.id)}
                                  >
                                    Verwijder
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 12,
                          fontWeight: 900,
                          color: 'rgba(15,23,42,0.55)',
                        }}
                      >
                        Tip: sla het event eerst 1x op, daarna kun je bestaande
                        gallery beheren.
                      </div>
                    )}
                  </div>

                  {/* RECHTS: publiceren + opslaan knoppen */}
                  <div>
                    <div style={label}>Publiceren</div>

                    <label
                      style={{
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                        fontWeight: 900,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!form.is_published}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            is_published: e.target.checked,
                          }))
                        }
                      />
                      Event is gepubliceerd
                    </label>

                    {/* ✅ strakke uitlijning knoppen */}
                    <div style={newEditActions}>
                      <div style={newEditBtnRow3}>
                        <button
                          type="button"
                          style={{ ...btn('ghost'), ...newEditBtnFull }}
                          onClick={() => save('draft')}
                        >
                          Opslaan als draft
                        </button>

                        {editingExisting ? (
                          <button
                            type="button"
                            style={{ ...btn('soft'), ...newEditBtnFull }}
                            onClick={() => save('normal')}
                          >
                            Opslaan
                          </button>
                        ) : null}

                        {(() => {
                          const issues = getPublishIssues();
                          const disabled = loading || issues.length > 0;

                          return (
                            <button
                              type="button"
                              style={{
                                ...btn('solid'),
                                ...newEditBtnFull,
                                opacity: disabled ? 0.55 : 1,
                                cursor: disabled ? 'not-allowed' : 'pointer',
                              }}
                              disabled={disabled}
                              onClick={() => save('publish')}
                              title={
                                issues.length
                                  ? `Nog nodig: ${issues.join(' • ')}`
                                  : 'Publiceer'
                              }
                            >
                              Opslaan + publish
                            </button>
                          );
                        })()}
                      </div>

                      <div style={newEditBtnRow2}>
                        <button
                          type="button"
                          style={{ ...btn('soft'), ...newEditBtnFull }}
                          disabled={!form.id}
                          onClick={() => {
                            if (!form.id) return;

                            // 1) stop preview data (incl. images) in sessionStorage
                            try {
                              const payload = {
                                location: previewLocation,
                                mediaItems: previewMediaItems,
                                backTo: 'admin',
                                ts: Date.now(),
                              };
                              sessionStorage.setItem(
                                'lokaly_preview_payload',
                                JSON.stringify(payload)
                              );
                            } catch (e) {}

                            // 2) ga naar p=preview (zonder reload)
                            const href = `${window.location.pathname}?p=preview`;
                            window.history.pushState(
                              { p: 'preview' },
                              '',
                              href
                            );
                            window.dispatchEvent(new PopStateEvent('popstate'));
                          }}
                          title={
                            !form.id
                              ? 'Sla eerst 1x op zodat het event een ID krijgt'
                              : 'Preview met images (ook nieuwe uploads)'
                          }
                        >
                          Preview pagina
                        </button>

                        <button
                          type="button"
                          style={{ ...btn('ghost'), ...newEditBtnFull }}
                          disabled={!form.id}
                          onClick={() => {
                            const url = `${window.location.origin}${window.location.pathname}?p=detail&loc=${form.id}`;

                            track({
                              event_name: 'website_click',
                              page: 'detail',
                              meta: { source: 'detail_page' },
                              user_id: user?.id || null,
                              // location_id: selectedLocation?.id || null,
                            });

                            window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                          title={
                            !form.id
                              ? 'Sla eerst 1x op zodat het event een ID krijgt'
                              : 'Open in nieuw tabblad'
                          }
                        >
                          Open in nieuw tabblad
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STATS TAB */}
            {tab === 'stats' && (
              <div style={{ display: 'grid', gap: 12 }}>
                {/* Header row */}
                <div style={statsHeaderRow}>
                  <div>
                    <div style={statsTitle}>Overzicht</div>
                    <div style={statsSub}>Kerncijfers + top lijsten</div>
                  </div>

                  <button
                    type="button"
                    style={btn('ghost')}
                    onClick={loadStats}
                  >
                    Ververs
                  </button>
                </div>

                {/* KPI cards */}
                <div style={kpiGrid(isMobile)}>
                  <div style={kpiCard}>
                    <div style={kpiLabel}>Totaal events</div>
                    <div style={kpiValue}>{stats?.total ?? '—'}</div>
                  </div>

                  <div style={kpiCard}>
                    <div style={kpiLabel}>Gepubliceerd</div>
                    <div style={kpiValue}>{stats?.published ?? '—'}</div>
                  </div>

                  <div style={kpiCard}>
                    <div style={kpiLabel}>Drafts</div>
                    <div style={kpiValue}>{stats?.drafts ?? '—'}</div>
                  </div>

                  <div style={kpiCard}>
                    <div style={kpiLabel}>Favorieten totaal</div>
                    <div style={kpiValue}>{stats?.favoritesTotal ?? '—'}</div>
                  </div>
                </div>

                {/* Top 10 meest bekeken */}
                <div style={tableCard}>
                  <button
                    type="button"
                    onClick={() => setTopViewedOpen((v) => !v)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                    aria-expanded={topViewedOpen}
                  >
                    <div style={tableTitle}>Top 20 meest bekeken</div>

                    <div
                      style={{
                        color: 'rgba(11,11,12,0.70)',
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {topViewedOpen ? 'Inklappen' : 'Uitklappen'}
                      <span style={{ fontSize: 14, lineHeight: 1 }}>
                        {topViewedOpen ? '▾' : '▸'}
                      </span>
                    </div>
                  </button>
                  {topViewedOpen ? (
                    <>
                      {stats?.topViewed?.length ? (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={statsTable}>
                            <thead>
                              <tr style={{ textAlign: 'left' }}>
                                <th style={thStyle}>Event</th>
                                <th style={thStyle}>Categorie</th>
                                <th style={thStyle}>Vibe</th>
                                <th style={thStyle}>Status</th>
                                <th style={{ ...thStyle, ...rightNum }}>
                                  Views
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {stats.topViewed.map((r) => (
                                <tr key={r.location_id}>
                                  <td style={tdStrong}>{r.name}</td>
                                  <td style={tdStyle}>
                                    {r.category_name || '—'}
                                  </td>
                                  <td style={tdStyle}>{r.vibe_name || '—'}</td>
                                  <td style={tdStyle}>
                                    <span
                                      style={statusPillTiny(r.is_published)}
                                    >
                                      {r.is_published ? 'Published' : 'Draft'}
                                    </span>
                                  </td>
                                  <td style={{ ...tdStrong, ...rightNum }}>
                                    {r.view_count ?? 0}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div
                          style={{ fontSize: 13, color: 'rgba(15,23,42,0.62)' }}
                        >
                          Nog geen views.
                        </div>
                      )}
                    </>
                  ) : null}
                </div>

                {/* Top 10 meest geklikte events */}
                <div style={tableCard}>
                  <button
                    type="button"
                    onClick={() => setTopEventClicksOpen((v) => !v)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                    aria-expanded={topEventClicksOpen}
                  >
                    <div style={tableTitle}>Top 20 meest geklikte events</div>

                    <div
                      style={{
                        color: 'rgba(11,11,12,0.70)',
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {topEventClicksOpen ? 'Inklappen' : 'Uitklappen'}
                      <span style={{ fontSize: 14, lineHeight: 1 }}>
                        {topEventClicksOpen ? '▾' : '▸'}
                      </span>
                    </div>
                  </button>

                  {topEventClicksOpen ? (
                    <>
                      {stats?.topEventClicks?.length ? (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={statsTable}>
                            <thead>
                              <tr style={{ textAlign: 'left' }}>
                                <th style={thStyle}>Event</th>
                                <th style={thStyle}>Categorie</th>
                                <th style={thStyle}>Vibe</th>
                                <th style={thStyle}>Status</th>
                                <th style={{ ...thStyle, ...rightNum }}>
                                  Clicks
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {stats.topEventClicks.map((r) => (
                                <tr key={r.location_id}>
                                  <td style={tdStrong}>{r.name}</td>
                                  <td style={tdStyle}>
                                    {r.category_name || '—'}
                                  </td>
                                  <td style={tdStyle}>{r.vibe_name || '—'}</td>
                                  <td style={tdStyle}>
                                    <span
                                      style={statusPillTiny(r.is_published)}
                                    >
                                      {r.is_published ? 'Published' : 'Draft'}
                                    </span>
                                  </td>
                                  <td style={{ ...tdStrong, ...rightNum }}>
                                    {r.event_click_count ?? 0}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div
                          style={{ fontSize: 13, color: 'rgba(15,23,42,0.62)' }}
                        >
                          Nog geen clicks.
                        </div>
                      )}
                    </>
                  ) : null}
                </div>

                {/* Top 10 meest gefavorited */}
                <div style={tableCard}>
                  <button
                    type="button"
                    onClick={() => setTopFavOpen((v) => !v)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                    aria-expanded={topFavOpen}
                  >
                    <div style={tableTitle}>Top 20 meest gefavorited</div>

                    <div
                      style={{
                        color: 'rgba(11,11,12,0.70)',
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {topFavOpen ? 'Inklappen' : 'Uitklappen'}
                      <span style={{ fontSize: 14, lineHeight: 1 }}>
                        {topFavOpen ? '▾' : '▸'}
                      </span>
                    </div>
                  </button>
                  {topFavOpen ? (
                    <>
                      {stats?.topFavorites?.length ? (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={statsTable}>
                            <thead>
                              <tr style={{ textAlign: 'left' }}>
                                <th style={thStyle}>Event</th>
                                <th style={thStyle}>Categorie</th>
                                <th style={thStyle}>Vibe</th>
                                <th style={thStyle}>Status</th>
                                <th style={{ ...thStyle, ...rightNum }}>
                                  Favorieten
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {stats.topFavorites.map((r) => (
                                <tr key={r.location_id}>
                                  <td style={tdStrong}>{r.name}</td>
                                  <td style={tdStyle}>
                                    {r.category_name || '—'}
                                  </td>
                                  <td style={tdStyle}>{r.vibe_name || '—'}</td>
                                  <td style={tdStyle}>
                                    <span
                                      style={statusPillTiny(r.is_published)}
                                    >
                                      {r.is_published ? 'Published' : 'Draft'}
                                    </span>
                                  </td>
                                  <td style={{ ...tdStrong, ...rightNum }}>
                                    {r.favorites_count ?? 0}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div
                          style={{ fontSize: 13, color: 'rgba(15,23,42,0.62)' }}
                        >
                          Nog geen favorieten.
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== MAP PAGE ===================== */

function MapPage({
  language,
  onLocationClick,
  initialVibe,
  locations,
  vibes,
  categories,
  favoriteIds, // ✅ nieuw
}) {
  const isMobile = useIsMobile();
  const t = STRINGS[language];

  const [selectedVibe, setSelectedVibe] = useState(initialVibe || 'all');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [mapLoaded, setMapLoaded] = useState(false);

  // ✅ nieuw: funda-achtige UX
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  // ✅ preview popup (1e klik = preview, 2e klik = details)
  const [mapPreviewLoc, setMapPreviewLoc] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const activeMarkerRef = useRef(null);

  // 🔸 marker icon helper (normaal vs actief)
  const makeIcon = (active = false) => ({
    path: window.google.maps.SymbolPath.CIRCLE,
    fillColor: active ? '#FF6A00' : THEME.orange, // actief iets dieper/oranjer
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeOpacity: 1,
    strokeWeight: active ? 3 : 2,
    scale: active ? 8 : 6, // actief iets groter
  });

  // 🔸 1 centrale “sluit preview + reset marker”
  const closePreviewAndReset = () => {
    setMapPreviewLoc(null);

    if (activeMarkerRef.current) {
      activeMarkerRef.current.setIcon(makeIcon(false));
      activeMarkerRef.current = null;
    }
  };

  // Supabase -> fallback naar oude LOCATIONS
  const sourceLocations =
    locations && locations.length > 0 ? locations : LOCATIONS;
  const sourceVibes = vibes && vibes.length > 0 ? vibes : VIBES;
  const sourceCategories =
    categories && categories.length > 0 ? categories : CATEGORIES;

  useEffect(() => {
    if (initialVibe && initialVibe !== 'all') setSelectedVibe(initialVibe);
  }, [initialVibe]);

  const districts = useMemo(() => {
    const set = new Set();
    sourceLocations.forEach((loc) => {
      if (loc.district) set.add(loc.district);
    });

    // ✅ 'all' + alle districts
    return ['all', ...Array.from(set)];
  }, [sourceLocations]);

  const filteredLocations = useMemo(() => {
    return sourceLocations.filter((loc) => {
      // --- VIBE ---
      const locVibeNames = Array.isArray(loc.vibeNames)
        ? loc.vibeNames
        : Array.isArray(loc.vibe_names)
        ? loc.vibe_names
        : [loc.vibeName || loc.vibe || null].filter(Boolean);

      const locVibeSlugs = Array.isArray(loc.vibeSlugs)
        ? loc.vibeSlugs
        : [loc.vibeSlug || null].filter(Boolean);

      if (selectedVibe !== 'all' && selectedVibe) {
        const target = String(selectedVibe).toLowerCase();

        const vibeMatches =
          locVibeNames.some(
            (name) => name && String(name).toLowerCase() === target
          ) ||
          locVibeSlugs.some(
            (slug) => slug && String(slug).toLowerCase() === target
          );

        if (!vibeMatches) return false;
      }

      // --- CATEGORY ---
      const locCategorySlugs = Array.isArray(loc.categorySlugs)
        ? loc.categorySlugs
        : Array.isArray(loc.category_slugs)
        ? loc.category_slugs
        : [loc.categorySlug || loc.type || loc.category || null].filter(
            Boolean
          );

      const locCategoryNames = Array.isArray(loc.categoryNames)
        ? loc.categoryNames
        : Array.isArray(loc.category_names)
        ? loc.category_names
        : [loc.categoryName || loc.category || null].filter(Boolean);

      if (selectedCategory) {
        const targetSlug = selectedCategory.slug || null;
        const targetName = selectedCategory.name || null;

        const slugMatch =
          targetSlug &&
          locCategorySlugs.some(
            (slug) =>
              slug && String(slug).toLowerCase() === targetSlug.toLowerCase()
          );
        const nameMatch =
          targetName &&
          locCategoryNames.some(
            (name) =>
              name && String(name).toLowerCase() === targetName.toLowerCase()
          );

        if (!slugMatch && !nameMatch) return false;
      }

      // --- DISTRICT ---
      if (selectedDistrict !== 'all' && selectedDistrict) {
        if (!loc.district || loc.district !== selectedDistrict) return false;
      }

      return true;
    });
  }, [sourceLocations, selectedVibe, selectedCategory, selectedDistrict]);

  // ✅ nieuw: “Bewaard” filter
  const visibleLocations = useMemo(() => {
    if (!savedOnly) return filteredLocations;
    if (!favoriteIds || typeof favoriteIds.has !== 'function') return [];
    return filteredLocations.filter((loc) => favoriteIds.has(loc.id));
  }, [filteredLocations, savedOnly, favoriteIds]);

  const activeFiltersCount =
    (selectedVibe !== 'all' ? 1 : 0) +
    (selectedCategory ? 1 : 0) +
    (selectedDistrict !== 'all' ? 1 : 0) +
    (savedOnly ? 1 : 0);

  const resetAll = () => {
    setSelectedVibe('all');
    setSelectedCategory(null);
    setSelectedDistrict('all');
    setSavedOnly(false);
  };

  // ===== Google Maps init (zoals je nu al hebt) =====
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') return;

    function initMap() {
      if (
        !mapContainerRef.current ||
        (mapInstanceRef.current &&
          mapInstanceRef.current instanceof window.google.maps.Map)
      ) {
        return;
      }

      const center = { lat: 52.372, lng: 4.9 };
      mapInstanceRef.current = new window.google.maps.Map(
        mapContainerRef.current,
        {
          center,
          zoom: 12,

          gestureHandling: 'cooperative',

          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,

          clickableIcons: false,
          keyboardShortcuts: false,
        }
      );

      mapInstanceRef.current.addListener('click', () => {
        closePreviewAndReset();
      });

      setMapLoaded(true);
    }

    window.initLokalyMap = function () {
      if (window.google && window.google.maps) initMap();
    };

    if (window.google && window.google.maps) {
      initMap();
      return () => {
        delete window.initLokalyMap;
      };
    }

    const existingScript = document.querySelector(
      'script[data-lokaly-google-maps="true"]'
    );
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initLokalyMap`;
      script.async = true;
      script.defer = true;
      script.dataset.lokalyGoogleMaps = 'true';
      document.head.appendChild(script);
    } else if (window.google && window.google.maps) {
      // Script al geladen, maar callback niet aangeroepen
      initMap();
    }

    return () => {
      delete window.initLokalyMap;
    };
  }, []);

  // ✅ markers volgen nu visibleLocations (incl. “Bewaard”)
  useEffect(() => {
    // ✅ Belangrijk: wacht tot initMap setMapLoaded(true) heeft gedaan
    if (!mapLoaded) return;

    if (!mapInstanceRef.current || !window.google || !window.google.maps)
      return;

    // clear oude markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    activeMarkerRef.current = null;

    if (!visibleLocations || visibleLocations.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    visibleLocations.forEach((loc) => {
      const lat = Number(loc.lat);
      const lng = Number(loc.lng);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const makeIcon = (active = false) => ({
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: active ? '#0B0B0C' : THEME.orange,
        fillOpacity: 1,
        strokeColor: active ? THEME.orange : '#ffffff',
        strokeOpacity: 1,
        strokeWeight: active ? 3 : 2,
        scale: active ? 9 : 7,
      });

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        title: loc.name,
        icon: makeIcon(false),
      });

      marker.addListener('click', () => {
        if (activeMarkerRef.current && activeMarkerRef.current !== marker) {
          activeMarkerRef.current.setIcon(makeIcon(false));
        }

        marker.setIcon(makeIcon(true));
        activeMarkerRef.current = marker;

        setMapPreviewLoc(loc);

        if (typeof window !== 'undefined') {
          const keepY = window.scrollY || 0;
          requestAnimationFrame(() => {
            window.scrollTo({ top: keepY, left: 0, behavior: 'auto' });
          });
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo({ lat, lng });
        }
      });

      markersRef.current.push(marker);
      bounds.extend(marker.getPosition());
    });

    if (markersRef.current.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [mapLoaded, visibleLocations]);

  // ===== Styles (Map: geen scroll, geen gap onder header) =====
  const headerH = isMobile ? 64 : 72; // pas aan als jouw header hoger/lager is

  // iOS/Safari fix: 100vh kan "te lang" zijn → 100dvh voorkomt scroll/halve popup
  const fullVH =
    typeof window !== 'undefined' &&
    window.CSS &&
    window.CSS.supports &&
    window.CSS.supports('height: 100dvh')
      ? '100dvh'
      : '100vh';

  const wrapperStyle = {
    height: `calc(${fullVH} - ${headerH}px)`,
    background: `radial-gradient(circle at 20% 0%, ${THEME.orangeSoft} 0%, rgba(0,0,0,0) 45%), ${THEME.bg}`,
    overflow: 'hidden',
    margin: 0,
  };

  const mapShellStyle = {
    position: 'relative',
    height: '100%',
    width: '100%',
  };

  const mapCanvasStyle = {
    position: 'absolute',
    inset: 0,
  };

  // floating controls (bovenop map)
  const controlsRowStyle = {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
    pointerEvents: 'none', // alleen buttons clickable
  };

  const controlsLeftStyle = {
    display: 'flex',
    gap: 10,
    pointerEvents: 'auto',
  };

  // ✅ Map controls = zelfde look als labels op kaarten (dark pill + TL/BR rounding)
  const controlBtn = (active) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 36,
    padding: '0 14px',

    // ✅ linksboven + rechtsonder rond
    borderRadius: '12px 0 12px 0',

    // ✅ veel donkerder (Lokaly black glass) → leesbaar op Google Maps
    background: 'rgba(0,0,0,0.72)',
    border: active
      ? '1px solid rgba(255,107,61,0.70)'
      : '1px solid rgba(255,255,255,0.18)',

    // ✅ tekst altijd leesbaar
    color: active ? 'rgba(255,107,61,0.98)' : 'rgba(255,255,255,0.92)',

    fontFamily: THEME.font,
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: 0.1,

    cursor: 'pointer',
    whiteSpace: 'nowrap',
    outline: 'none',

    // ✅ subtiel “los” van de map
    boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  });

  // --- Lokaly "diagonal pill" shape (TL + BR rounded)
  const diagonalRadius = '14px 4px 14px 4px';

  // Top chips (Filters / Bewaard) -> zelfde look als labels op cards
  const mapTopChipStyle = (active) => ({
    border: `1px solid ${
      active ? 'rgba(255,92,0,0.45)' : 'rgba(255,255,255,0.10)'
    }`,
    background: 'rgba(10,10,10,0.88)',
    color: active ? 'rgba(255,92,0,1)' : 'rgba(245,245,245,0.92)',
    padding: '10px 14px',
    borderRadius: diagonalRadius,
    fontSize: 13,
    fontWeight: 400,
    letterSpacing: 0.1,
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    boxShadow: active ? '0 0 0 2px rgba(255,92,0,0.10) inset' : 'none',
  });

  // Drawer backdrop
  const backdropStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)',
    zIndex: 9998,
  };

  // Drawer panel (filters)
  const drawerStyle = {
    position: 'fixed',
    top: 16,
    right: 16,
    bottom: 16,
    width: 'min(420px, calc(100vw - 32px))',
    background: 'rgba(8,8,8,0.96)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '18px',
    boxShadow: '0 18px 50px rgba(0,0,0,0.55)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const drawerHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 14px 12px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  };

  const drawerTitleStyle = {
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: '-0.01em',
    textTransform: 'none',
    color: 'rgba(245,245,245,0.92)',
  };

  const closeBtnStyle = {
    width: 36,
    height: 36,
    borderRadius: diagonalRadius,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(20,20,20,0.9)',
    color: 'rgba(245,245,245,0.9)',
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
  };

  const drawerBodyStyle = {
    padding: 14,
    overflowY: 'auto',
  };

  // Pills inside drawer (vibes/categorieën) -> match CategoryPage knoppen (dunner)
  const pillButtonBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 34,
    padding: '0 12px',

    // ✅ linksboven + rechtsonder rond (Lokaly style)
    borderRadius: diagonalRadius, // bv "16px 0 16px 0"

    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(12,12,13,0.88)',
    color: 'rgba(235,240,255,0.82)',

    fontFamily: THEME.font,
    fontSize: 13,
    fontWeight: 500, // ✅ dunner zoals categorie page
    letterSpacing: '-0.01em',
    lineHeight: 1,

    cursor: 'pointer',
    whiteSpace: 'nowrap',
    outline: 'none',
    boxShadow: 'none',
    transition:
      'transform 120ms ease, background 180ms ease, border-color 180ms ease, color 180ms ease',
  };

  const selectedPillButton = {
    ...pillButtonBase,
    border: `1px solid ${THEME.orangeBorder}`,
    color: 'rgba(255,92,0,1)',
    boxShadow: '0 0 0 2px rgba(255,92,0,0.10) inset',
  };

  // Select dropdown (stadsdeel) -> dark + readable
  const districtSelectStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: diagonalRadius,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(12,12,12,0.92)',
    letterSpacing: '-0.01em',
    color: 'rgba(235,240,255,0.82)', // iets zachter zoals CategoryPage  fontSize: 13,
    fontWeight: 500,
    outline: 'none',
  };

  // Reset -> zelfde feel als CategoryPage (tekst-only, geen rand)
  const resetLinkStyle = {
    border: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,

    fontFamily: THEME.font,
    fontSize: 13,
    fontWeight: 500, // ✅ dun zoals categorie knoppen
    letterSpacing: '-0.01em',

    color: 'rgba(235,240,255,0.72)',
    cursor: 'pointer',
    textDecoration: 'none',
  };

  const showApiWarning = GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE';

  // ✅ Category label + kleur (zelfde bron als CategoryPage/LocationCard)
  function getCategoryMeta(loc) {
    if (!loc) return { label: '', color: THEME.orange };

    const label =
      (typeof loc.categoryName === 'string' && loc.categoryName.trim()) ||
      (typeof loc.category_name === 'string' && loc.category_name.trim()) ||
      (typeof loc.category === 'string' && loc.category.trim()) ||
      (typeof loc.type === 'string' && loc.type.trim()
        ? loc.type.replace(/[-_]/g, ' ')
        : '') ||
      '';

    const rawSlug = (
      loc?.categorySlug ||
      loc?.category_slug ||
      loc?.type ||
      loc?.category ||
      ''
    )
      .toString()
      .trim()
      .toLowerCase()
      .replace(/_/g, '-');

    const labelSlug = (label || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const color =
      CATEGORY_THEME_FALLBACK?.[rawSlug]?.bg ||
      CATEGORY_THEME_FALLBACK?.[labelSlug]?.bg ||
      CATEGORIES.find(
        (c) =>
          c?.name === label ||
          c?.slug === loc?.categorySlug ||
          c?.slug === loc?.category_slug
      )?.color ||
      THEME.orange;

    return { label, color };
  }

  return (
    <section style={wrapperStyle}>
      <div style={mapShellStyle}>
        {/* MAP (full size) */}
        <div ref={mapContainerRef} style={mapCanvasStyle} />
        {mapPreviewLoc ? (
          <div
            style={{
              position: 'absolute', // ✅ blijft in de map (verdwijnt als je naar footer scrollt)
              zIndex: 50,
              pointerEvents: 'auto',
              bottom: isMobile
                ? 'calc(12px + env(safe-area-inset-bottom))'
                : 18,
              ...(isMobile
                ? { left: 14, right: 14 }
                : {
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'min(520px, calc(100vw - 28px))',
                  }),
            }}
          >
            {(() => {
              const imageUrl =
                mapPreviewLoc?.mainImage ||
                mapPreviewLoc?.image_url ||
                mapPreviewLoc?.image ||
                '';

              const title =
                (mapPreviewLoc?.name || '').toString().trim() ||
                'Onbekende locatie';

              const district =
                (mapPreviewLoc?.district || '').toString().trim() ||
                'Amsterdam';

              const catLabel =
                (typeof mapPreviewLoc?.categoryName === 'string' &&
                  mapPreviewLoc.categoryName.trim()) ||
                (typeof mapPreviewLoc?.category_name === 'string' &&
                  mapPreviewLoc.category_name.trim()) ||
                (typeof mapPreviewLoc?.category === 'string' &&
                  mapPreviewLoc.category.trim()) ||
                (typeof mapPreviewLoc?.type === 'string' &&
                mapPreviewLoc.type.trim()
                  ? mapPreviewLoc.type.replace(/[-_]/g, ' ')
                  : '');

              const hasRating =
                typeof mapPreviewLoc?.rating === 'number' &&
                !Number.isNaN(mapPreviewLoc.rating);

              // ✅ ALLES wat hieronder gebruikt wordt, staat nu in dezelfde scope → geen "not defined"
              const cardBtn = {
                width: '100%',
                boxSizing: 'border-box',
                textAlign: 'left',
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(0,0,0,0.88)',
                borderRadius: 14,
                padding: 0,
                margin: 0,
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 16px 40px rgba(0,0,0,0.32)',
                overflow: 'hidden',
              };

              const row = {
                width: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 12px',
              };

              const thumb = {
                width: 64,
                height: 64,
                flex: '0 0 64px',
                borderRadius: 14,
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
              };

              const thumbImg = {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                filter: 'contrast(1.03) saturate(1.06)',
              };

              const content = {
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                overflow: 'hidden',
              };

              const titleStyle = {
                margin: 0,
                fontFamily: THEME.font,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: 'rgba(235,240,255,0.90)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              };

              const subStyle = {
                margin: 0,
                fontFamily: THEME.font,
                fontSize: 12,
                fontWeight: 450,
                lineHeight: 1.25,
                color: 'rgba(235,240,255,0.62)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              };

              const metaRow = {
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
                marginTop: 'auto',
                paddingTop: isMobile ? 10 : 8,
              };

              const metaPill = {
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 10px',
                borderRadius: '12px 0 12px 0',
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(235,240,255,0.72)',
                fontFamily: THEME.font,
                fontSize: 11.5,
                fontWeight: 450,
                whiteSpace: 'nowrap',
                maxWidth: '100%',
              };

              const ratingChip = (active) => ({
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 56,
                height: 30,
                padding: '0 10px',
                borderRadius: '12px 0 12px 0',
                border: active
                  ? '1px solid rgba(255,107,61,0.55)'
                  : '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(255,255,255,0.04)',
                color: active
                  ? 'rgba(255,107,61,0.95)'
                  : 'rgba(235,240,255,0.60)',
                fontFamily: THEME.font,
                fontSize: 12,
                fontWeight: 650,
                letterSpacing: 0.2,
                flexShrink: 0,
              });

              const rightSlot = {
                flex: '0 0 auto',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginLeft: 10,
              };

              const closeBtn = {
                width: 32,
                height: 32,
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(0,0,0,0.55)',
                color: 'rgba(235,240,255,0.92)',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                backdropFilter: 'blur(8px)',
                flex: '0 0 auto',
              };

              return (
                <div
                  role="button"
                  tabIndex={0}
                  style={cardBtn}
                  onClick={() =>
                    onLocationClick && onLocationClick(mapPreviewLoc)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onLocationClick && onLocationClick(mapPreviewLoc);
                    }
                  }}
                >
                  <div style={row}>
                    <div style={thumb} aria-hidden="true">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" style={thumbImg} />
                      ) : null}
                    </div>

                    <div style={content}>
                      <p style={titleStyle}>{title}</p>
                      <p style={subStyle}>{district}</p>

                      {(catLabel || '').trim() ? (
                        <div style={metaRow}>
                          <span style={metaPill}>{catLabel}</span>
                        </div>
                      ) : null}
                    </div>

                    <div style={rightSlot}>
                      {hasRating ? (
                        <span style={ratingChip(true)}>
                          {mapPreviewLoc.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span style={ratingChip(false)}>—</span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          closePreviewAndReset();
                        }}
                        aria-label={t.closePreview}
                        style={closeBtn}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : null}

        {/* Floating controls */}
        <div style={controlsRowStyle}>
          <div style={controlsLeftStyle}>
            <button
              type="button"
              style={mapTopChipStyle(filtersOpen)}
              onClick={() => setFiltersOpen(true)}
            >
              {t.filters}
              {activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
            </button>

            <button
              type="button"
              style={mapTopChipStyle(savedOnly)}
              onClick={() => setSavedOnly((v) => !v)}
              disabled={!favoriteIds || favoriteIds.size === 0}
              title={
                !favoriteIds || favoriteIds.size === 0
                  ? language === 'nl'
                    ? 'Geen bewaarde locaties'
                    : 'No saved locations'
                  : ''
              }
            >
              {language === 'nl' ? 'Bewaard' : 'Saved'}
              {favoriteIds && favoriteIds.size > 0
                ? ` (${favoriteIds.size})`
                : ''}
            </button>
          </div>
        </div>

        {/* Drawer */}
        {filtersOpen && (
          <>
            <div style={backdropStyle} onClick={() => setFiltersOpen(false)} />
            <div style={drawerStyle} onClick={(e) => e.stopPropagation()}>
              <div style={drawerHeaderStyle}>
                <div style={drawerTitleStyle}>{t.filters}</div>
                <button
                  type="button"
                  style={closeBtnStyle}
                  onClick={() => setFiltersOpen(false)}
                  aria-label={t.close}
                >
                  ✕
                </button>
              </div>

              <div style={drawerBodyStyle}>
                {/* Vibes */}
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: THEME.muted,
                      marginBottom: 6,
                    }}
                  >
                    {t.vibes}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      style={
                        selectedVibe === 'all'
                          ? selectedPillButton
                          : pillButtonBase
                      }
                      onClick={() => setSelectedVibe('all')}
                    >
                      {t.allVibes}
                    </button>
                    {sourceVibes
                      .filter(
                        (v) =>
                          v.slug !== 'all' &&
                          v.name !== 'Alle vibes' &&
                          v.name !== 'All vibes'
                      )
                      .map((v) => (
                        <button
                          key={v.id || v.slug || v.name}
                          type="button"
                          style={
                            selectedVibe === (v.slug || v.name)
                              ? selectedPillButton
                              : pillButtonBase
                          }
                          onClick={() => setSelectedVibe(v.slug || v.name)}
                        >
                          {v.name}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Categories */}
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: THEME.muted,
                      marginBottom: 6,
                    }}
                  >
                    {t.categoriesTitle}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      style={
                        !selectedCategory ? selectedPillButton : pillButtonBase
                      }
                      onClick={() => setSelectedCategory(null)}
                    >
                      {t.allCategories}
                    </button>

                    {(sourceCategories || CATEGORIES).map((c) => {
                      const isSelected =
                        selectedCategory?.slug === c.slug ||
                        selectedCategory?.name === c.name;
                      return (
                        <button
                          key={c.id || c.slug || c.name}
                          type="button"
                          style={
                            isSelected ? selectedPillButton : pillButtonBase
                          }
                          onClick={() => setSelectedCategory(c)}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Districts */}
                <div style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: THEME.muted,
                      marginBottom: 6,
                    }}
                  >
                    {t.filterByDistrict}
                  </div>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    style={districtSelectStyle}
                  >
                    <option value="all">{t.allDistricts}</option>
                    {districts
                      .filter((d) => d !== 'all')
                      .map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Result header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    marginTop: 6,
                  }}
                >
                  <div style={{ fontSize: 12, color: THEME.muted }}>
                    {language === 'nl'
                      ? `${visibleLocations.length} locaties`
                      : `${visibleLocations.length} locations`}
                  </div>
                  <button
                    type="button"
                    style={resetLinkStyle}
                    onClick={resetAll}
                  >
                    {language === 'nl' ? 'Reset' : 'Reset'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* API warning overlay */}
        {showApiWarning && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              textAlign: 'center',
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              color: THEME.text,
              fontSize: 13,
              zIndex: 10,
            }}
          >
            <div
              style={{
                maxWidth: 320,
                background: THEME.surface,
                border: `1px solid ${THEME.border}`,
                borderRadius: 18,
                padding: 14,
                boxShadow: '0 18px 40px rgba(15,23,42,0.10)',
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 6 }}>
                {language === 'nl'
                  ? 'Map instellingen nodig'
                  : 'Map setup needed'}
              </div>
              <div style={{ color: THEME.muted, lineHeight: 1.35 }}>
                {t.mapApiWarning}
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {!mapLoaded && !showApiWarning && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: THEME.muted,
              fontSize: 13,
              zIndex: 4,
              pointerEvents: 'none',
            }}
          >
            {language === 'nl' ? 'Kaart laden…' : 'Loading map…'}
          </div>
        )}
      </div>
    </section>
  );
}

/* ===================== SEARCH OVERLAY (pop-up) ===================== */

function SearchOverlay({
  searchTerm,
  language,
  onSelect,
  onSearchChange,
  visible,
  onClose,
  locations,
}) {
  const isMobile = useIsMobile();
  const t = STRINGS[language];
  const term = searchTerm.trim().toLowerCase();
  const inputRef = React.useRef(null);

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visible, onClose]);

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [visible]);

  const sourceLocations =
    locations && locations.length > 0 ? locations : LOCATIONS;

  const results = useMemo(() => {
    if (!term) return [];
    return sourceLocations
      .filter((loc) => {
        const haystack = (
          (loc.name || '') +
          ' ' +
          (loc.district || '') +
          ' ' +
          (loc.type || '') +
          ' ' +
          (loc.vibe || loc.vibeName || '') +
          ' ' +
          (loc.description || '')
        ).toLowerCase();
        return haystack.includes(term);
      })
      .slice(0, 10);
  }, [term, sourceLocations]);

  const showResults = term.length >= 2 && results.length > 0;

  const ORANGE = 'rgba(255,107,61,1)';
  const SOFT_TEXT = 'rgba(255,255,255,0.92)';
  const MUTED_TEXT = 'rgba(255,255,255,0.55)';
  const FAINT_TEXT = 'rgba(255,255,255,0.38)';
  const DIVIDER = 'rgba(255,255,255,0.07)';

  const highlightMatch = (text) => {
    if (!term) return text;
    const lower = text.toLowerCase();
    const index = lower.indexOf(term);
    if (index === -1) return text;
    const before = text.slice(0, index);
    const match = text.slice(index, index + term.length);
    const after = text.slice(index + term.length);
    return (
      <>
        {before}
        <span style={{ fontWeight: 700, color: ORANGE }}>{match}</span>
        {after}
      </>
    );
  };

  if (!visible) return null;

  if (isMobile) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 20000,
          background: 'rgba(8,9,12,0.98)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: 38,
              height: 38,
              flexShrink: 0,
              borderRadius: '12px 0 12px 0',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: SOFT_TEXT,
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              fontSize: 18,
            }}
            aria-label={language === 'nl' ? 'Terug' : 'Back'}
          >
            ‹
          </button>

          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              height: 44,
              padding: '0 14px',
              borderRadius: '12px 0 12px 0',
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            <input
              ref={inputRef}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: SOFT_TEXT,
                fontSize: 15,
                fontFamily: THEME.font,
                fontWeight: 400,
              }}
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm.length > 0 && (
              <button
                onClick={() => onSearchChange('')}
                style={{
                  border: 'none',
                  background: 'none',
                  color: MUTED_TEXT,
                  cursor: 'pointer',
                  fontSize: 18,
                  lineHeight: 1,
                  padding: '0 2px',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                ×
              </button>
            )}
          </div>

          <div
            style={{
              width: 38,
              height: 38,
              flexShrink: 0,
              borderRadius: '12px 0 12px 0',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: MUTED_TEXT,
              display: 'grid',
              placeItems: 'center',
              fontSize: 15,
            }}
          >
            <IconSearch />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {!term && (
            <div
              style={{
                padding: '22px 20px 10px',
                fontFamily: THEME.font,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              {language === 'nl' ? 'Suggesties' : 'Suggestions'}
            </div>
          )}

          {term && !showResults && (
            <div
              style={{
                padding: '28px 20px',
                textAlign: 'center',
                fontFamily: THEME.font,
                fontSize: 14,
                color: MUTED_TEXT,
              }}
            >
              {t.searchNoResults}
            </div>
          )}

          {(showResults ? results : sourceLocations.slice(0, 10)).map((loc) => (
            <button
              key={loc.id}
              onClick={() => onSelect(loc)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '14px 20px',
                border: 'none',
                borderBottom: `1px solid ${DIVIDER}`,
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  borderRadius: '10px 0 10px 0',
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'grid',
                  placeItems: 'center',
                  color: MUTED_TEXT,
                  fontSize: 13,
                }}
              >
                <IconSearch />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: THEME.font,
                    fontSize: 14,
                    fontWeight: 500,
                    color: SOFT_TEXT,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {showResults ? highlightMatch(loc.name || '') : loc.name}
                </div>
                {(loc.district || loc.type) && (
                  <div
                    style={{
                      fontFamily: THEME.font,
                      fontSize: 12,
                      color: FAINT_TEXT,
                      marginTop: 2,
                    }}
                  >
                    {[loc.district, loc.type].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>
              <span
                style={{
                  color: FAINT_TEXT,
                  fontSize: 16,
                  flexShrink: 0,
                  transform: 'rotate(-45deg)',
                  display: 'inline-block',
                }}
              >
                ↗
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const suggestList = showResults ? results : sourceLocations.slice(0, 10);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 16,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.50)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
        onMouseDown={onClose}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: 'min(620px, calc(100vw - 40px))',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            height: 52,
            padding: '0 16px',
            borderRadius: '12px 0 0 0',
            background: 'rgba(10,11,14,0.98)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderBottom: 'none',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.30)',
          }}
        >
          <input
            ref={inputRef}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: SOFT_TEXT,
              fontSize: 15,
              fontFamily: THEME.font,
              fontWeight: 400,
            }}
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm.length > 0 && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                border: 'none',
                background: 'none',
                color: MUTED_TEXT,
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1,
                padding: '0 4px',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              ×
            </button>
          )}
          <span
            style={{
              flexShrink: 0,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              display: 'grid',
              placeItems: 'center',
              fontSize: 16,
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            <IconSearch />
          </span>
        </div>

        <div
          style={{
            background: 'rgba(10,11,14,0.98)',
            borderRadius: '0 0 12px 0',
            border: '1px solid rgba(255,255,255,0.14)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.60)',
            overflow: 'hidden',
          }}
        >
          {!term && (
            <div
              style={{
                padding: '10px 18px 6px',
                fontFamily: THEME.font,
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: 0.9,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.30)',
              }}
            >
              {language === 'nl' ? 'Suggesties' : 'Suggestions'}
            </div>
          )}

          {term && !showResults && (
            <div
              style={{
                padding: '18px',
                fontFamily: THEME.font,
                fontSize: 13,
                color: MUTED_TEXT,
              }}
            >
              {t.searchNoResults}
            </div>
          )}

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {suggestList.map((loc, i) => (
              <button
                key={loc.id}
                onClick={() => onSelect(loc)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 18px',
                  border: 'none',
                  borderBottom: i < suggestList.length - 1
                    ? `1px solid ${DIVIDER}`
                    : 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  transition: 'background 120ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    flexShrink: 0,
                    borderRadius: '9px 0 9px 0',
                    border: '1px solid rgba(255,255,255,0.09)',
                    background: 'rgba(255,255,255,0.04)',
                    display: 'grid',
                    placeItems: 'center',
                    color: MUTED_TEXT,
                    fontSize: 12,
                  }}
                >
                  <IconSearch />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: THEME.font,
                      fontSize: 14,
                      fontWeight: 500,
                      color: SOFT_TEXT,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {showResults ? highlightMatch(loc.name || '') : loc.name}
                  </div>
                  {(loc.district || loc.type) && (
                    <div
                      style={{
                        fontFamily: THEME.font,
                        fontSize: 12,
                        color: FAINT_TEXT,
                        marginTop: 2,
                      }}
                    >
                      {[loc.district, loc.type].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    color: FAINT_TEXT,
                    fontSize: 15,
                    flexShrink: 0,
                    transform: 'rotate(-45deg)',
                    display: 'inline-block',
                    opacity: 0.7,
                  }}
                >
                  ↗
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== FOOTER PAGES (STATIC) ===================== */

const LOKALY_CONTACT = {
  infoEmail: 'info@lokaly.nl',
  supportEmail: 'support@lokaly.nl',
  privacyEmail: 'privacy@lokaly.nl',
  partnersEmail: 'partners@lokaly.nl',
};

const STATIC_PAGES = {
  nl: {
    about: {
      title: 'Over Lokaly',
      updatedAt: 'Laatst bijgewerkt: 17 december 2025',
      intro:
        'Lokaly is een platform dat lokale ervaringen overzichtelijk maakt. We helpen je sneller kiezen wat bij je plannen past — van musea tot VR, van filmhuizen tot date-spots.',
      sections: [
        {
          h: 'Onze missie',
          p: [
            'Lokaly maakt het makkelijker om de juiste activiteit te vinden, zonder eindeloos zoeken tussen losse websites en onduidelijke lijstjes.',
            'We focussen op helderheid, kwaliteit en relevantie: kort, betrouwbaar en passend bij jouw inspiratie.',
          ],
        },
        {
          h: 'Wat Lokaly wel (en niet) is',
          p: [
            'Lokaly is een discovery-platform. We tonen locaties/activiteiten en verwijzen waar nodig door naar externe aanbieders voor actuele details (zoals prijzen, tijden en tickets).',
            'Lokaly is geen ticketverkoper, tenzij expliciet anders vermeld. Aankopen en voorwaarden kunnen bij de externe aanbieder liggen.',
          ],
        },
        {
          h: 'Kwaliteit & selectie',
          p: [
            'We streven naar actuele en kloppende informatie. Toch kan info veranderen (openingstijden, beschikbaarheid, tijdelijke sluiting). Controleer daarom altijd de website van de aanbieder.',
            'Zie je een fout? Laat het ons weten — we lossen het zo snel mogelijk op.',
          ],
        },
      ],
    },

    how: {
      title: 'Hoe het werkt',
      updatedAt: 'Laatst bijgewerkt: 17 december 2025',
      intro:
        'Lokaly is ontworpen om in seconden te filteren naar iets dat écht bij je past.',
      sections: [
        {
          h: '1) Ontdek via inspiratie en ontdek',
          p: [
            'Kies een inspiratie (bijv. \u2018Cultureel\u2019, \u2018Romantisch\u2019, \u2018Teambuilding\u2019) of ga direct naar ontdek.',
            'Je krijgt een selectie die logisch is opgebouwd: snel scannen, snel kiezen.',
          ],
        },
        {
          h: '2) Bekijk details',
          p: [
            'Open een kaart voor beschrijving, stadsdeel, rating en praktische info.',
            'Gebruik de ‘Website’ knop voor de meest actuele info (tickets, openingstijden, regels).',
          ],
        },
        {
          h: '3) Deel met vrienden',
          p: [
            'Met de ‘Deel’ knop kun je een locatie eenvoudig sturen in WhatsApp/iMessage of de link kopiëren.',
            'Zo plan je sneller samen en voorkom je eindeloze groepsapps.',
          ],
        },
      ],
    },

    organizers: {
      title: 'Voor organisatoren',
      updatedAt: 'Laatst bijgewerkt: 17 december 2025',
      intro:
        'Organiseer je workshops, experiences, events of run je een venue? Lokaly kan helpen om je zichtbaarheid te vergroten bij mensen die actief op zoek zijn naar een uitje.',
      sections: [
        {
          h: 'Wat je kunt verwachten',
          p: [
            'Een professionele presentatie (titel, korte beschrijving, inspiratie/ontdek, locatiegegevens).',
            'Een duidelijke route voor bezoekers: ontdekking → detail → doorklik naar jouw website/boekingspagina.',
          ],
        },
        {
          h: 'Plaatsingsrichtlijnen',
          p: [
            'Informatie moet kloppen, actueel en niet misleidend zijn.',
            'Beeldmateriaal moet rechtenvrij zijn of met toestemming gebruikt worden.',
            'We behouden het recht om inzendingen te weigeren als ze niet passen binnen kwaliteit of veiligheid.',
          ],
        },
        {
          h: 'Samenwerken',
          p: [
            `Interesse in samenwerking, partnerships of feature-plekken? Mail ons via ${LOKALY_CONTACT.partnersEmail}.`,
            'Vermeld: naam organisatie, type activiteit, locatie, en eventuele links naar tickets/website.',
          ],
        },
      ],
    },

    privacy: {
      title: 'Privacy & cookies',
      updatedAt: 'Laatst bijgewerkt: 17 december 2025',
      intro:
        'We nemen privacy serieus. Hieronder leggen we in duidelijke taal uit welke gegevens we (kunnen) verwerken en waarom.',
      sections: [
        {
          h: 'Welke gegevens',
          p: [
            'Accountgegevens (bijv. e-mail) als je een account aanmaakt.',
            'Gebruiksgegevens (bijv. welke pagina’s populair zijn) om de ervaring te verbeteren.',
            'Technische gegevens (bijv. browser/ apparaat) voor stabiliteit en beveiliging.',
          ],
        },
        {
          h: 'Waarom we gegevens verwerken',
          p: [
            'Om accounts te kunnen beheren (inloggen, beveiliging).',
            'Om de app te verbeteren en fouten te verhelpen.',
            'Om misbruik te voorkomen en de dienst veilig te houden.',
          ],
        },
        {
          h: 'Cookies',
          p: [
            'We kunnen functionele cookies gebruiken om de app goed te laten werken.',
            'We kunnen analytische cookies gebruiken om te begrijpen wat goed werkt en wat niet (zo privacyvriendelijk mogelijk).',
          ],
        },
        {
          h: 'Jouw rechten',
          p: [
            'Je kunt vragen om inzage, correctie of verwijdering van je gegevens (voor zover dit wettelijk kan).',
            `Voor privacyvragen: ${LOKALY_CONTACT.privacyEmail}.`,
          ],
        },
      ],
    },

    terms: {
      title: 'Algemene voorwaarden',
      updatedAt: 'Laatst bijgewerkt: 17 december 2025',
      intro:
        'Door Lokaly te gebruiken ga je akkoord met onderstaande voorwaarden. We hebben ze bewust kort, zakelijk en begrijpelijk gehouden.',
      sections: [
        {
          h: '1) Dienstverlening',
          p: [
            'Lokaly biedt een platform om locaties en activiteiten te ontdekken. Informatie kan verwijzen naar externe aanbieders.',
            'Lokaly garandeert geen beschikbaarheid, prijzen of openingstijden; die kunnen door aanbieders worden gewijzigd.',
          ],
        },
        {
          h: '2) Gebruik van het platform',
          p: [
            'Je gebruikt Lokaly op eigen verantwoordelijkheid.',
            'Misbruik, scraping of verstoring van de dienst is niet toegestaan.',
          ],
        },
        {
          h: '3) Aansprakelijkheid',
          p: [
            'We doen ons best om informatie correct te houden, maar fouten kunnen voorkomen.',
            'Lokaly is niet aansprakelijk voor schade door onjuiste info, annuleringen of wijzigingen bij externe aanbieders, tenzij er sprake is van opzet of grove nalatigheid.',
          ],
        },
        {
          h: '4) Intellectueel eigendom',
          p: [
            'De vormgeving, teksten en merkidentiteit van Lokaly zijn beschermd.',
            'Je mag geen content kopiëren of herpubliceren zonder toestemming.',
          ],
        },
        {
          h: '5) Contact',
          p: [
            `Vragen over deze voorwaarden? Mail: ${LOKALY_CONTACT.supportEmail}.`,
          ],
        },
      ],
    },

    contact: {
      title: 'Contact & support',
      updatedAt: 'Laatst bijgewerkt: 17 december 2025',
      intro:
        'Heb je een vraag, een bug gevonden of wil je een samenwerking bespreken? We helpen graag.',
      sections: [
        {
          h: 'Algemene vragen',
          p: [
            `Voor algemene vragen kun je contact opnemen via ${LOKALY_CONTACT.infoEmail}`,
          ],
        },
        {
          h: 'Support',
          p: [
            `E-mail: ${LOKALY_CONTACT.supportEmail}`,
            'We reageren doorgaans binnen 1–2 werkdagen.',
          ],
        },
        {
          h: 'Privacy',
          p: [`Privacy-gerelateerde vragen: ${LOKALY_CONTACT.privacyEmail}`],
        },
        {
          h: 'Partnerships',
          p: [
            `Samenwerken of je venue toevoegen: ${LOKALY_CONTACT.partnersEmail}`,
          ],
        },
        {
          h: 'Tip of correctie',
          p: [
            'Zie je onjuiste info bij een locatie? Stuur ons de link/naam + wat er niet klopt. Dan passen we het aan.',
          ],
        },
      ],
    },
  },

  en: {
    about: {
      title: 'About Lokaly',
      updatedAt: 'Last updated: December 17, 2025',
      intro:
        'Lokaly helps you discover local experiences quickly and clearly — from museums and cinemas to VR, workshops and date spots.',
      sections: [
        {
          h: 'Our mission',
          p: [
            'Make it effortless to find the right plan without endless searching across scattered websites.',
            'Keep discovery fast, curated and relevant to your vibe.',
          ],
        },
        {
          h: 'What Lokaly is (and isn’t)',
          p: [
            'Lokaly is a discovery platform. We show places and activities and may link to external providers for the most up-to-date details.',
            'Lokaly is not a ticket seller unless explicitly stated otherwise. Purchases and conditions may be handled by the external provider.',
          ],
        },
        {
          h: 'Quality & accuracy',
          p: [
            'We aim to keep information accurate, but details can change (hours, pricing, availability). Always verify via the provider’s website.',
            'Spotted an error? Let us know and we’ll fix it as soon as possible.',
          ],
        },
      ],
    },

    how: {
      title: 'How it works',
      updatedAt: 'Last updated: December 17, 2025',
      intro:
        'Lokaly is built to get you from ‘what should we do?’ to a solid plan in seconds.',
      sections: [
        {
          h: '1) Discover via inspiration and discover',
          p: [
            'Pick an inspiration (e.g. Culture, Romantic, Team-building) or jump into discover.',
            'You’ll see a clean selection you can scan quickly.',
          ],
        },
        {
          h: '2) Check details',
          p: [
            'Open a card for description, area, rating and practical info.',
            'Use the ‘Website’ button for the most current details (tickets, rules, opening hours).',
          ],
        },
        {
          h: '3) Share with friends',
          p: [
            'Use the ‘Share’ button to send a link via chat apps or copy it to your clipboard.',
            'Plan faster, with less back-and-forth.',
          ],
        },
      ],
    },

    organizers: {
      title: 'For organizers',
      updatedAt: 'Last updated: December 17, 2025',
      intro:
        'Running workshops, experiences or a venue? Lokaly can help you reach people actively looking for something to do.',
      sections: [
        {
          h: 'What you get',
          p: [
            'A professional listing (title, short description, inspiration/discover, location details).',
            'A clear user journey: discovery → details → click-through to your website/booking page.',
          ],
        },
        {
          h: 'Listing guidelines',
          p: [
            'Information must be accurate and not misleading.',
            'Media must be properly licensed or used with permission.',
            'We may reject submissions that don’t meet quality or safety standards.',
          ],
        },
        {
          h: 'Work with us',
          p: [
            `For partnerships or featured placements, email ${LOKALY_CONTACT.partnersEmail}.`,
            'Include: organization name, activity type, location, and relevant links.',
          ],
        },
      ],
    },

    privacy: {
      title: 'Privacy & cookies',
      updatedAt: 'Last updated: December 17, 2025',
      intro:
        'We take privacy seriously. Below is a clear overview of what data we may process and why.',
      sections: [
        {
          h: 'What data',
          p: [
            'Account data (e.g. email) when you create an account.',
            'Usage data to improve the product and fix issues.',
            'Technical data (browser/device) for stability and security.',
          ],
        },
        {
          h: 'Why we process data',
          p: [
            'To manage accounts and authentication.',
            'To improve performance and reliability.',
            'To prevent abuse and keep the service secure.',
          ],
        },
        {
          h: 'Cookies',
          p: [
            'We may use functional cookies to keep the app working properly.',
            'We may use analytics in a privacy-friendly way to understand what works.',
          ],
        },
        {
          h: 'Your rights',
          p: [
            'You can request access, correction or deletion where legally applicable.',
            `Privacy questions: ${LOKALY_CONTACT.privacyEmail}.`,
          ],
        },
      ],
    },

    terms: {
      title: 'Terms & conditions',
      updatedAt: 'Last updated: December 17, 2025',
      intro:
        'By using Lokaly you agree to the terms below. We keep them short, professional and readable.',
      sections: [
        {
          h: '1) Service',
          p: [
            'Lokaly is a discovery platform and may link to external providers.',
            'Lokaly does not guarantee availability, pricing or opening hours as providers may change them.',
          ],
        },
        {
          h: '2) Platform use',
          p: [
            'You use Lokaly at your own responsibility.',
            'Abuse, scraping or disrupting the service is not allowed.',
          ],
        },
        {
          h: '3) Liability',
          p: [
            'We aim for accuracy but errors can happen.',
            'Lokaly is not liable for damages caused by incorrect info or changes by external providers, except in cases of intent or gross negligence.',
          ],
        },
        {
          h: '4) Intellectual property',
          p: [
            'Lokaly’s design, texts and brand identity are protected.',
            'You may not copy or republish content without permission.',
          ],
        },
        {
          h: '5) Contact',
          p: [
            `Questions about these terms? Email: ${LOKALY_CONTACT.supportEmail}.`,
          ],
        },
      ],
    },

    contact: {
      title: 'Contact & support',
      updatedAt: 'Last updated: December 17, 2025',
      intro: 'Questions, bugs or collaboration ideas? We\'re happy to help.',
      sections: [
        {
          h: 'General questions',
          p: [
            `For general questions, you can contact us via ${LOKALY_CONTACT.infoEmail}`,
          ],
        },
        {
          h: 'Support',
          p: [
            `Email: ${LOKALY_CONTACT.supportEmail}`,
            'Typical response time: 1–2 business days.',
          ],
        },
        {
          h: 'Privacy',
          p: [`Privacy-related questions: ${LOKALY_CONTACT.privacyEmail}`],
        },
        {
          h: 'Partnerships',
          p: [`Add your venue / collaborate: ${LOKALY_CONTACT.partnersEmail}`],
        },
        {
          h: 'Corrections',
          p: [
            'If a listing is inaccurate, send us the name/link and what should be updated.',
          ],
        },
      ],
    },
  },
};

function InfoPage({ language, pageKey, onNavigate }) {
  const isMobile = useIsMobile();
  const t = STRINGS[language];
  const pack = STATIC_PAGES[language] || STATIC_PAGES.nl;
  const data = pack[pageKey] || pack.about;

  const BG = '#000000';
  const SURFACE = 'rgba(255,255,255,0.06)';
  const SURFACE_2 = 'rgba(255,255,255,0.04)';
  const BORDER = 'rgba(255,255,255,0.10)';
  const TEXT = 'rgba(255,255,255,0.90)';
  const MUTED = 'rgba(255,255,255,0.66)';
  const FAINT = 'rgba(255,255,255,0.52)';
  const ACCENT = THEME.orange || THEME.accent; // jouw Lokaly-oranje

  const wrap = {
    width: '100%',
    minHeight: 'calc(100vh - 72px)',
    boxSizing: 'border-box',
    padding: isMobile ? '18px 14px 40px' : '28px 18px 56px',
    background: BG,
    color: TEXT,
    fontFamily: THEME.font,
  };

  const container = {
    maxWidth: 980,
    margin: '0 auto',
  };

  const headerRow = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: isMobile ? 12 : 14,
  };

  const backBtn = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: '12px 0 12px 0',
    padding: '9px 12px',
    border: `1px solid ${BORDER}`,
    background: SURFACE,
    color: 'rgba(255,255,255,0.88)',
    fontWeight: 450,
    fontSize: 12.5,
    letterSpacing: 0.1,
    cursor: 'pointer',
    transition:
      'transform 120ms ease, border-color 180ms ease, background 180ms ease',
  };

  const badge = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    padding: '8px 10px',
    border: `1px solid ${BORDER}`,
    background: SURFACE_2,
    color: FAINT,
    fontSize: 11.5,
    fontWeight: 400,
    letterSpacing: 0.1,
  };

  const panel = {
    borderRadius: 22,
    border: `1px solid ${BORDER}`,
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.04))',
    boxShadow: '0 30px 100px rgba(0,0,0,0.55)',
    padding: isMobile ? '16px 14px' : '18px 18px',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
  };

  const h1 = {
    margin: '6px 0 6px',
    fontFamily: THEME.fontDisplay,
    fontSize: isMobile ? 20 : 24,
    fontWeight: 600,
    letterSpacing: -0.2,
    color: 'rgba(255,255,255,0.92)',
  };

  const meta = {
    margin: '0 0 14px',
    fontSize: 12,
    lineHeight: 1.5,
    color: FAINT,
  };

  const intro = {
    margin: '0 0 14px',
    fontSize: 13,
    lineHeight: 1.7,
    color: MUTED,
    fontWeight: 400,
  };

  const section = {
    paddingTop: 14,
    marginTop: 14,
    borderTop: `1px solid rgba(255,255,255,0.10)`,
  };

  const h2 = {
    margin: '0 0 8px',
    fontSize: 13,
    fontWeight: 550,
    letterSpacing: 0.1,
    color: 'rgba(255,255,255,0.88)',
    fontFamily: THEME.font,
  };

  const pStyle = {
    margin: '0 0 10px',
    fontSize: 13,
    lineHeight: 1.75,
    color: MUTED,
    fontWeight: 400,
  };

  const linkStyle = {
    color: 'rgba(255,255,255,0.86)',
    textDecorationLine: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.18)',
    paddingBottom: 1,
    transition: 'color 160ms ease, border-color 160ms ease',
  };

  const renderLine = (text, idx) => {
    // simpele mail herkenning → klikbaar
    const isEmail =
      typeof text === 'string' && text.includes('@') && !text.includes('http');
    if (!isEmail)
      return (
        <p key={idx} style={pStyle}>
          {text}
        </p>
      );

    const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
    if (!email)
      return (
        <p key={idx} style={pStyle}>
          {text}
        </p>
      );

    const parts = text.split(email);
    return (
      <p key={idx} style={pStyle}>
        {parts[0]}
        <a
          href={`mailto:${email}`}
          style={linkStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = ACCENT;
            e.currentTarget.style.borderColor = 'rgba(255,107,61,0.55)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.86)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
          }}
        >
          {email}
        </a>
        {parts[1] || ''}
      </p>
    );
  };

  return (
    <div style={wrap}>
      <div style={container}>
        <div style={headerRow}>
          <button
            type="button"
            style={backBtn}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = 'scale(0.98)')
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onClick={() => onNavigate?.('home')}
          >
            ← Terug
          </button>
        </div>

        <div style={panel}>
          <div style={h1}>{data?.title || ''}</div>

          {data?.intro ? <p style={intro}>{data.intro}</p> : null}

          {(data?.sections || []).map((s, i) => (
            <div key={i} style={section}>
              <div style={h2}>{s?.h || ''}</div>
              {(s?.p || []).map((line, idx) => renderLine(line, idx))}
            </div>
          ))}
        </div>

        {/* subtiele bottom spacer */}
        <div style={{ height: 18 }} />
      </div>
    </div>
  );
}

/* ===================== FeedbackPage ===================== */

function FeedbackPage({ language, user, onBack }) {
  const t = STRINGS[language];
  const isMobile = useIsMobile();

  const [type, setType] = useState('idea');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const canSubmit = message.trim().length >= 10 && status !== 'sending';

  async function submitFeedback() {
    if (!canSubmit) return;

    setStatus('sending');
    try {
      const payload = {
        user_id: user?.id ?? null,
        email: email.trim() ? email.trim() : null,
        type,
        message: message.trim(),
        page_url: typeof window !== 'undefined' ? window.location.href : null,
        user_agent:
          typeof navigator !== 'undefined' ? navigator.userAgent : null,
      };

      const { error } = await supabase.from('feedback').insert([payload]);
      if (error) throw error;

      setStatus('sent');
      setMessage('');
      setEmail('');
      setType('idea');
    } catch (e) {
      setStatus('error');
    }
  }

  // ===================== Lokaly dark tokens (local) =====================
  const BG = '#000000';
  const SURFACE = 'rgba(255,255,255,0.06)';
  const SURFACE_2 = 'rgba(255,255,255,0.04)';
  const BORDER = 'rgba(255,255,255,0.12)';
  const TEXT = 'rgba(255,255,255,0.90)';
  const MUTED = 'rgba(255,255,255,0.66)';
  const FAINT = 'rgba(255,255,255,0.52)';
  const ACCENT = THEME.orange || '#FF6B3D';

  const wrap = {
    width: '100%',
    minHeight: 'calc(100vh - 72px)',
    boxSizing: 'border-box',
    padding: isMobile ? '18px 14px 40px' : '28px 18px 56px',
    background: BG,
    color: TEXT,
    fontFamily: THEME.font,
  };

  const container = {
    maxWidth: 980,
    margin: '0 auto',
  };

  const headerRow = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: isMobile ? 12 : 14,
  };

  const backBtn = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: '12px 0 12px 0',
    padding: '9px 12px',
    border: `1px solid ${BORDER}`,
    background: SURFACE,
    color: 'rgba(255,255,255,0.88)',
    fontWeight: 450,
    fontSize: 12.5,
    letterSpacing: 0.1,
    cursor: 'pointer',
    transition:
      'transform 120ms ease, border-color 180ms ease, background 180ms ease',
  };

  const panel = {
    borderRadius: 22,
    border: `1px solid ${BORDER}`,
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.04))',
    boxShadow: '0 30px 100px rgba(0,0,0,0.55)',
    padding: isMobile ? '16px 14px' : '18px 18px',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
  };

  const title = {
    margin: '6px 0 6px',
    fontFamily: THEME.fontDisplay,
    fontSize: isMobile ? 20 : 24,
    fontWeight: 600,
    letterSpacing: -0.2,
    color: 'rgba(255,255,255,0.92)',
  };

  const intro = {
    margin: '0 0 14px',
    fontSize: 13,
    lineHeight: 1.7,
    color: MUTED,
    fontWeight: 400,
  };

  const fieldLabel = {
    margin: '0 0 6px',
    fontSize: 11.5,
    fontWeight: 550,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: FAINT,
  };

  const inputBase = {
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: '14px 0 14px 0',
    border: `1px solid ${BORDER}`,
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.90)',
    padding: '12px 12px',
    outline: 'none',
    fontFamily: THEME.font,
    fontSize: 13,
    fontWeight: 420,
    letterSpacing: 0.1,
  };

  const helper = {
    marginTop: 8,
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.5,
  };

  const row = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: 12,
    marginTop: 12,
  };

  const segmentedWrap = {
    display: 'inline-flex',
    gap: 8,
    padding: 0,
    borderRadius: 0,
    border: 'none',
    background: 'transparent',
  };

  const segBtn = (active) => ({
    border: active ? `1px solid rgba(255,107,61,0.70)` : `1px solid ${BORDER}`,
    background: active ? 'rgba(255,107,61,0.14)' : 'rgba(255,255,255,0.05)',
    color: active ? 'rgba(255,107,61,0.98)' : 'rgba(255,255,255,0.86)',
    borderRadius: '12px 0 12px 0',
    padding: '9px 12px',
    fontSize: 12.5,
    fontWeight: 450,
    cursor: 'pointer',
    transition:
      'transform 120ms ease, border-color 180ms ease, background 180ms ease',
  });

  const submitBtn = {
    width: '100%',
    marginTop: 14,
    borderRadius: '14px 0 14px 0',
    border: canSubmit
      ? '1px solid rgba(255,107,61,0.65)'
      : `1px solid ${BORDER}`,
    background: canSubmit ? 'rgba(255,107,61,0.16)' : 'rgba(255,255,255,0.05)',
    color: canSubmit ? 'rgba(255,107,61,0.98)' : 'rgba(255,255,255,0.55)',
    padding: '12px 14px',
    fontSize: 13,
    fontWeight: 550,
    letterSpacing: 0.1,
    cursor: canSubmit ? 'pointer' : 'not-allowed',
    transition:
      'transform 120ms ease, border-color 180ms ease, background 180ms ease',
  };

  const banner = (kind) => ({
    marginTop: 12,
    padding: '10px 12px',
    borderRadius: '14px 0 14px 0',
    border:
      kind === 'ok'
        ? '1px solid rgba(46,204,113,0.35)'
        : kind === 'err'
        ? '1px solid rgba(255,107,61,0.35)'
        : `1px solid ${BORDER}`,
    background:
      kind === 'ok'
        ? 'rgba(46,204,113,0.10)'
        : kind === 'err'
        ? 'rgba(255,107,61,0.10)'
        : 'rgba(255,255,255,0.05)',
    color:
      kind === 'ok'
        ? 'rgba(230,255,240,0.92)'
        : kind === 'err'
        ? 'rgba(255,225,214,0.92)'
        : 'rgba(255,255,255,0.80)',
    fontSize: 12.5,
    lineHeight: 1.45,
  });

  return (
    <div style={wrap}>
      <div style={container}>
        <div style={headerRow}>
          <button
            type="button"
            style={backBtn}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = 'scale(0.98)')
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onClick={() => {
              if (typeof onBack === 'function') onBack();
              if (typeof window !== 'undefined') window.scrollTo(0, 0);
            }}
          >
            ← {language === 'nl' ? 'Terug' : 'Back'}
          </button>
        </div>

        <div style={panel}>
          <div style={title}>{t.feedbackTitle}</div>
          <p style={intro}>{t.feedbackIntro}</p>

          {/* Type */}
          <div style={{ marginTop: 6 }}>
            <div style={fieldLabel}>{t.feedbackType}</div>
            <div style={segmentedWrap}>
              <button
                type="button"
                style={segBtn(type === 'bug')}
                onClick={() => setType('bug')}
              >
                {t.feedbackBug}
              </button>
              <button
                type="button"
                style={segBtn(type === 'idea')}
                onClick={() => setType('idea')}
              >
                {t.feedbackIdea}
              </button>
            </div>
          </div>

          <div style={row}>
            {/* Email */}
            <div>
              <div style={fieldLabel}>{t.feedbackEmail}</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  language === 'nl' ? 'jij@voorbeeld.nl' : 'you@example.com'
                }
                style={inputBase}
                inputMode="email"
              />
              <div style={helper}>
                {language === 'nl'
                  ? '(Optioneel) we gebruiken dit alleen om je eventueel te kunnen terugmailen.'
                  : '(Optional) only used if we need to follow up.'}
              </div>
            </div>

            {/* Message */}
            <div>
              <div style={fieldLabel}>{t.feedbackMessage}</div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  language === 'nl'
                    ? 'Beschrijf kort wat er speelt… (min. 10 tekens)'
                    : 'Describe what’s happening… (min. 10 chars)'
                }
                style={{ ...inputBase, minHeight: 120, resize: 'vertical' }}
              />
              <div style={helper}>
                {language === 'nl'
                  ? `Tip: noem eventueel de pagina of het event waar je het ziet. (${
                      message.trim().length
                    }/10+)`
                  : `Tip: mention the page or event. (${
                      message.trim().length
                    }/10+)`}
              </div>
            </div>
          </div>

          <button
            type="button"
            style={submitBtn}
            disabled={!canSubmit}
            onMouseDown={(e) =>
              canSubmit && (e.currentTarget.style.transform = 'scale(0.99)')
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onClick={submitFeedback}
          >
            {status === 'sending' ? t.feedbackSending : t.feedbackSend}
          </button>

          {status === 'sent' && (
            <div style={banner('ok')}>{t.feedbackThanks}</div>
          )}
          {status === 'error' && (
            <div style={banner('err')}>{t.feedbackError}</div>
          )}
        </div>

        <div style={{ height: 18 }} />
      </div>
    </div>
  );
}

function ReviewsPage({ language, location, locationId, onBack, user }) {
  const [loading, setLoading] = React.useState(true);
  const [reviews, setReviews] = React.useState([]);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [reloadKey, setReloadKey] = React.useState(0);
  const [showWriteBox, setShowWriteBox] = React.useState(false);

  // --- Mijn review state (NU OP DEZE PAGINA) ---
  const [loadingMyReview, setLoadingMyReview] = React.useState(false);
  const [myExistingReview, setMyExistingReview] = React.useState(null);
  const [reviewEditMode, setReviewEditMode] = React.useState(true);
  const [myRating, setMyRating] = React.useState(0);
  const [myComment, setMyComment] = React.useState('');
  const [savingReview, setSavingReview] = React.useState(false);
  const [reviewMsg, setReviewMsg] = React.useState('');
  const [deletingReview, setDeletingReview] = useState(false);
  const [activeEditId, setActiveEditId] = React.useState(null);
  const [editRating, setEditRating] = React.useState(0);
  const [editComment, setEditComment] = React.useState('');
  const [inlineSaving, setInlineSaving] = React.useState(false);

  const iconBtnStyle = (danger = false) => ({
    width: 32,
    height: 32,
    borderRadius: 12,
    border: `1px solid rgba(255,255,255,0.12)`,
    background: danger ? 'rgba(255,60,60,0.10)' : 'rgba(255,255,255,0.04)',
    color: danger ? 'rgba(255,90,90,0.95)' : 'rgba(235,240,255,0.78)',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
  });

  function IconEdit({ size = 16, color = 'currentColor' }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 20h4l10.5-10.5a2 2 0 0 0 0-3L16.5 4a2 2 0 0 0-3 0L3 14.5V20z"
          stroke={color}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M13.5 6.5l4 4"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  function IconTrash({ size = 16, color = 'currentColor' }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9 3h6l1 2h4"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M6 7h12l-1 14H7L6 7z"
          stroke={color}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M10 11v6M14 11v6"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const ratingStats = React.useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    let n = 0;

    for (const r of reviews || []) {
      const v = Math.max(1, Math.min(5, Number(r?.rating) || 0));
      if (!v) continue;
      counts[v] += 1;
      sum += v;
      n += 1;
    }

    const avg = n ? sum / n : 0;
    const maxCount = Math.max(1, ...Object.values(counts));

    return { counts, avg, total: n, maxCount };
  }, [reviews]);

  // Reviews laden
  React.useEffect(() => {
    if (!locationId) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setErrorMsg('');

      const { data, error } = await supabase
        .from('location_reviews')
        .select('id, user_id, rating, comment, created_at')
        .eq('location_id', locationId)
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (error) {
        setErrorMsg(error.message || 'Failed to load reviews');
        setReviews([]);
        setLoading(false);
        return;
      }

      const rows = data || [];
      const userIds = Array.from(
        new Set(rows.map((r) => r.user_id).filter(Boolean))
      );

      // ✅ Publieke profielen ophalen (werkt ook voor gasten)
      let profilesMap = {};
      if (userIds.length) {
        const { data: profiles, error: pErr } = await supabase
          .from('public_profiles')
          .select('id, username, first_name, last_name, avatar_url')
          .in('id', userIds);

        if (!pErr && profiles) {
          profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
        }
      }

      const mapped = rows.map((r) => ({
        ...r,
        profile: profilesMap[r.user_id] || null,
      }));

      setReviews(mapped);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [locationId, reloadKey]);

  // Mijn review laden (1 review per user per locatie)
  React.useEffect(() => {
    if (!locationId) return;

    let cancelled = false;

    (async () => {
      const userId = user?.id;

      // reset als niet ingelogd
      if (!userId) {
        setMyExistingReview(null);
        setMyRating(0);
        setMyComment('');
        setReviewEditMode(true);
        return;
      }

      setLoadingMyReview(true);
      setReviewMsg('');

      try {
        const { data, error } = await supabase
          .from('location_reviews')
          .select('id, rating, comment, created_at')
          .eq('location_id', locationId)
          .eq('user_id', userId)
          .maybeSingle();

        if (cancelled) return;

        if (error) throw error;

        if (data) {
          setMyExistingReview(data);
          setMyRating(Number(data.rating) || 0);
          setMyComment(data.comment || '');
          setReviewEditMode(false); // locked totdat je op Bewerk klikt
        } else {
          setMyExistingReview(null);
          setMyRating(0);
          setMyComment('');
          setReviewEditMode(true); // nieuw: direct editable
        }
      } catch (e) {
        console.warn(e);
        if (!cancelled) {
          setMyExistingReview(null);
          setReviewEditMode(true);
        }
      } finally {
        if (!cancelled) setLoadingMyReview(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [locationId, user?.id]);

  async function submitMyReview() {
    setReviewMsg('');

    if (!user?.id) {
      setReviewMsg(
        language === 'nl'
          ? 'Log in om te kunnen reviewen.'
          : 'Log in to review.'
      );
      return;
    }

    if (myExistingReview && !reviewEditMode) {
      setReviewMsg(
        language === 'nl'
          ? 'Klik op ‘Bewerk’ om je review aan te passen.'
          : 'Click ‘Edit’ to change your review.'
      );
      return;
    }

    if (myRating < 1 || myRating > 5) {
      setReviewMsg(
        language === 'nl'
          ? 'Kies een rating van 1 t/m 5.'
          : 'Pick a rating from 1 to 5.'
      );
      return;
    }

    setSavingReview(true);

    try {
      const locId = location?.id;
      if (!locId) return;

      const payload = {
        location_id: locId,
        user_id: user.id,
        rating: myRating,
        comment: myComment?.trim() || null,
      };

      const { data, error } = await supabase
        .from('location_reviews')
        .upsert(payload, { onConflict: 'location_id,user_id' })
        .select('id, rating, comment, created_at, updated_at')
        .single();

      if (error) throw error;

      setMyExistingReview(data || payload);
      setReviewEditMode(false);
      setReviewMsg(language === 'nl' ? 'Review opgeslagen!' : 'Review saved!');

      // herlaad lijst reviews (en daarmee ook gemiddelde op deze pagina)
      setReloadKey((k) => k + 1);
    } catch (e) {
      console.warn(e);
      setReviewMsg(
        (e?.message || '').includes('row-level security')
          ? language === 'nl'
            ? 'Je moet ingelogd zijn om te reviewen.'
            : 'You must be logged in to review.'
          : language === 'nl'
          ? 'Opslaan mislukt.'
          : 'Failed to save.'
      );
    } finally {
      setSavingReview(false);
    }
  }

  async function saveInlineEdit() {
    if (!user?.id || !locationId) return;

    if (editRating < 1 || editRating > 5) {
      setReviewMsg(
        language === 'nl'
          ? 'Kies een rating van 1 t/m 5.'
          : 'Pick a rating from 1 to 5.'
      );
      return;
    }

    setInlineSaving(true);
    setReviewMsg('');

    try {
      const payload = {
        location_id: locationId,
        user_id: user.id,
        rating: editRating,
        comment: editComment?.trim() || null,
      };

      const { data, error } = await supabase
        .from('location_reviews')
        .upsert(payload, { onConflict: 'location_id,user_id' })
        .select('id, rating, comment, created_at, updated_at')
        .single();

      if (error) throw error;

      setMyExistingReview(data || payload);
      setActiveEditId(null);
      setReviewMsg(language === 'nl' ? 'Review opgeslagen!' : 'Review saved!');
      setReloadKey((k) => k + 1);
    } catch (e) {
      console.warn(e);
      setReviewMsg(language === 'nl' ? 'Opslaan mislukt.' : 'Failed to save.');
    } finally {
      setInlineSaving(false);
    }
  }

  function cancelInlineEdit() {
    setActiveEditId(null);
    setReviewMsg('');
  }

  async function deleteMyReview() {
    setReviewMsg('');

    if (!user?.id || !myExistingReview?.id) return;

    const ok = window.confirm(
      language === 'nl'
        ? 'Weet je zeker dat je je review wilt verwijderen?'
        : 'Are you sure you want to delete your review?'
    );
    if (!ok) return;

    setDeletingReview(true);

    try {
      const { error } = await supabase
        .from('location_reviews')
        .delete()
        .eq('id', myExistingReview.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // reset UI
      setMyExistingReview(null);
      setMyRating(0);
      setMyComment('');
      setReviewEditMode(false);

      setReviewMsg(
        language === 'nl' ? 'Review verwijderd.' : 'Review deleted.'
      );
      setReloadKey((k) => k + 1);
    } catch (e) {
      console.warn(e);
      setReviewMsg(
        language === 'nl' ? 'Verwijderen mislukt.' : 'Failed to delete.'
      );
    } finally {
      setDeletingReview(false);
    }
  }

  const fmtName = (p) => {
    if (p?.username) return `@${p.username}`;
    const full = [p?.first_name, p?.last_name].filter(Boolean).join(' ').trim();
    if (full) return full;
    return language === 'nl' ? 'Gebruiker' : 'User';
  };

  const fmtDate = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString(
        language === 'nl' ? 'nl-NL' : 'en-US',
        { year: 'numeric', month: 'short', day: '2-digit' }
      );
    } catch {
      return '';
    }
  };

  const avgFromLocation =
    typeof location?.rating === 'number' ? location.rating : null;

  const avgFromReviews =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
        reviews.length
      : 0;

  const avg = avgFromLocation ?? avgFromReviews;

  return (
    <div style={{ padding: 18, maxWidth: 980, margin: '0 auto' }}>
      {/* Rating verdeling (altijd zichtbaar, mobile + desktop) */}
      <div
        style={{
          marginTop: 14,
          marginBottom: 14,
          padding: 12,
          border: `1px solid ${THEME.border}`,
          borderRadius: 14,
          background: 'rgba(255,255,255,0.03)',
        }}
      >
        {[5, 4, 3, 2, 1].map((s) => {
          const c = ratingStats.counts[s] || 0;
          const pct = ratingStats.total ? c / ratingStats.total : 0;

          return (
            <div
              key={s}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: s === 1 ? 0 : 8,
              }}
            >
              <div
                style={{
                  width: 16,
                  fontSize: 12,
                  color: THEME.muted,
                  textAlign: 'right',
                  flexShrink: 0,
                }}
              >
                {s}
              </div>

              <div
                style={{
                  position: 'relative',
                  height: 8,
                  flex: 1,
                  minWidth: 0,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                  border: `1px solid ${THEME.border}`,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: `${Math.round(pct * 100)}%`,
                    background: THEME.orange,
                    opacity: 0.9,
                  }}
                />
              </div>

              <div
                style={{
                  width: 26,
                  fontSize: 12,
                  color: THEME.muted,
                  textAlign: 'right',
                  flexShrink: 0,
                }}
              >
                {c}
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="lokaly-muted" style={{ marginTop: 10 }}>
          {language === 'nl' ? 'Laden...' : 'Loading...'}
        </div>
      )}

      {!loading && !!errorMsg && (
        <div style={{ marginTop: 10, color: '#b00020' }}>{errorMsg}</div>
      )}

      {!loading && !errorMsg && reviews.length === 0 && (
        <div style={{ marginTop: 10 }}>
          <div className="lokaly-muted">
            {language === 'nl' ? 'Nog geen reviews.' : 'No reviews yet.'}
          </div>
        </div>
      )}

      {/* ⭐ Rating verdeling (balkjes per ster) */}
      {(reviews?.length || 0) > 0 && (
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 18,
            padding: 12,
            marginTop: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: 'rgba(255,255,255,0.92)',
              }}
            >
              {language === 'nl' ? 'Beoordelingen' : 'Ratings'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(235,240,255,0.70)' }}>
              {ratingStats.total} {language === 'nl' ? 'reviews' : 'reviews'}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingStats.counts?.[star] || 0;
              const pct = (count / (ratingStats.maxCount || 1)) * 100;

              return (
                <div
                  key={star}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '52px 1fr 28px',
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: 'rgba(235,240,255,0.82)',
                        width: 14,
                      }}
                    >
                      {star}
                    </span>
                    <RenderStars value={star} size={12} gap={2} />
                  </div>

                  <div
                    style={{
                      height: 10,
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.08)',
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.10)',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'rgba(255,107,61,0.85)', // Lokaly-oranje
                      }}
                    />
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: 'rgba(235,240,255,0.70)',
                      textAlign: 'right',
                    }}
                  >
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
        {reviews.map((r) => {
          const isMine = !!user?.id && r?.user_id === user.id;
          const dt = r.updated_at || r.created_at;
          const dateLabel = fmtDate(dt);
          const stars = Array.from({ length: 5 }, (_, i) =>
            i < (r.rating || 0) ? '★' : '☆'
          ).join('');

          const handleEditMine = () => {
            setActiveEditId(r.id);
            setEditRating(Number(r.rating) || 0);
            setEditComment(r.comment || '');

            // (optioneel) voor je deleteMyReview flow
            setMyExistingReview({
              id: r.id,
              rating: r.rating,
              comment: r.comment,
              created_at: r.created_at,
              updated_at: r.updated_at,
            });

            setReviewMsg('');
          };

          const handleDeleteMine = async () => {
            // koppel de juiste review aan deleteMyReview()
            setMyExistingReview({
              id: r.id,
              rating: r.rating,
              comment: r.comment,
              created_at: r.created_at,
              updated_at: r.updated_at,
            });

            await deleteMyReview();
          };

          return (
            <div
              key={r.id}
              style={{
                width: '100%',
                textAlign: 'left',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 18,
                padding: 12,
                cursor: 'default',
                color: 'rgba(255,255,255,0.92)',
                boxShadow: 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 650,
                      letterSpacing: 0.2,
                      lineHeight: 1.15,
                      fontSize: 16,
                      whiteSpace: 'normal',
                      overflow: 'hidden',
                    }}
                  >
                    {location?.name ||
                      (language === 'nl' ? 'Onbekend event' : 'Unknown event')}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: THEME.muted,
                      marginTop: 4,
                      fontWeight: 450,
                    }}
                  >
                    {dateLabel}
                  </div>
                </div>

                <div
                  style={{
                    fontWeight: 600,
                    letterSpacing: 0.6,
                    fontSize: 14,
                    opacity: 0.95,
                    flexShrink: 0,
                  }}
                  aria-label={`Rating: ${r.rating || 0} / 5`}
                  title={`Rating: ${r.rating || 0} / 5`}
                >
                  <RenderStars value={r.rating || 0} size={14} gap={3} />
                </div>
              </div>

              {r.comment ? (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.78)',
                    fontWeight: 450,
                    lineHeight: 1.35,
                  }}
                >
                  {r.comment}
                </div>
              ) : null}

              <div
                style={{
                  marginTop: 10,
                  fontSize: 12.5,
                  color: 'rgba(255,255,255,0.55)',
                  fontWeight: 450,
                }}
              >
                {language === 'nl'
                  ? "Tip: open het event en klik daar op 'Bewerk' bij jouw review."
                  : "Tip: open the event and click 'Edit' on your review."}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  // =========================
  // PAGE + LANGUAGE
  // =========================
  const [pageState, setPageState] = useState('home');
  const [language, setLanguage] = useState('nl');

  // =========================
  // UI STATE
  // =========================
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mapPresetVibe, setMapPresetVibe] = useState(null);
  const [previewPayload, setPreviewPayload] = useState(null);

  // =========================
  // DATA FROM DB
  // =========================
  const [vibesFromDb, setVibesFromDb] = useState([]);
  const [categoriesFromDb, setCategoriesFromDb] = useState([]);
  const [locationsFromDb, setLocationsFromDb] = useState([]);

  // =========================
  // AUTH
  // =========================
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // =========================
  // PROFILE + FAVORITES
  // =========================
  const [profile, setProfile] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoriteMeta, setFavoriteMeta] = useState(new Map());
  const [pendingFavoriteId, setPendingFavoriteId] = useState(null);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // =========================
  // REFS
  // =========================
  const searchTrackTimerRef = useRef(null);

  // =========================
  // DERIVED STATE: ROLE / ACCESS
  // =========================
  const isAdmin = !!profile?.is_admin;

  // =========================
  // DERIVED STATE: CURRENT PAGE
  // =========================
  const isHome = pageState === 'home';
  const isCategory = pageState === 'category';
  const isVibes = pageState === 'vibes';
  const isMap = pageState === 'map';
  const isDetail = pageState === 'detail';
  const isReviews = pageState === 'reviews';
  const isAccount = pageState === 'account';
  const isAdminPage = pageState === 'admin';

  const isFooterPage = [
    'about',
    'how',
    'organizers',
    'privacy',
    'terms',
    'contact',
    'feedback',
  ].includes(pageState);

  // =========================
  // DERIVED STATE: THEME MODE
  // =========================
  const isDarkUI =
    isHome ||
    isCategory ||
    isVibes ||
    isMap ||
    isDetail ||
    isReviews ||
    isFooterPage ||
    isAccount;

  useEffect(() => {
    const saved = localStorage.getItem('lokaly_language');
    if (saved === 'nl' || saved === 'en') setLanguage(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('lokaly_language', language);
  }, [language]);

  const handleSearchChange = (val) => {
    setSearchTerm(val);

    const q = (val || '').trim();
    if (q.length < 2) return;

    if (searchTrackTimerRef.current) {
      clearTimeout(searchTrackTimerRef.current);
    }

    searchTrackTimerRef.current = setTimeout(() => {
      track({
        event_name: 'search_change',
        page: pageState,
        meta: { query: q },
        user_id: user?.id || null,
      });
    }, 500);
  };

  useEffect(() => {
    const BG = isAdminPage ? '#FFFFFF' : isDarkUI ? '#000000' : THEME.bg;
    const TEXT = isDarkUI ? 'rgba(235,240,255,0.92)' : THEME.text;
    const MUTED = isDarkUI ? 'rgba(235,240,255,0.62)' : THEME.muted;
    const SURFACE = isDarkUI ? 'rgba(255,255,255,0.06)' : THEME.surface;
    const BORDER = isDarkUI ? 'rgba(255,255,255,0.10)' : THEME.border;

    document.body.style.background = BG;
    document.body.style.color = TEXT;

    // CSS vars die jij al gebruikt in je cards/secties
    document.documentElement.style.setProperty('--lokaly-bg', BG);
    document.documentElement.style.setProperty('--lokaly-text', TEXT);
    document.documentElement.style.setProperty('--lokaly-muted', MUTED);
    document.documentElement.style.setProperty('--lokaly-surface', SURFACE);
    document.documentElement.style.setProperty('--lokaly-border', BORDER);

    // Zorg dat inputs / selects ook readable blijven op donker
    const styleElId = 'lokaly-theme-overrides';
    let styleEl = document.getElementById(styleElId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleElId;
      document.head.appendChild(styleEl);
    }

    styleEl.innerHTML = `
    input, textarea, select {
      color: var(--lokaly-text);
      background: var(--lokaly-surface);
      border: 1px solid var(--lokaly-border);
      outline: none;
    }
    input::placeholder, textarea::placeholder {
      color: var(--lokaly-muted);
    }
  `;
  }, [isDarkUI, pageState]);

  function slugifyUsername(s) {
    return (s || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 20);
  }

  function randomSuffix(len = 4) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    for (let i = 0; i < len; i++)
      out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }
  function randomDigits(len = 4) {
    const chars = '0123456789';
    let out = '';
    for (let i = 0; i < len; i++)
      out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }

  async function generateUniqueUsername(authUser) {
    const emailBase = slugifyUsername((authUser?.email || '').split('@')[0]);
    const base = emailBase || 'user';

    // We leunen op de UNIQUE index: proberen, als conflict → suffix veranderen
    // We checken niet vooraf in de DB (scheelt RLS gedoe).
    return `${base}_${randomSuffix(5)}`;
  }
  async function generateUniqueUsername(authUser) {
    // ✅ Gebruik NIET email (kan volledige namen bevatten)
    const metaName =
      authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || '';

    const parts = (metaName || '').trim().split(' ').filter(Boolean);
    const first = parts[0] || '';
    const last = parts.length > 1 ? parts.slice(1).join(' ') : '';

    // 1) Initialen (max 2 chars)
    const firstClean = slugifyUsername(first).replace(/_/g, '');
    const lastClean = slugifyUsername(last).replace(/_/g, '');

    const fi = firstClean[0] || 'u'; // user
    const li = lastClean[0] || 'x';

    // 2) Kleine "mix" van 1–2 letters (geen volledige naam)
    // - pak max 2 letters van last (of first als last ontbreekt)
    const stemSource = lastClean || firstClean || 'user';
    const stem2 = (stemSource.slice(0, 2) || 'xx').toLowerCase();

    // 3) Uniek nummer
    const num = randomDigits(4);

    // Voorbeeld: "jsso_4821" (J S + 'so' + 4821)
    return `${fi}${li}${stem2}_${num}`;
  }

  const PROFILE_SELECT =
    'id, first_name, last_name, gender, nationality, avatar_url, username, birth_date, created_at, is_admin, address_line1, house_number, address_line2, postal_code, city, country_code, home_lat, home_lng';

  // 👤 Profielfunctie: zorg dat er een profiel is voor deze user
  async function ensureProfileForUser(authUser) {
    if (!authUser) {
      setProfile(null);
      return;
    }

    // 1) Probeer profiel te laden (ZONDER email kolom)
    const { data: existing, error: selectError } = await supabase
      .from('profiles')
      .select(PROFILE_SELECT)
      .eq('id', authUser.id)
      .maybeSingle();

    if (selectError) {
      console.error(
        ' Profiel select error:',
        selectError.message || selectError
      );
      return;
    }

    // Houd login_email synced (nodig voor login via username)
    if (authUser?.email) {
      await supabase
        .from('profiles')
        .update({ login_email: authUser.email })
        .eq('id', authUser.id);
    }

    // 2) Als er nog geen profiel is: maak aan
    if (!existing) {
      let username = await generateUniqueUsername(authUser);

      let inserted = null;
      let insertError = null;

      for (let attempt = 0; attempt < 5; attempt++) {
        const metaName =
          authUser?.user_metadata?.full_name ||
          authUser?.user_metadata?.name ||
          '';

        const parts = (metaName || '').trim().split(' ').filter(Boolean);
        const first = parts[0] || null;
        const last = parts.length > 1 ? parts.slice(1).join(' ') : null;

        const payload = {
          id: authUser.id,
          username,
          login_email: authUser.email || null,
          full_name: metaName ? metaName : null,
          first_name: first,
          last_name: last,
          gender: null,
          nationality: null,
          avatar_url: authUser?.user_metadata?.avatar_url || null,
          avatar_path: null,
          address_line1: null,
          house_number: null,
          address_line2: null,
          postal_code: null,
          city: null,
          country_code: null,
          home_lat: null,
          home_lng: null,
          home_place_id: null,
          home_formatted_address: null,
        };

        const res = await supabase
          .from('profiles')
          .insert(payload)
          .select(PROFILE_SELECT)
          .single();

        inserted = res.data;
        insertError = res.error;

        if (!insertError) break;

        // bij conflict: nieuwe username proberen
        username = await generateUniqueUsername(authUser);
      }

      if (insertError) {
        console.error(
          ' Profiel insert error:',
          insertError.message || insertError
        );
        return;
      }

      setProfile(inserted);
      return;
    }

    // 3) Bestaat al — maar als username ontbreekt: zet hem alsnog
    if (!existing.username) {
      const username = await generateUniqueUsername(authUser);

      const { data: updated, error: upErr } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', authUser.id)
        .select(PROFILE_SELECT)
        .single();

      if (upErr) {
        console.error(' Username update error:', upErr.message || upErr);
        setProfile(existing);
        return;
      }

      setProfile(updated);
      return;
    }

    setProfile(existing);
  }
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const full = `${window.location.search || ''}${
      window.location.hash || ''
    }`.toLowerCase();

    // Supabase recovery links bevatten meestal type=recovery in query/hash
    if (full.includes('type=recovery')) {
      setAuthModalOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (!pendingFavoriteId) return;

    (async () => {
      await saveFavoriteForUser(pendingFavoriteId, user);
      setPendingFavoriteId(null);
      setAuthModalOpen(false); // sluit modal na succesvol opslaan
    })();
  }, [user, pendingFavoriteId]);

  // ✅ Koppeling aan AUTH state: zodra user wijzigt → profiel + favorites sync
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setFavoriteIds(new Set());
      return;
    }

    ensureProfileForUser(user);
    loadFavoritesForUser(user);
  }, [user]);
  async function loadFavoritesForUser(authUser) {
    if (!authUser) {
      setFavoriteIds(new Set());
      setFavoriteMeta(new Map());
      return;
    }

    setFavoritesLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('location_id, created_at')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(' Favorites select error:', error.message || error);
        return;
      }

      const ids = new Set();
      const meta = new Map();

      (data || []).forEach((row) => {
        ids.add(row.location_id);
        meta.set(row.location_id, row.created_at);
      });

      setFavoriteIds(ids);
      setFavoriteMeta(meta);
    } finally {
      setFavoritesLoading(false);
    }
  }

  async function updateProfileFields(patch) {
    if (!user) throw new Error('Not logged in');

    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', user.id)
      .select(PROFILE_SELECT)
      .single();

    if (error) throw error;

    setProfile(data);
    return data;
  }

  async function updateProfileFirstName(firstName) {
    const clean = (firstName || '').trim();
    const last = (profile?.last_name || '').trim();
    const full = [clean, last].filter(Boolean).join(' ').trim() || null;

    return updateProfileFields({
      first_name: clean || null,
      full_name: full,
    });
  }

  async function updateProfileLastName(lastName) {
    const clean = (lastName || '').trim();
    const first = (profile?.first_name || '').trim();
    const full = [first, clean].filter(Boolean).join(' ').trim() || null;

    return updateProfileFields({
      last_name: clean || null,
      full_name: full,
    });
  }

  async function updateProfileGender(gender) {
    const clean = (gender || '').trim();
    return updateProfileFields({ gender: clean || null });
  }

  async function updateProfileNationality(nationality) {
    const clean = (nationality || '').trim();
    return updateProfileFields({ nationality: clean || null });
  }

  async function updateProfileAvatar({ avatar_url, avatar_path }) {
    return updateProfileFields({
      avatar_url: avatar_url || null,
      avatar_path: avatar_path || null,
    });
  }

  async function handleAvatarPicked(file) {
    if (!user) return;
    if (!file) return;

    // basic check
    if (!file.type?.startsWith('image/')) {
      setProfileError(
        language === 'nl' ? 'Kies een afbeelding.' : 'Please pick an image.'
      );
      return;
    }

    try {
      setProfileError('');
      setProfileSuccess('');

      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${user.id}/avatar.${ext}`;

      const uploadRes = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadRes.error) throw uploadRes.error;

      const pub = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = pub?.data?.publicUrl;

      await onSaveAvatar({ avatar_url: publicUrl, avatar_path: path });

      setProfileSuccess(
        language === 'nl' ? 'Profielfoto opgeslagen.' : 'Profile photo saved.'
      );
    } catch (e) {
      setProfileError(
        e?.message || (language === 'nl' ? 'Upload mislukt.' : 'Upload failed.')
      );
    }
  }

  async function updateProfileFields(fields) {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .update(fields)
      .eq('id', user.id)
      .select(PROFILE_SELECT)
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  }

  // ✅ vervangt "full name"
  async function updateProfileFirstName(firstName) {
    const clean = (firstName || '').trim();
    return updateProfileFields({ first_name: clean || null });
  }

  async function updateProfileLastName(lastName) {
    const clean = (lastName || '').trim();
    return updateProfileFields({ last_name: clean || null });
  }

  async function updateProfileGender(gender) {
    const clean = (gender || '').trim();
    return updateProfileFields({ gender: clean || null });
  }

  async function updateProfileNationality(nationality) {
    const clean = (nationality || '').trim();
    return updateProfileFields({ nationality: clean || null });
  }

  async function updateProfileAvatarUrl(url) {
    const clean = (url || '').trim();
    return updateProfileFields({ avatar_url: clean || null });
  }

  // ✅ bestaande functies blijven, maar via updateProfileFields
  async function updateProfileBirthDate(birthDate) {
    // verwacht "YYYY-MM-DD" of leeg
    const clean = (birthDate || '').trim();
    return updateProfileFields({ birth_date: clean || null });
  }

  async function updateProfileAddress(address) {
    const clean = (v) => {
      const t = (v || '').trim();
      return t ? t : null;
    };

    return updateProfileFields({
      address_line1: clean(address?.address_line1),
      house_number: clean(address?.house_number),
      address_line2: clean(address?.address_line2),
      postal_code: clean(address?.postal_code),
      city: clean(address?.city),
      country_code: clean(address?.country_code),
      home_lat: address?.home_lat ?? null,
      home_lng: address?.home_lng ?? null,
      home_place_id: address?.home_place_id ?? null,
      home_formatted_address: clean(address?.home_formatted_address),
    });
  }

  async function updateProfileUsername(newUsername) {
    const clean = (newUsername || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9._-]/g, '');

    if (!clean) return;
    return updateProfileFields({ username: clean });
  }

  async function saveFavoriteForUser(locationId, authUser) {
    if (!authUser || !locationId) return;

    // Upsert voorkomt dubbele rows en voorkomt "per ongeluk verwijderen"
    const { error } = await supabase
      .from('favorites')
      .upsert(
        { user_id: authUser.id, location_id: locationId },
        { onConflict: 'user_id,location_id' }
      );

    if (error) {
      console.error(' Pending favorite upsert error:', error.message || error);
      return;
    }

    // Zorg dat UI meteen klopt
    await loadFavoritesForUser(authUser);
  }

  async function toggleFavorite(locationId) {
    track({
      event_name: 'favorite_added',
      page: pageState,
      meta: { source: 'detail_page' },
      user_id: user?.id || null,
      // location_id: selectedLocation?.id || null,
    });

    if (!user) {
      setPendingFavoriteId(locationId); // onthoud welke event de user wilde opslaan
      setAuthModalOpen(true); // open login/signup
      return;
    }

    const alreadyFav = favoriteIds.has(locationId);

    track({
      event_name: alreadyFav ? 'favorite_remove' : 'favorite_add',
      page: pageState,
      location_id: locationId,
      user_id: user?.id || null,
    });

    // Optimistische UI update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (alreadyFav) next.delete(locationId);
      else next.add(locationId);
      return next;
    });

    setFavoriteMeta((prev) => {
      const next = new Map(prev);
      if (alreadyFav) {
        next.delete(locationId);
      } else {
        next.set(locationId, new Date().toISOString()); // fallback; echte komt na reload
      }
      return next;
    });

    try {
      if (alreadyFav) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('location_id', locationId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('favorites').insert({
          user_id: user.id,
          location_id: locationId,
        });

        if (error) throw error;
      }

      // Na succesvolle write: opnieuw laden voor echte created_at volgorde
      await loadFavoritesForUser(user);
    } catch (err) {
      console.error(' Toggle favorite error:', err.message || err);
      await loadFavoritesForUser(user); // revert naar DB waarheid
    }
  }

  // Fallbacks: als Supabase leeg is, gebruik de hard-coded data
  const effectiveVibes =
    vibesFromDb && vibesFromDb.length > 0 ? vibesFromDb : VIBES;

  const effectiveCategories =
    categoriesFromDb && categoriesFromDb.length > 0
      ? categoriesFromDb
      : CATEGORIES;

  // ✅ 1) ALLES (admin-lijst)
  const effectiveLocationsAll =
    locationsFromDb && locationsFromDb.length > 0 ? locationsFromDb : LOCATIONS;

  // ✅ 2) PUBLIEK (alleen published)
  const effectiveLocationsPublic = useMemo(() => {
    const base = effectiveLocationsAll || [];
    return base.filter((l) => {
      const published = l?.isPublished ?? l?.is_published ?? false;
      return published === true;
    });
  }, [effectiveLocationsAll]);

  // ✅ 3) De rest van de app gebruikt standaard de publieke lijst
  const effectiveLocations = effectiveLocationsPublic;

  const isMobile = useIsMobile();

  // Locations uit Supabase (voor nu nog niet aan de UI gekoppeld)
  const [locations, setLocations] = useState(LOCATIONS); // start met de huidige dummy-data
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const code = params.get('code');

    if (type === 'recovery' && code) {
      (async () => {
        try {
          await supabase.auth.exchangeCodeForSession(code);
        } catch (e) {
          // optional: console.log(e)
        }
      })();
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const href = window.location.href;
    // Supabase recovery links bevatten meestal type=recovery
    if (href.includes('type=recovery')) {
      setAuthModalOpen(true);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      const body = document.body;
      [html, body].forEach((el) => {
        if (!el) return;
        el.style.margin = '0';
        el.style.padding = '0';
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.overflowX = 'hidden';
        el.style.background = THEME.bg;
      });
    }
  }, []);

  // ✅ Locations uit Supabase ophalen en in state zetten
  // ✅ Locations uit Supabase ophalen en in state zetten (met published filter)
  const loadLocations = useCallback(async () => {
    setLocationsLoading(true);
    setLocationsError(null);

    try {
      let query = supabase.from('locations').select(`
  id,
  name,
  name_nl,
  name_en,
  slug,
  description_long,
  description_long_nl,
  description_long_en,
  description_short,
  description_short_nl,
  description_short_en,
  address,
  lat,
  lng,
  rating,
  rating_count,
  price_level,
  price_min,
  price_max,
  is_free,
  price_items,
  price_note,
  price_source_url,
  price_updated_at,
  website_url,
  booking_url,
  image_url,
  is_featured,
  hero_featured,
  home_section,
  top10_rank,
  opening_hours,
  opening_hours_v2,
  view_count,
  baseline_rating,
  baseline_weight,
  use_baseline,
  user_rating_sum,
  user_rating_count,
  rating,
  rating_count,
  is_published,
  published_at,
  created_by,
  created_at,
  updated_at,
  categories:category_id ( id, name, name_nl, name_en, slug ),
  districts:district_id ( name, name_nl, name_en, slug ),
  vibes:vibe_id ( id, name, slug )
`);

      // ✅ Normale bezoekers zien alleen gepubliceerde events
      if (!isAdmin) query = query.eq('is_published', true);

      const { data, error } = await query;
      if (error) throw error;

      const locationIds = Array.isArray(data) ? data.map((row) => row.id) : [];

      let categoriesLinks = [];
      let vibesLinks = [];

      if (locationIds.length) {
        const { data: categoriesData, error: categoriesLinksError } =
          await supabase
            .from('location_categories')
            .select(
              `
      location_id,
      category_id,
      categories:category_id ( id, name, name_nl, name_en, slug )
    `
            )
            .in('location_id', locationIds);

        if (categoriesLinksError) throw categoriesLinksError;
        categoriesLinks = Array.isArray(categoriesData) ? categoriesData : [];

        const { data: vibesData, error: vibesLinksError } = await supabase
          .from('location_vibes')
          .select(
            `
      location_id,
      vibe_id,
      vibes:vibe_id ( id, name, slug )
    `
          )
          .in('location_id', locationIds);

        if (vibesLinksError) throw vibesLinksError;
        vibesLinks = Array.isArray(vibesData) ? vibesData : [];
      }

      const categoriesByLocationId = categoriesLinks.reduce((acc, row) => {
        const key = row.location_id;
        if (!acc[key]) acc[key] = [];
        acc[key].push(row);
        return acc;
      }, {});

      const vibesByLocationId = vibesLinks.reduce((acc, row) => {
        const key = row.location_id;
        if (!acc[key]) acc[key] = [];
        acc[key].push(row);
        return acc;
      }, {});

      const mapped = (data || []).map((row) => {
        const displayRating = computeDisplayRating(row);
        const categorySlug = row.categories?.slug || null;
        const categoryName =
          language === 'nl'
            ? row.categories?.name_nl || row.categories?.name || null
            : row.categories?.name_en ||
              row.categories?.name_nl ||
              row.categories?.name ||
              null;
        const districtSlug = row.districts?.slug || null;
        const districtName =
          language === 'nl'
            ? row.districts?.name_nl || row.districts?.name || null
            : row.districts?.name_en ||
              row.districts?.name_nl ||
              row.districts?.name ||
              null;
        const vibeSlug = row.vibes?.slug || null;
        const vibeName = row.vibes?.name || null;

        const categoryLinksForRow = categoriesByLocationId[row.id] || [];
        const vibeLinksForRow = vibesByLocationId[row.id] || [];

        const multiCategories = categoryLinksForRow
          .map((lc) => lc?.categories)
          .filter(Boolean);

        const multiVibes = vibeLinksForRow
          .map((lv) => lv?.vibes)
          .filter(Boolean);

        const rawVibeIdsFromLinks = vibeLinksForRow
          .map((lv) => lv?.vibe_id)
          .filter(Boolean);

        const categoryNames = multiCategories
          .map((c) =>
            language === 'nl'
              ? c?.name_nl || c?.name || null
              : c?.name_en || c?.name_nl || c?.name || null
          )
          .filter(Boolean);

        const categorySlugs = multiCategories
          .map((c) => c?.slug)
          .filter(Boolean);

        const vibeNames = multiVibes.map((v) => v?.name).filter(Boolean);

        const vibeSlugs = multiVibes.map((v) => v?.slug).filter(Boolean);

        const categoryIds = multiCategories.map((c) => c?.id).filter(Boolean);

        const vibeIds = multiVibes.length
          ? multiVibes.map((v) => v?.id).filter(Boolean)
          : rawVibeIdsFromLinks;

        const categoryType = categorySlug || null;

        // heel belangrijk:
        // als er meerdere vibes zijn, gebruik dan de eerste uit multiVibes als fallback
        const vibeLabel = vibeName || vibeNames[0] || null;
        const resolvedVibeSlug = vibeSlug || vibeSlugs[0] || null;
        const resolvedVibeName = vibeName || vibeNames[0] || null;

        return {
          id: row.id,
          // --- i18n fields from DB (keep raw) ---
          name_nl: row.name_nl ?? row.name ?? '',
          name_en: row.name_en ?? null,

          description_short_nl:
            row.description_short_nl ?? row.description_short ?? '',
          description_short_en: row.description_short_en ?? null,

          description_long_nl:
            row.description_long_nl ?? row.description_long ?? null,
          description_long_en: row.description_long_en ?? null,

          // --- display fields used by your UI right now ---
          name:
            language === 'nl'
              ? row.name_nl || row.name || ''
              : row.name_en || row.name_nl || row.name || '',

          // kaart/hero blijft description_short gebruiken:
          description:
            language === 'nl'
              ? row.description_short || row.description_short_nl || ''
              : row.description_short_en ||
                row.description_short ||
                row.description_short_nl ||
                '',

          description_short:
            language === 'nl'
              ? row.description_short || row.description_short_nl || ''
              : row.description_short_en ||
                row.description_short ||
                row.description_short_nl ||
                '',

          description_long:
            language === 'nl'
              ? row.description_long || row.description_long_nl || null
              : row.description_long_en ||
                row.description_long ||
                row.description_long_nl ||
                null,
          address: row.address,
          lat: row.lat,
          lng: row.lng,

          rating: Number.isFinite(displayRating)
            ? Number(displayRating.toFixed(1))
            : null,
          ratingCount: Number(row?.user_rating_count ?? 0),

          baselineRating: row.baseline_rating ?? null,
          useBaseline: row.use_baseline !== false,

          priceLevel: row.price_level,
          priceMin: row.price_min,
          priceMax: row.price_max,
          isFree: row.is_free ?? false,
          priceItems: row.price_items ?? [],
          priceNote: row.price_note ?? null,
          priceSourceUrl: row.price_source_url ?? null,
          priceUpdatedAt: row.price_updated_at ?? null,
          website: row.website_url,
          bookingUrl: row.booking_url,
          mainImage: row.image_url,
          isFeatured: row.is_featured,
          heroFeatured: row.hero_featured ?? false,
          homeSection: row.home_section ?? null,
          top10Rank: row.top10_rank,
          opening_hours: row.opening_hours,
          opening_hours_v2: row.opening_hours_v2,
          viewCount: row.view_count ?? 0,

          isPublished: row.is_published,
          publishedAt: row.published_at,
          createdBy: row.created_by,
          createdAt: row.created_at,
          updatedAt: row.updated_at,

          categorySlug,
          categoryName,
          categoryIds,
          category_ids: categoryIds,
          categoryNames,
          category_names: categoryNames,
          categorySlugs,
          category_slugs: categorySlugs,

          districtSlug,
          district: districtName,

          vibeSlug: resolvedVibeSlug,
          vibeName: resolvedVibeName,
          vibeIds,
          vibe_ids: vibeIds,
          vibeNames,
          vibe_names: vibeNames,
          vibeSlugs,
          vibe_slugs: vibeSlugs,

          type: categoryType,
          vibe: vibeLabel,
        };
      });

      setLocations(mapped);
      setLocationsFromDb(mapped);
      // ✅ als je in de detailpagina zit: refresh selectedLocation met de nieuwste data
      setSelectedLocation((prev) => {
        if (!prev) return prev;
        const fresh = mapped.find((x) => x.id === prev.id);
        return fresh ?? prev;
      });
    } catch (err) {
      console.error('❌ Fout bij laden locations:', err?.message || err);
      setLocationsError(err?.message || 'Onbekende fout');
    } finally {
      setLocationsLoading(false);
    }
  }, [isAdmin, language]);

  // ✅ opnieuw laden bij start + zodra admin-status verandert
  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  // ✅ Live updates: als admin iets publish/draft zet, refreshen alle clients automatisch
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timer = null;

    const channel = supabase
      .channel('lokaly_locations_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'locations' },
        () => {
          // debounce: meerdere updates achter elkaar => 1 reload
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            loadLocations();
          }, 250);
        }
      )
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [loadLocations]);

  // Eerste test: data uit Supabase halen (vibes + categories)
  useEffect(() => {
    async function loadInitialData() {
      try {
        // Vibes ophalen
        const { data: vibes, error: vibesError } = await supabase
          .from('vibes')
          .select('id, name, slug, icon, is_active, image_url, subtitle')
          .eq('is_active', true);

        if (vibesError) throw vibesError;

        // Categories ophalen
        const { data: categories, error: catError } = await supabase
          .from('categories')
          .select(
            'id, name, slug, is_active, cover_url, bg_color, title_color, badge_text'
          )
          .eq('is_active', true);

        if (catError) throw catError;

        // 👉 Zet in state
        setVibesFromDb(vibes || []);
        setCategoriesFromDb(categories || []);
      } catch (err) {
        console.error(' Fout bij laden vanuit Supabase:', err.message || err);
      }
    }

    loadInitialData();
  }, []);

  // 👤 AUTH USER LADEN & LISTENERS
  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();
      if (!error) {
        setUser(data?.user ?? null);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ===================== URL / PAGINA SYNC (DETAIL PAGE READY) =====================

  // onthoud waar je vandaan kwam als je een detail opent
  const detailFromRef = useRef('home');
  const pendingDetailIdRef = useRef(null);
  const [mapPreviewLoc, setMapPreviewLoc] = useState(null);

  const lastViewLoggedRef = useRef(null);

  // refs zodat marker click altijd de actuele preview "ziet"
  const previewLocRef = useRef(null);
  useEffect(() => {
    previewLocRef.current = mapPreviewLoc;
  }, [mapPreviewLoc]);

  const buildUrl = ({ p, loc, vibe, auth }) => {
    const url = new URL(window.location.href);

    if (p) url.searchParams.set('p', p);
    else url.searchParams.delete('p');

    if (loc) url.searchParams.set('loc', loc);
    else url.searchParams.delete('loc');

    if (vibe) url.searchParams.set('vibe', vibe);
    else url.searchParams.delete('vibe');

    if (auth) url.searchParams.set('auth', '1');
    else url.searchParams.delete('auth');

    const qs = url.searchParams.toString();
    return url.pathname + (qs ? `?${qs}` : '') + (url.hash || '');
  };

  // ✅ Altijd bovenaan starten bij paginawissel (ook bij back/forward)
  const scrollToTop = () => {
    if (typeof window === 'undefined') return;

    // voor veiligheid: pak de echte scroll-root
    const el = document.scrollingElement || document.documentElement;
    el.scrollTop = 0;
    document.body.scrollTop = 0;

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  useEffect(() => {
    if (pageState !== 'detail') return;
    requestAnimationFrame(scrollToTop);
  }, [pageState, selectedLocation?.id]);
  useEffect(() => {
    // reset zodra je detail verlaat, zodat opnieuw openen weer telt
    if (pageState !== 'detail') {
      lastViewLoggedRef.current = null;
      return;
    }

    const id = selectedLocation?.id;
    if (!id) return;

    // voorkom dubbele +1 door re-renders
    if (lastViewLoggedRef.current === id) return;
    lastViewLoggedRef.current = id;

    (async () => {
      try {
        await supabase.rpc('increment_location_view', { loc_id: id });
      } catch (e) {
        // stil falen (views zijn niet mission critical)
        console.warn('View increment failed:', e?.message || e);
      }
    })();
  }, [pageState, selectedLocation?.id]);

  // navigate pusht een nieuwe “pagina” in history
  const navigate = (page, opts = {}) => {
    const vibe = opts.vibe ?? null;

    setPageState(page);
    if (vibe) setMapPresetVibe(vibe);

    // sluit open detail/modal bij paginawissel (behalve als je naar detail navigeert)
    if (page !== 'detail') setSelectedLocation(null);

    if (typeof window !== 'undefined' && window.history?.pushState) {
      const href = buildUrl({ p: page, loc: null, vibe, auth: null });
      window.history.pushState({ p: page, loc: null, vibe }, '', href);
    }

    // ✅ na state/route update: gegarandeerd terug naar top
    requestAnimationFrame(scrollToTop);
  };
  // ✅ open reviews pagina + push in history
  const openReviewsWithHistory = (locOrId) => {
    const id = typeof locOrId === 'string' ? locOrId : locOrId?.id;
    if (!id) return;

    const found =
      (effectiveLocations || []).find((l) => l.id === id) ||
      (typeof locOrId === 'object' ? locOrId : null) ||
      null;

    setSelectedLocation(found);
    setPageState('reviews');

    if (typeof window !== 'undefined' && window.history?.pushState) {
      const href = buildUrl({ p: 'reviews', loc: id, vibe: null, auth: null });
      window.history.pushState({ p: 'reviews', loc: id }, '', href);
    }

    if (typeof window !== 'undefined') requestAnimationFrame(scrollToTop);
  };

  // ✅ close reviews: liefst terug via device-back, anders fallback
  const closeReviewsWithHistory = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return;
    }

    const backTo = selectedLocation ? 'detail' : 'home';
    setPageState(backTo);

    if (typeof window !== 'undefined' && window.history?.replaceState) {
      const href = buildUrl({
        p: backTo,
        loc: backTo === 'detail' ? selectedLocation?.id ?? null : null,
        vibe: null,
        auth: null,
      });

      window.history.replaceState(
        {
          p: backTo,
          loc: backTo === 'detail' ? selectedLocation?.id ?? null : null,
        },
        '',
        href
      );
    }

    if (typeof window !== 'undefined') requestAnimationFrame(scrollToTop);
  };

  // ===================== ANALYTICS (MVP) =====================
  const getSessionId = () => {
  if (typeof window === 'undefined') return 'server';
  const key = 'lokaly_session_id';
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid =
      crypto?.randomUUID?.() ||
      `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    sessionStorage.setItem(key, sid);
  }
  return sid;
};

  const track = async ({
    event_name,
    page,
    location_id = null,
    category_slug = null,
    vibe_slug = null,
    district = null,
    meta = {},
    user_id = null,
  }) => {
    try {
      const session_id = getSessionId();
      await supabase.from('analytics_events').insert([
        {
          session_id,
          user_id,
          event_name,
          page,
          location_id,
          category_slug,
          vibe_slug,
          district,
          meta,
        },
      ]);
    } catch {
      // silent fail (analytics mag je UX nooit breken)
    }
  };

  // open locatie => ga naar detail + push in history
  const openLocationWithHistory = (loc) => {
    if (!loc) return;

    // ✅ Event click (open detail / card click)
    (async () => {
      try {
        await supabase.rpc('increment_event_click', { loc_id: loc.id });
      } catch (e) {
        console.warn('Event click increment failed:', e?.message || e);
      }
    })();

    if (pageState !== 'detail') detailFromRef.current = pageState || 'home';

    setSelectedLocation(loc);
    setPageState('detail');

    track({
      event_name: 'location_view',
      page: pageState,
      location_id: loc?.id ?? null,
      meta: {
        source: detailFromRef.current || pageState || 'unknown',
        location_name: loc?.name ?? null,
      },
      user_id: user?.id || null,
    });

    console.log('[LOKALY DEBUG] location_view tracked:', {
      location_id: loc?.id,
      location_name: loc?.name,
      source_page: pageState,
      user_id: user?.id || 'anonymous',
    });

    if (typeof window !== 'undefined' && window.history?.pushState) {
      const href = buildUrl({
        p: 'detail',
        loc: loc?.id ?? null,
        vibe: null,
        auth: null,
      });
      window.history.pushState({ p: 'detail', loc: loc?.id ?? null }, '', href);
    }

    // ✅ NA de render naar boven (dit is de belangrijke fix)
    if (typeof window !== 'undefined') {
      requestAnimationFrame(scrollToTop);
    }
  };

  // close locatie: als er loc in URL zit → back (zodat device-back logisch blijft)
  const closeLocationWithHistory = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const hasLoc = url.searchParams.get('loc');
      const p = url.searchParams.get('p') || 'home';
      if (hasLoc && p === 'detail' && window.history.length > 1) {
        window.history.back();
        return;
      }
    }

    setSelectedLocation(null);

    const backTo = detailFromRef.current || 'home';
    setPageState(backTo);

    // URL ook netjes “clean” maken (zonder loc)
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      const href = buildUrl({ p: backTo, loc: null, vibe: null, auth: null });
      window.history.replaceState({ p: backTo, loc: null }, '', href);
    }

    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  };

  // device/browser back/forward → state syncen zonder opnieuw pushen
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ✅ voorkom dat browser automatisch scrollpositie “onthoudt”
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const applyFromUrl = () => {
      const url = new URL(window.location.href);
      const p = url.searchParams.get('p') || 'home';
      const vibe = url.searchParams.get('vibe');
      const locId = url.searchParams.get('loc');

      setPageState(p);
      if (vibe) setMapPresetVibe(vibe);

      if ((p === 'detail' || p === 'reviews') && locId) {
        const found =
          (effectiveLocations || []).find((l) => l.id === locId) || null;

        if (found) {
          setSelectedLocation(found);
          pendingDetailIdRef.current = null;
        } else {
          pendingDetailIdRef.current = locId;
          setSelectedLocation(null);
        }
      } else {
        setSelectedLocation(null);
        pendingDetailIdRef.current = null;
      }

      // ✅ ook bij URL-sync / back-forward altijd bovenaan starten
      requestAnimationFrame(scrollToTop);
    };

    applyFromUrl();
    window.addEventListener('popstate', applyFromUrl);
    return () => window.removeEventListener('popstate', applyFromUrl);
  }, [effectiveLocations]);

  useEffect(() => {
    if (pageState !== 'preview') {
      setPreviewPayload(null);
      return;
    }

    try {
      const raw = sessionStorage.getItem('lokaly_preview_payload');
      if (!raw) {
        setPreviewPayload(null);
        return;
      }

      const parsed = JSON.parse(raw);
      setPreviewPayload(parsed && typeof parsed === 'object' ? parsed : null);
    } catch (e) {
      setPreviewPayload(null);
    }
  }, [pageState]);

  // als de data later binnenkomt, resolve eventueel pending detail
  useEffect(() => {
    const pendingId = pendingDetailIdRef.current;
    if (!pendingId) return;
    if (pageState !== 'detail' && pageState !== 'reviews') return;

    const found =
      (effectiveLocations || []).find((l) => l.id === pendingId) || null;
    if (found) {
      setSelectedLocation(found);
      pendingDetailIdRef.current = null;
    }
  }, [effectiveLocations, pageState]);

  const handleSearchSelect = (loc) => {
    openLocationWithHistory(loc);
    setSearchTerm('');
    setMobileSearchOpen(false);
    setSearchOpen(false);
  };

  const handleVibeSelect = (vibeSlug) => {
    // (optioneel) bewaren zodat de map later ook nog op die vibe kan openen
    setMapPresetVibe(vibeSlug);

    // ✅ ga naar Category resultaten i.p.v. Map
    navigate('category', { vibe: vibeSlug });
  };

  useEffect(() => {
    const sessionKey = 'lokaly_session_id';
    const sessionStartedKey = 'lokaly_session_started';

    if (sessionStorage.getItem(sessionStartedKey) === 'true') {
      console.log('[LOKALY DEBUG] Session already started, skipping session_start event');
      return;
    }

    let sessionId = sessionStorage.getItem(sessionKey);

    if (!sessionId) {
      sessionId = crypto?.randomUUID?.() || String(Date.now());
      sessionStorage.setItem(sessionKey, sessionId);
      console.log('[LOKALY DEBUG] New session created:', sessionId);
    } else {
      console.log('[LOKALY DEBUG] Existing session found:', sessionId);
    }

    sessionStorage.setItem(sessionStartedKey, 'true');

    track({
      event_name: 'session_start',
      page: pageState,
      meta: { session_id: sessionId },
      user_id: user?.id || null,
    });

    console.log('[LOKALY DEBUG] session_start tracked with session_id:', sessionId, 'page:', pageState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--lokaly-bg)', // ✅ pakt zwart op home
        color: 'var(--lokaly-text)', // ✅ wit/lichte tekst op home
        fontFamily: THEME.font,
      }}
    >
      <style>{`
        /* subtiele, professionele basis */
        .lokaly-display { font-family: ${THEME.fontDisplay}; letter-spacing: -0.2px; }
        .lokaly-muted { color: var(--lokaly-muted); }
  
        .lokaly-card {
          background: var(--lokaly-surface);
          border: 1px solid var(--lokaly-border);
          border-radius: var(--lokaly-radius-sm);
          box-shadow: ${THEME.shadow};
        }
  
        .lokaly-pill {
          border-radius: 999px;
          border: 1px solid var(--lokaly-border);
          background: var(--lokaly-surface);
          backdrop-filter: blur(10px);
        }
  
        .lokaly-pill--active{
          border: 1px solid var(--lokaly-orange-border);
          background: var(--lokaly-orange-soft);
        }
      `}</style>

      <Header
        onNavigate={navigate}
        currentPage={pageState}
        language={language}
        setLanguage={setLanguage}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        mobileSearchOpen={mobileSearchOpen}
        onSearchOpen={() => setSearchOpen(true)}
        onSearchClose={() => setSearchOpen(false)}
        onMobileSearchToggle={() => setMobileSearchOpen((v) => !v)} // ✅ toggle
        user={user}
        profile={profile}
        onAccountClick={() => {
          if (user) navigate('account');
          else setAuthModalOpen(true);
        }}
      />

      <SearchOverlay
        searchTerm={searchTerm}
        language={language}
        onSelect={handleSearchSelect}
        onSearchChange={handleSearchChange}
        visible={isMobile ? mobileSearchOpen : searchOpen}
        onClose={() => {
          setMobileSearchOpen(false);
          setSearchOpen(false);
          setSearchTerm('');
          // extra: force blur zodat je header input niet “blijft hangen”
          if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
          }
        }}
        locations={effectiveLocations}
      />

      <main style={{ flex: 1, paddingBottom: 40 }}>
        {pageState === 'home' && (
          <HomePage
            language={language}
            onLocationClick={openLocationWithHistory}
            onVibeSelect={handleVibeSelect}
            onSeeAllCategory={() => navigate('category')}
            onSeeAllVibes={() => navigate('vibes')}
            // 👉 hier geven we Supabase-data door
            locations={effectiveLocations}
            locationsLoading={locationsLoading}
            categories={effectiveCategories}
            vibes={effectiveVibes}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {pageState === 'category' && (
          <CategoryPage
            language={language}
            onLocationClick={openLocationWithHistory}
            // 👉 ook hier Supabase-data doorgeven
            locations={effectiveLocations}
            categories={effectiveCategories}
            vibes={effectiveVibes}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
            locationsLoading={locationsLoading}
          />
        )}
        {pageState === 'vibes' && (
          <VibePage
            language={language}
            onLocationClick={openLocationWithHistory}
            locations={effectiveLocations}
            categories={effectiveCategories}
            vibes={effectiveVibes}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
            locationsLoading={locationsLoading}
          />
        )}
        {pageState === 'reviews' && selectedLocation && (
          <ReviewsPage
            language={language}
            location={selectedLocation}
            locationId={selectedLocation.id}
            onBack={closeReviewsWithHistory}
            user={user}
          />
        )}

        {pageState === 'reviews' && !selectedLocation && (
          <div style={{ padding: 18 }}>
            <div
              className="lokaly-display"
              style={{ fontSize: 22, fontWeight: 800 }}
            >
              {language === 'nl'
                ? 'Locatie niet gevonden'
                : 'Location not found'}
            </div>
            <div className="lokaly-muted" style={{ marginTop: 6 }}>
              {language === 'nl'
                ? 'Ga terug en probeer opnieuw.'
                : 'Go back and try again.'}
            </div>
            <button
              type="button"
              onClick={closeReviewsWithHistory}
              className="lokaly-pill"
              style={{ marginTop: 12, padding: '10px 12px', fontWeight: 700 }}
            >
              {language === 'nl' ? 'Terug' : 'Back'}
            </button>
          </div>
        )}

        {pageState === 'detail' && selectedLocation && (
          <>
            <LocationModal
              asPage={true}
              location={selectedLocation}
              language={language}
              user={user}
              allLocations={effectiveLocations}
              onRefreshLocations={loadLocations}
              isFavorite={favoriteIds.has(selectedLocation.id)}
              onToggleFavorite={() => toggleFavorite(selectedLocation.id)}
              shareLocation={shareLocation}
              onOpenReviews={openReviewsWithHistory}
              onClose={closeLocationWithHistory}
            />
          </>
        )}

        {pageState === 'preview' &&
          (previewPayload?.location ? (
            <>
              <LocationModal
                asPage={true}
                location={previewPayload.location}
                previewMediaItems={
                  Array.isArray(previewPayload.mediaItems)
                    ? previewPayload.mediaItems
                    : []
                }
                language={language}
                user={user}
                allLocations={effectiveLocations}
                onRefreshLocations={loadLocations}
                isFavorite={
                  !!previewPayload.location?.id &&
                  favoriteIds.has(previewPayload.location.id)
                }
                onToggleFavorite={() => {
                  const id = previewPayload.location?.id;
                  if (!id || id === 'preview') return;
                  toggleFavorite(id);
                }}
                onOpenReviews={openReviewsWithHistory}
                onClose={() => {
                  // terug naar admin (of vorige)
                  if (
                    typeof window !== 'undefined' &&
                    window.history.length > 1
                  )
                    window.history.back();
                  else navigate('admin');
                }}
              />

              {/* ✅ exact dezelfde footer als home/category */}
            </>
          ) : (
            <div style={{ padding: 18 }}>
              <div
                className="lokaly-display"
                style={{ fontSize: 22, fontWeight: 800 }}
              >
                {language === 'nl'
                  ? 'Preview niet gevonden'
                  : 'Preview not found'}
              </div>
              <div className="lokaly-muted" style={{ marginTop: 6 }}>
                {language === 'nl'
                  ? 'Ga terug naar de admin en klik opnieuw op Preview pagina.'
                  : 'Go back to admin and click Preview again.'}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (
                    typeof window !== 'undefined' &&
                    window.history.length > 1
                  )
                    window.history.back();
                  else navigate('admin');
                }}
                className="lokaly-pill"
                style={{ marginTop: 12, padding: '10px 12px', fontWeight: 700 }}
              >
                {language === 'nl' ? 'Terug' : 'Back'}
              </button>

              {/* ✅ optioneel: ook in “not found” state dezelfde footer */}
              <div style={{ marginTop: 20 }}>
                <Footer
                  language={language}
                  onNavigate={onNavigate}
                  currentPage={currentPage}
                />
              </div>
            </div>
          ))}

        {pageState === 'map' && (
          <MapPage
            language={language}
            onLocationClick={openLocationWithHistory}
            initialVibe={mapPresetVibe}
            locations={effectiveLocations}
            vibes={effectiveVibes}
            categories={effectiveCategories}
            favoriteIds={favoriteIds}
          />
        )}

        {pageState === 'admin' && (
          <AdminDashboard
            language={language}
            user={user}
            profile={profile}
            categories={effectiveCategories}
            vibes={effectiveVibes}
            onRefreshLocations={loadLocations}
            locations={effectiveLocations}
            onOpenLocation={openLocationWithHistory}
          />
        )}

        {pageState === 'detail' && !selectedLocation && (
          <div style={{ padding: 18 }}>
            <div
              className="lokaly-display"
              style={{ fontSize: 22, fontWeight: 800 }}
            >
              {language === 'nl'
                ? 'Locatie niet gevonden'
                : 'Location not found'}
            </div>
            <div className="lokaly-muted" style={{ marginTop: 6 }}>
              {language === 'nl'
                ? 'Ga terug en probeer opnieuw.'
                : 'Go back and try again.'}
            </div>
            <button
              type="button"
              onClick={closeLocationWithHistory}
              className="lokaly-pill"
              style={{ marginTop: 12, padding: '10px 12px', fontWeight: 700 }}
            >
              {language === 'nl' ? 'Terug' : 'Back'}
            </button>
          </div>
        )}

        {pageState === 'account' && (
          <AccountPage
            language={language}
            setLanguage={setLanguage}
            user={user}
            profile={profile}
            favoriteIds={favoriteIds}
            locations={effectiveLocationsAll}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenLocation={(loc) => openLocationWithHistory(loc)}
            favoriteMeta={favoriteMeta}
            onToggleFavorite={toggleFavorite}
            favoritesLoading={favoritesLoading}
            onNavigate={navigate}
            onSaveFirstName={updateProfileFirstName}
            onSaveLastName={updateProfileLastName}
            onSaveGender={updateProfileGender}
            onSaveNationality={updateProfileNationality}
            onSaveAvatarUrl={updateProfileAvatarUrl}
            onSaveUsername={updateProfileUsername}
            onSaveBirthDate={updateProfileBirthDate}
            onSaveAddress={updateProfileAddress}
          />
        )}
        {pageState === 'about' && (
          <InfoPage language={language} pageKey="about" onNavigate={navigate} />
        )}
        {pageState === 'how' && (
          <InfoPage language={language} pageKey="how" onNavigate={navigate} />
        )}
        {pageState === 'organizers' && (
          <InfoPage
            language={language}
            pageKey="organizers"
            onNavigate={navigate}
          />
        )}
        {pageState === 'privacy' && (
          <InfoPage
            language={language}
            pageKey="privacy"
            onNavigate={navigate}
          />
        )}
        {pageState === 'terms' && (
          <InfoPage language={language} pageKey="terms" onNavigate={navigate} />
        )}
        {pageState === 'contact' && (
          <InfoPage
            language={language}
            pageKey="contact"
            onNavigate={navigate}
          />
        )}
        {pageState === 'feedback' && (
          <FeedbackPage
            language={language}
            user={user}
            onBack={() => navigate('home')}
          />
        )}
      </main>

      <Footer
        language={language}
        onNavigate={navigate}
        currentPage={pageState}
      />
      {authModalOpen && (
        <AuthModal
          language={language}
          user={user}
          onClose={() => {
            setAuthModalOpen(false);
            if (!user) setPendingFavoriteId(null);
          }}
        />
      )}
    </div>
  );
}

function AccountPage({
  language,
  setLanguage,
  user,
  profile,
  favoriteIds,
  locations,
  onOpenAuth,
  onOpenLocation,
  onSaveName,
  favoriteMeta,
  onToggleFavorite,
  favoritesLoading,
  onSaveUsername,
  onSaveBirthDate,
  onNavigate,
  onSaveFirstName,
  onSaveLastName,
  onSaveGender,
  onSaveNationality,
  onSaveAvatarUrl,
  onSaveAddress,
}) {
  const t = STRINGS[language];
  const isMobile = useIsMobile();

  const [nameDraft, setNameDraft] = React.useState(profile?.full_name || '');
  const [savingName, setSavingName] = React.useState(false);
  const [savingAddress, setSavingAddress] = React.useState(false);

  const [usernameDraft, setUsernameDraft] = useState(profile?.username || '');
  const usernameInputRef = React.useRef(null);
  const nameInputRef = React.useRef(null);

  const nameDirtyRef = React.useRef(false);
  const usernameDirtyRef = React.useRef(false);

  const [loadingAuth, setLoadingAuth] = React.useState(false);
  const [authError, setAuthError] = React.useState('');
  const [authSuccess, setAuthSuccess] = React.useState('');
  const [profileError, setProfileError] = React.useState('');
  const [profileSuccess, setProfileSuccess] = React.useState('');

  const [newEmail, setNewEmail] = React.useState(user?.email || '');
  const emailInputRef = React.useRef(null);

  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const currentPwRef = React.useRef(null);
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);

  const [birthDateDraft, setBirthDateDraft] = React.useState(
    isoToNl(profile?.birth_date)
  );
  const [savingBirthDate, setSavingBirthDate] = React.useState(false);
  const birthDateInputRef = React.useRef(null);
  const birthDateDirtyRef = React.useRef(false);
  const [firstNameDraft, setFirstNameDraft] = React.useState(
    profile?.first_name || ''
  );
  const [lastNameDraft, setLastNameDraft] = React.useState(
    profile?.last_name || ''
  );
  const [genderDraft, setGenderDraft] = React.useState(profile?.gender || '');
  const [nationalityDraft, setNationalityDraft] = React.useState(
    profile?.nationality || ''
  );
  const [address1Draft, setAddress1Draft] = React.useState(
    profile?.address_line1 || ''
  );
  const [address2Draft, setAddress2Draft] = React.useState(
    profile?.address_line2 || ''
  );
  const [postalDraft, setPostalDraft] = React.useState(
    profile?.postal_code || ''
  );
  const [cityDraft, setCityDraft] = React.useState(profile?.city || '');
  const [countryDraft, setCountryDraft] = React.useState(
    profile?.country_code || 'NL'
  );
  const [houseNumberDraft, setHouseNumberDraft] = React.useState(
    profile?.house_number || ''
  );
  const [geoLoading, setGeoLoading] = React.useState(false);
  const [geoError, setGeoError] = React.useState(null);
  const address1Ref = React.useRef(null);
  const firstNameDirtyRef = React.useRef(false);
  const lastNameDirtyRef = React.useRef(false);
  const genderDirtyRef = React.useRef(false);
  const nationalityDirtyRef = React.useRef(false);

  const firstNameInputRef = React.useRef(null);
  const lastNameInputRef = React.useRef(null);
  const genderInputRef = React.useRef(null);
  const nationalityInputRef = React.useRef(null);
  const avatarFileRef = React.useRef(null);
  const [avatarUploading, setAvatarUploading] = React.useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [deletingAccount, setDeletingAccount] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState('');

  const [openKey, setOpenKey] = React.useState(null);
  React.useEffect(() => {
    if (openKey === 'myreviews') {
      loadMyReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openKey]);

  // ================== MY REVIEWS (Account) ==================
  const [myReviews, setMyReviews] = React.useState([]);
  const [myReviewsLoading, setMyReviewsLoading] = React.useState(false);
  const [myReviewsError, setMyReviewsError] = React.useState('');
  const [highlightReviewId, setHighlightReviewId] = React.useState(null);

  React.useEffect(() => {
    // alleen als Mijn reviews open staat
    if (openKey !== 'myreviews') return;

    const raw = sessionStorage.getItem('lokalyReviewJump');
    if (!raw) return;

    let j;
    try {
      j = JSON.parse(raw);
    } catch {
      return;
    }

    if (!j.reviewId) return;

    let tries = 0;
    const maxTries = 20;

    const tick = () => {
      tries += 1;

      const el = document.getElementById(`review-${j.reviewId}`);
      if (el) {
        setHighlightReviewId(j.reviewId);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        sessionStorage.removeItem('lokalyReviewJump');
        setTimeout(() => setHighlightReviewId(null), 2500);
        return;
      }

      if (tries < maxTries) setTimeout(tick, 120);
    };

    setTimeout(tick, 120);
  }, [openKey, myReviews.length]);

  const locationsMap = React.useMemo(() => {
    const m = new Map();
    (locations || []).forEach((l) => {
      if (l?.id) m.set(l.id, l);
    });
    return m;
  }, [locations]);

  async function loadMyReviews() {
    if (!user?.id) {
      setMyReviews([]);
      return;
    }

    setMyReviewsLoading(true);
    setMyReviewsError('');

    try {
      const { data, error } = await supabase
        .from('location_reviews')
        .select('id, location_id, rating, comment, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setMyReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn(e);
      setMyReviewsError(
        e?.message ||
          (language === 'nl'
            ? 'Reviews laden mislukt.'
            : 'Failed to load reviews.')
      );
    } finally {
      setMyReviewsLoading(false);
    }
  }

  const NATIONALITIES = [
    { code: 'NL', nl: 'Nederlands', en: 'Dutch' },
    { code: 'BE', nl: 'Belgisch', en: 'Belgian' },
    { code: 'DE', nl: 'Duits', en: 'German' },
    { code: 'FR', nl: 'Frans', en: 'French' },
    { code: 'ES', nl: 'Spaans', en: 'Spanish' },
    { code: 'PT', nl: 'Portugees', en: 'Portuguese' },
    { code: 'IT', nl: 'Italiaans', en: 'Italian' },
    { code: 'GB', nl: 'Brits', en: 'British' },
    { code: 'IE', nl: 'Iers', en: 'Irish' },
    { code: 'US', nl: 'Amerikaans', en: 'American' },
    { code: 'CA', nl: 'Canadees', en: 'Canadian' },
    { code: 'AU', nl: 'Australisch', en: 'Australian' },
    { code: 'NZ', nl: 'Nieuw-Zeelands', en: 'New Zealander' },

    { code: 'SE', nl: 'Zweeds', en: 'Swedish' },
    { code: 'NO', nl: 'Noors', en: 'Norwegian' },
    { code: 'DK', nl: 'Deens', en: 'Danish' },
    { code: 'FI', nl: 'Fins', en: 'Finnish' },
    { code: 'IS', nl: 'IJslands', en: 'Icelandic' },

    { code: 'PL', nl: 'Pools', en: 'Polish' },
    { code: 'CZ', nl: 'Tsjechisch', en: 'Czech' },
    { code: 'SK', nl: 'Slowaaks', en: 'Slovak' },
    { code: 'HU', nl: 'Hongaars', en: 'Hungarian' },
    { code: 'RO', nl: 'Roemeens', en: 'Romanian' },
    { code: 'BG', nl: 'Bulgaars', en: 'Bulgarian' },
    { code: 'GR', nl: 'Grieks', en: 'Greek' },
    { code: 'HR', nl: 'Kroatisch', en: 'Croatian' },
    { code: 'SI', nl: 'Sloveens', en: 'Slovenian' },
    { code: 'RS', nl: 'Servisch', en: 'Serbian' },
    { code: 'UA', nl: 'Oekraïens', en: 'Ukrainian' },
    { code: 'RU', nl: 'Russisch', en: 'Russian' },
    { code: 'LT', nl: 'Litouws', en: 'Lithuanian' },
    { code: 'LV', nl: 'Lets', en: 'Latvian' },
    { code: 'EE', nl: 'Ests', en: 'Estonian' },

    { code: 'CH', nl: 'Zwitsers', en: 'Swiss' },
    { code: 'AT', nl: 'Oostenrijks', en: 'Austrian' },
    { code: 'LU', nl: 'Luxemburgs', en: 'Luxembourgish' },

    { code: 'TR', nl: 'Turks', en: 'Turkish' },
    { code: 'MA', nl: 'Marokkaans', en: 'Moroccan' },
    { code: 'DZ', nl: 'Algerijns', en: 'Algerian' },
    { code: 'TN', nl: 'Tunesisch', en: 'Tunisian' },
    { code: 'EG', nl: 'Egyptisch', en: 'Egyptian' },
    { code: 'ZA', nl: 'Zuid-Afrikaans', en: 'South African' },
    { code: 'NG', nl: 'Nigerian', en: 'Nigerian' },
    { code: 'GH', nl: 'Ghanees', en: 'Ghanaian' },
    { code: 'KE', nl: 'Keniaans', en: 'Kenyan' },

    { code: 'IN', nl: 'Indiaas', en: 'Indian' },
    { code: 'PK', nl: 'Pakistaans', en: 'Pakistani' },
    { code: 'BD', nl: 'Bengaals', en: 'Bangladeshi' },
    { code: 'LK', nl: 'Sri Lankaans', en: 'Sri Lankan' },
    { code: 'NP', nl: 'Nepalees', en: 'Nepalese' },

    { code: 'CN', nl: 'Chinees', en: 'Chinese' },
    { code: 'JP', nl: 'Japans', en: 'Japanese' },
    { code: 'KR', nl: 'Zuid-Koreaans', en: 'South Korean' },
    { code: 'VN', nl: 'Vietnamees', en: 'Vietnamese' },
    { code: 'TH', nl: 'Thais', en: 'Thai' },
    { code: 'ID', nl: 'Indonesisch', en: 'Indonesian' },
    { code: 'MY', nl: 'Maleisisch', en: 'Malaysian' },
    { code: 'PH', nl: 'Filipijns', en: 'Filipino' },
    { code: 'SG', nl: 'Singaporees', en: 'Singaporean' },

    { code: 'BR', nl: 'Braziliaans', en: 'Brazilian' },
    { code: 'AR', nl: 'Argentijns', en: 'Argentinian' },
    { code: 'CL', nl: 'Chileens', en: 'Chilean' },
    { code: 'CO', nl: 'Colombiaans', en: 'Colombian' },
    { code: 'MX', nl: 'Mexicaans', en: 'Mexican' },
    { code: 'PE', nl: 'Peruaans', en: 'Peruvian' },

    { code: 'SR', nl: 'Surinaams', en: 'Surinamese' },
    { code: 'JM', nl: 'Jamaicaans', en: 'Jamaican' },
  ];

  function isoToNl(iso) {
    if (!iso) return '';
    const [y, m, d] = String(iso).split('-');
    if (!y || !m || !d) return '';
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
  }

  function nlToIso(nl) {
    const s = (nl || '').trim();
    if (!s) return null;

    const m = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
    if (!m) throw new Error('Gebruik formaat DD-MM-JJJJ.');

    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]);

    const dt = new Date(Date.UTC(year, month - 1, day));
    if (
      dt.getUTCFullYear() !== year ||
      dt.getUTCMonth() !== month - 1 ||
      dt.getUTCDate() !== day
    ) {
      throw new Error('Ongeldige datum.');
    }

    return `${String(year).padStart(4, '0')}-${String(month).padStart(
      2,
      '0'
    )}-${String(day).padStart(2, '0')}`;
  }

  React.useEffect(() => {
    if (!usernameDirtyRef.current) {
      const next = profile?.username || '';
      setUsernameDraft(next);
    }
  }, [profile?.username]);

  React.useEffect(() => {
    if (!nameDirtyRef.current) {
      const next = profile?.full_name || '';
      setNameDraft(next);
    }
  }, [profile?.full_name]);

  React.useEffect(() => {
    setNewEmail(user?.email || '');
  }, [user?.email]);

  React.useEffect(() => {
    if (!birthDateDirtyRef.current) {
      const next = isoToNl(profile?.birth_date);
      setBirthDateDraft(next);
    }
  }, [profile?.birth_date]);

  React.useEffect(() => {
    if (!firstNameDirtyRef.current)
      setFirstNameDraft(profile?.first_name || '');
  }, [profile?.first_name]);

  React.useEffect(() => {
    if (!lastNameDirtyRef.current) setLastNameDraft(profile?.last_name || '');
  }, [profile?.last_name]);

  React.useEffect(() => {
    if (!genderDirtyRef.current) setGenderDraft(profile?.gender || '');
  }, [profile?.gender]);

  React.useEffect(() => {
    if (!nationalityDirtyRef.current)
      setNationalityDraft(profile?.nationality || '');
  }, [profile?.nationality]);

  async function handleAvatarPicked(file) {
    if (!user || !file) return;

    try {
      setAvatarUploading(true);

      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;

      if (publicUrl) {
        await onSaveAvatarUrl(publicUrl);
      }
    } catch (e) {
      console.error(e);
      alert(language === 'nl' ? 'Upload mislukt.' : 'Upload failed.');
    } finally {
      setAvatarUploading(false);
    }
  }

  async function uploadAvatar(file) {
    if (!user || !file) return;

    try {
      setAvatarUploading(true);

      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;

      if (publicUrl) {
        await onSaveAvatarUrl(publicUrl);
      }
    } catch (e) {
      console.error(e);
      alert(language === 'nl' ? 'Upload mislukt.' : 'Upload failed.');
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleUpdateEmail() {
    if (!user) return;
    setLoadingAuth(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;

      setAuthSuccess(
        language === 'nl'
          ? 'Check je inbox: bevestig je nieuwe e-mail om de wijziging af te ronden.'
          : 'Check your inbox: confirm your new email to finish the change.'
      );
    } catch (err) {
      setAuthError(err.message || 'Email update failed.');
    } finally {
      setLoadingAuth(false);
    }
  }

  async function handleUpdatePassword() {
    if (!user) return false;

    setLoadingAuth(true);
    setAuthError('');
    setAuthSuccess('');

    if (!currentPassword || !newPassword) {
      setAuthError(
        language === 'nl' ? 'Vul beide velden in.' : 'Fill in both fields.'
      );
      setLoadingAuth(false);
      return false;
    }

    if (newPassword.length < 6) {
      setAuthError(
        language === 'nl'
          ? 'Nieuw wachtwoord moet minimaal 6 tekens zijn.'
          : 'New password must be at least 6 characters.'
      );
      setLoadingAuth(false);
      return false;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) throw signInError;

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setAuthSuccess(
        language === 'nl'
          ? 'Wachtwoord is gewijzigd.'
          : 'Password has been updated.'
      );
      return true;
    } catch (err) {
      setAuthError(
        err.message ||
          (language === 'nl'
            ? 'Wachtwoord wijzigen mislukt.'
            : 'Password update failed.')
      );
      return false;
    } finally {
      setLoadingAuth(false);
    }
  }

  async function handleLogout() {
    setLoadingAuth(true);
    setAuthError('');
    setAuthSuccess('');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      setAuthError(
        err.message ||
          (language === 'nl'
            ? 'Uitloggen mislukt, probeer opnieuw.'
            : 'Log out failed, please try again.')
      );
    } finally {
      setLoadingAuth(false);
    }
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true);
    setDeleteError('');
    try {
      const { error: fnError } = await supabase.functions.invoke('delete-account');
      if (fnError) throw fnError;
      await supabase.auth.signOut();
    } catch (err) {
      setDeleteError(
        err.message ||
          (language === 'nl'
            ? 'Account verwijderen mislukt, probeer opnieuw.'
            : 'Account deletion failed, please try again.')
      );
      setDeletingAccount(false);
    }
  }

  const favList = (locations || [])
    .filter((l) => favoriteIds?.has(l.id))
    .sort((a, b) => {
      const aT = favoriteMeta?.get(a.id)
        ? new Date(favoriteMeta.get(a.id)).getTime()
        : 0;
      const bT = favoriteMeta?.get(b.id)
        ? new Date(favoriteMeta.get(b.id)).getTime()
        : 0;
      return bT - aT;
    });

  // ================== ACCOUNT UI (DARK / LOKALY) ==================
  const pageWrap = {
    padding: isMobile ? 16 : 22,
    maxWidth: 820,
    margin: '0 auto',
    fontFamily: THEME.font,
    background: 'var(--lokaly-bg)',
    color: 'var(--lokaly-text)',
    minHeight: 'calc(100vh - 120px)', // safe: geeft de page altijd een “full” dark feel
  };

  const topBar = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  };

  const backBtn = {
    border: '1px solid var(--lokaly-border)',
    background: 'var(--lokaly-surface)',
    borderRadius: 999,
    width: 40,
    height: 40,
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
    color: 'var(--lokaly-text)',
  };

  const titleStyle = {
    fontFamily: THEME.fontDisplay,
    fontWeight: 650, // dunner dan 800
    fontSize: 18,
    color: 'var(--lokaly-text)',
    letterSpacing: -0.2,
  };

  const card = {
    background: 'var(--lokaly-surface)',
    border: '1px solid var(--lokaly-border)',
    borderRadius: 22,
    boxShadow: '0 18px 55px rgba(0,0,0,0.38)',
  };

  const profileCard = {
    ...card,
    padding: 16,
    marginBottom: 14,
    display: 'grid',
    justifyItems: 'center',
    textAlign: 'center',
  };

  const avatar = {
    width: 74,
    height: 74,
    borderRadius: 999,
    background:
      'radial-gradient(120% 120% at 30% 20%, rgba(255,107,61,0.22) 0%, rgba(255,255,255,0.10) 55%, rgba(255,255,255,0.06) 100%)',
    border: '1px solid var(--lokaly-orange-border)',
    display: 'grid',
    placeItems: 'center',
    fontFamily: THEME.fontDisplay,
    fontWeight: 650,
    color: 'var(--lokaly-text)',
    marginBottom: 10,
  };

  const nameText = {
    fontWeight: 650,
    fontSize: 16,
    color: 'var(--lokaly-text)',
    letterSpacing: -0.2,
  };

  const subText = {
    marginTop: 3,
    fontSize: 12.5,
    color: 'var(--lokaly-muted)',
    fontWeight: 450,
  };

  const sectionLabel = {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)',
  };

  const listWrap = {
    ...card,
    padding: 8,
  };

  const rowBtn = {
    width: '100%',
    textAlign: 'left',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: '12px 12px',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    color: 'var(--lokaly-text)',
  };

  const rowLeft = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  };

  const iconPill = {
    width: 34,
    height: 34,
    borderRadius: 12,
    background: 'var(--lokaly-orange-soft)',
    border: '1px solid var(--lokaly-orange-border)',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 700,
    color: 'var(--lokaly-text)',
    flex: '0 0 auto',
  };

  const rowTexts = { minWidth: 0 };

  const rowTitle = {
    fontSize: 12.5,
    fontWeight: 600, // dunner
    color: 'var(--lokaly-text)',
  };

  const rowValue = {
    marginTop: 2,
    fontSize: 12,
    fontWeight: 450,
    color: 'var(--lokaly-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: isMobile ? 240 : 520,
  };

  const chevron = {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 18,
    marginLeft: 10,
    flex: '0 0 auto',
  };

  const divider = {
    height: 1,
    background: 'var(--lokaly-border)',
    margin: '6px 8px',
  };

  const editorWrap = {
    padding: '10px 12px 12px',
    borderTop: '1px solid var(--lokaly-border)',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.02)',
  };

  const input = {
    width: '100%',
    height: 40,
    padding: '0 12px',
    borderRadius: 12,
    border: '1px solid var(--lokaly-border)',
    outline: 'none',
    fontSize: 13,
    background: 'var(--lokaly-surface)',
    color: 'var(--lokaly-text)',
    fontWeight: 450, // dunner
  };

  const selectInput = {
    ...input,

    // ✅ Forceer dark dropdown menu (dit is de key)
    colorScheme: 'dark',

    // ✅ Zelfde look als je results/category dropdown
    background: 'rgba(12,12,13,0.88)',
    color: 'rgba(235,240,255,0.88)',
    border: '1px solid rgba(255,255,255,0.12)',
  };

  const help = {
    marginTop: 6,
    fontSize: 12,
    color: 'var(--lokaly-muted)',
    lineHeight: 1.35,
    fontWeight: 450,
  };

  const btnRow = { display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' };

  const btnGhost = {
    border: '1px solid var(--lokaly-border)',
    background: 'var(--lokaly-surface)',
    borderRadius: 14,
    padding: '10px 12px',
    fontSize: 12.5,
    fontWeight: 650,
    cursor: 'pointer',
    color: 'var(--lokaly-text)',
  };

  const btnPrimary = {
    width: 'fit-content',
    height: 42,
    borderRadius: 14,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',

    background: THEME.orange,
    border: '1px solid rgba(0,0,0,0.25)',
    boxShadow: '0 18px 45px rgba(0,0,0,0.35)',

    color: 'rgba(0,0,0,0.92)',
    fontFamily: THEME.font,
    fontWeight: 650,
    fontSize: 14,
    letterSpacing: 0.2,

    padding: '0 14px',
    cursor: 'pointer',
    transition: 'transform 120ms ease, filter 160ms ease',
  };

  const alert = (type) => ({
    ...card,
    padding: '10px 12px',
    marginBottom: 12,
    border:
      type === 'error'
        ? '1px solid rgba(239,68,68,0.35)'
        : '1px solid var(--lokaly-orange-border)',
    background:
      type === 'error' ? 'rgba(239,68,68,0.10)' : 'rgba(255,107,61,0.10)',
    color: 'var(--lokaly-text)',
    fontSize: 12.5,
    lineHeight: 1.35,
    borderRadius: 16,
  });

  function initialsFromProfile() {
    const displayName = [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();
    const a = (displayName || profile?.username || user?.email || 'L')
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || '');
    return a.join('') || 'L';
  }

  function openAndFocus(key, ref) {
    setOpenKey((prev) => (prev === key ? null : key));
    setTimeout(() => ref?.current?.focus?.(), 0);
  }

  if (!user) {
    return (
      <div style={pageWrap}>
        <div style={topBar}>
          <button
            type="button"
            style={backBtn}
            onClick={() =>
              onNavigate ? onNavigate('home') : window.history.back()
            }
            aria-label="Back"
          >
            ←
          </button>
          <div style={titleStyle}>
            {language === 'nl' ? 'Account' : 'Account'}
          </div>
          <div style={{ width: 40 }} />
        </div>

        <div style={profileCard}>
          <div style={avatar}>{initialsFromProfile()}</div>
          <div style={nameText}>
            {language === 'nl'
              ? 'Log in om door te gaan'
              : 'Log in to continue'}
          </div>
          <div style={subText}>
            {language === 'nl'
              ? 'Bewaar je favorieten en ontdek Lokaly sneller.'
              : 'Save favorites and discover Lokaly faster.'}
          </div>

          <button
            type="button"
            onClick={onOpenAuth}
            style={{
              ...btnPrimary,
              marginTop: 12,
              padding: '12px 14px',
              borderRadius: 16,
            }}
          >
            {language === 'nl' ? 'Inloggen / Account' : 'Login / Account'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={topBar}>
        <button
          type="button"
          style={backBtn}
          onClick={() =>
            onNavigate ? onNavigate('home') : window.history.back()
          }
          aria-label="Back"
        >
          ←
        </button>
        <div style={titleStyle}>
          {language === 'nl' ? 'Mijn profiel' : 'My profile'}
        </div>
        <div style={{ width: 40 }} />
      </div>

      {profileError ? <div style={alert('error')}>{profileError}</div> : null}
      {profileSuccess ? <div style={alert('ok')}>{profileSuccess}</div> : null}
      {authError ? <div style={alert('error')}>{authError}</div> : null}
      {authSuccess ? <div style={alert('ok')}>{authSuccess}</div> : null}

      <div style={profileCard}>
        <div style={{ position: 'relative' }}>
          <div
            style={{
              ...avatar,
              overflow: 'hidden',
              padding: 0,
              cursor: 'pointer',
              border: '1px solid rgba(15,23,42,0.10)',
              background: 'rgba(255,255,255,0.75)',
            }}
            onClick={() => avatarFileRef.current?.click()}
            title={
              language === 'nl' ? 'Upload profielfoto' : 'Upload profile photo'
            }
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {initialsFromProfile()}
              </div>
            )}
          </div>

          <input
            ref={avatarFileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadAvatar(file);
              e.target.value = '';
            }}
          />
        </div>

        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: 'rgba(255,255,255,0.66)',
            textAlign: 'center',
          }}
        >
          {language === 'nl' ? 'Klik om foto te uploaden' : 'Click to upload'}
        </div>

        <div style={subText}>
          {profile?.username
            ? `@${profile.username}`
            : '@' + (language === 'nl' ? 'jouwnaam' : 'yourname')}
          {'  •  '}
          {user?.email || ''}
        </div>
      </div>

      <div style={sectionLabel}>
        {language === 'nl' ? 'Favorieten' : 'Favorites'}
      </div>
      <div style={listWrap}>
        <button
          type="button"
          style={rowBtn}
          onClick={() =>
            setOpenKey((p) => (p === 'favorites' ? null : 'favorites'))
          }
        >
          <div style={rowLeft}>
            <div style={iconPill}>♡</div>
            <div style={rowTexts}>
              <div style={rowTitle}>
                {language === 'nl' ? 'Jouw favorieten' : 'Your favorites'}
              </div>
              <div style={rowValue}>
                {favoritesLoading
                  ? language === 'nl'
                    ? 'Laden…'
                    : 'Loading…'
                  : `${favList.length} ${
                      language === 'nl' ? 'items' : 'items'
                    }`}
              </div>
            </div>
          </div>
          <div style={chevron}>{openKey === 'favorites' ? '×' : '›'}</div>
        </button>

        {openKey === 'favorites' ? (
          <div style={{ padding: '0 10px 12px 10px' }}>
            {favoritesLoading ? (
              <div style={{ padding: 10, color: THEME.muted, fontSize: 13 }}>
                {language === 'nl' ? 'Favorieten laden…' : 'Loading favorites…'}
              </div>
            ) : favList.length === 0 ? (
              <div style={{ padding: 10, color: THEME.muted, fontSize: 13 }}>
                {language === 'nl'
                  ? 'Nog geen favorieten. Sla locaties op met het hartje.'
                  : 'No favorites yet. Save places with the heart.'}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr', // ✅ altijd 1 kolom (ook op desktop)
                  gap: 14,
                  paddingTop: 12,
                  width: '100%', // ✅ vult het witte vlak
                  maxWidth: '100%', // ✅ geen desktop maxWidth
                  margin: 0, // ✅ niet centreren in smaller vlak
                  alignItems: 'stretch',
                }}
              >
                {favList.map((loc) => (
                  <CategoryResultRowCard
                    key={loc.id || loc.name}
                    loc={loc}
                    language={language}
                    onClick={(picked) => onOpenLocation(picked)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* ================== MIJN REVIEWS ================== */}
      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          onClick={() => setOpenKey(openKey === 'myreviews' ? '' : 'myreviews')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '14px 14px',
            borderRadius: 20,

            // ✅ Lokaly dark
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.04)',
            boxShadow: 'none',
            color: 'rgba(255,255,255,0.92)',

            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(255,107,61,0.12)',
                border: `1px solid ${THEME.orangeBorder}`,
                fontWeight: 900,
              }}
            >
              ★
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>
                {language === 'nl' ? 'Mijn reviews' : 'My reviews'}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.66)',
                  marginTop: 2,
                }}
              >
                {myReviewsLoading
                  ? language === 'nl'
                    ? 'Laden…'
                    : 'Loading…'
                  : `${myReviews.length} ${
                      language === 'nl' ? 'items' : 'items'
                    }`}
              </div>
            </div>
          </div>

          <div style={{ fontSize: 22, opacity: 0.7 }}>
            {openKey === 'myreviews' ? '×' : '›'}
          </div>
        </button>

        {openKey === 'myreviews' ? (
          <div style={{ padding: '0 10px 12px 10px' }}>
            {myReviewsError ? (
              <div style={{ padding: 10, color: THEME.muted, fontSize: 13 }}>
                {myReviewsError}
              </div>
            ) : null}

            {myReviewsLoading ? (
              <div style={{ padding: 10, color: THEME.muted, fontSize: 13 }}>
                {language === 'nl' ? 'Reviews laden…' : 'Loading reviews…'}
              </div>
            ) : myReviews.length === 0 ? (
              <div style={{ padding: 10, color: THEME.muted, fontSize: 13 }}>
                {language === 'nl'
                  ? 'Je hebt nog geen reviews geplaatst.'
                  : "You haven't posted any reviews yet."}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: 14,
                  paddingTop: 12,
                  width: '100%',
                }}
              >
                {myReviews.map((r) => {
                  const loc = locationsMap.get(r.location_id);
                  const dt = r.updated_at || r.created_at;
                  const dateLabel = dt
                    ? new Date(dt).toLocaleDateString(
                        language === 'nl' ? 'nl-NL' : 'en-US'
                      )
                    : '';

                  const stars = Array.from({ length: 5 }, (_, i) =>
                    i < (r.rating || 0) ? '★' : '☆'
                  ).join('');

                  return (
                    <div
                      id={`review-${r.id}`}
                      key={r.id}
                      style={{
                        border:
                          highlightReviewId === r.id
                            ? `1px solid ${THEME.orange}`
                            : `1px solid ${THEME.border}`,
                        boxShadow:
                          highlightReviewId === r.id
                            ? '0 0 0 3px rgba(255,107,61,0.18)'
                            : 'none',
                        transition: 'border 180ms ease, box-shadow 180ms ease',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 18,
                        padding: 12,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 10,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 900 }}>
                            {loc?.name ||
                              (language === 'nl'
                                ? 'Onbekend event'
                                : 'Unknown event')}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: THEME.muted,
                              marginTop: 2,
                            }}
                          >
                            {dateLabel}
                          </div>
                        </div>

                        <div style={{ fontWeight: 900, letterSpacing: 1 }}>
                          {stars}
                        </div>
                      </div>

                      {r.comment ? (
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 13,
                            color: THEME.muted,
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.45,
                          }}
                        >
                          {r.comment}
                        </div>
                      ) : null}

                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          color: THEME.muted,
                        }}
                      >
                        {language === 'nl'
                          ? "Tip: open het event en klik daar op \u2018Bewerk\u2019 bij jouw review."
                          : "Tip: open the event and click \u2018Edit\u2019 on your review there."}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div style={sectionLabel}>
        {language === 'nl' ? 'Profiel' : 'Profile'}
      </div>
      <div style={listWrap}>
        <AccountUsernameSection
          language={language}
          profile={profile}
          openKey={openKey}
          setOpenKey={setOpenKey}
          usernameDraft={usernameDraft}
          setUsernameDraft={setUsernameDraft}
          usernameInputRef={usernameInputRef}
          usernameDirtyRef={usernameDirtyRef}
          rowBtn={rowBtn}
          rowLeft={rowLeft}
          rowTexts={rowTexts}
          rowTitle={rowTitle}
          rowValue={rowValue}
          iconPill={iconPill}
          chevron={chevron}
          editorWrap={editorWrap}
          input={input}
          help={help}
          btnRow={btnRow}
          btnGhost={btnGhost}
          btnPrimary={btnPrimary}
          setProfileError={setProfileError}
          setProfileSuccess={setProfileSuccess}
          onSaveUsername={onSaveUsername}
        />

        <div style={divider} />

        <AccountFirstNameSection
          language={language}
          profile={profile}
          openKey={openKey}
          setOpenKey={setOpenKey}
          firstNameDraft={firstNameDraft}
          setFirstNameDraft={setFirstNameDraft}
          rowBtn={rowBtn}
          rowLeft={rowLeft}
          rowTexts={rowTexts}
          rowTitle={rowTitle}
          rowValue={rowValue}
          iconPill={iconPill}
          chevron={chevron}
          editorWrap={editorWrap}
          input={input}
          btnRow={btnRow}
          btnGhost={btnGhost}
          btnPrimary={btnPrimary}
          setProfileError={setProfileError}
          setProfileSuccess={setProfileSuccess}
          onSaveFirstName={onSaveFirstName}
        />

        <div style={divider} />

        <AccountLastNameSection
          language={language}
          profile={profile}
          openKey={openKey}
          setOpenKey={setOpenKey}
          lastNameDraft={lastNameDraft}
          setLastNameDraft={setLastNameDraft}
          lastNameInputRef={lastNameInputRef}
          lastNameDirtyRef={lastNameDirtyRef}
          rowBtn={rowBtn}
          rowLeft={rowLeft}
          rowTexts={rowTexts}
          rowTitle={rowTitle}
          rowValue={rowValue}
          iconPill={iconPill}
          chevron={chevron}
          editorWrap={editorWrap}
          input={input}
          btnRow={btnRow}
          btnGhost={btnGhost}
          btnPrimary={btnPrimary}
          onSaveLastName={onSaveLastName}
        />

        <div style={divider} />

        <AccountGenderSection
          language={language}
          profile={profile}
          openKey={openKey}
          setOpenKey={setOpenKey}
          genderDraft={genderDraft}
          setGenderDraft={setGenderDraft}
          genderInputRef={genderInputRef}
          genderDirtyRef={genderDirtyRef}
          rowBtn={rowBtn}
          rowLeft={rowLeft}
          rowTexts={rowTexts}
          rowTitle={rowTitle}
          rowValue={rowValue}
          iconPill={iconPill}
          chevron={chevron}
          editorWrap={editorWrap}
          selectInput={selectInput}
          btnRow={btnRow}
          btnGhost={btnGhost}
          btnPrimary={btnPrimary}
          onSaveGender={onSaveGender}
        />

        <div style={divider} />

        <AccountNationalitySection
          language={language}
          profile={profile}
          openKey={openKey}
          setOpenKey={setOpenKey}
          nationalityDraft={nationalityDraft}
          setNationalityDraft={setNationalityDraft}
          nationalityInputRef={nationalityInputRef}
          nationalityDirtyRef={nationalityDirtyRef}
          NATIONALITIES={NATIONALITIES}
          rowBtn={rowBtn}
          rowLeft={rowLeft}
          rowTexts={rowTexts}
          rowTitle={rowTitle}
          rowValue={rowValue}
          iconPill={iconPill}
          chevron={chevron}
          editorWrap={editorWrap}
          selectInput={selectInput}
          btnRow={btnRow}
          btnGhost={btnGhost}
          btnPrimary={btnPrimary}
          onSaveNationality={onSaveNationality}
        />

        <div style={divider} />

        {/* Adres (optioneel) */}
        <button
          type="button"
          style={rowBtn}
          onClick={() => openAndFocus('address', address1Ref)}
        >
          <div style={rowLeft}>
            <div style={iconPill}>📍</div>
            <div style={rowTexts}>
              <div style={rowTitle}>
                {language === 'nl' ? 'Adres' : 'Address'}
              </div>
              <div style={rowValue}>{formatProfileAddress(profile)}</div>
            </div>
          </div>
          <div style={chevron}>{openKey === 'address' ? '×' : '›'}</div>
        </button>

        <AccountAddressSection
          language={language}
          profile={profile}
          openKey={openKey}
          setOpenKey={setOpenKey}
          address1Draft={address1Draft}
          setAddress1Draft={setAddress1Draft}
          houseNumberDraft={houseNumberDraft}
          setHouseNumberDraft={setHouseNumberDraft}
          address2Draft={address2Draft}
          setAddress2Draft={setAddress2Draft}
          postalDraft={postalDraft}
          setPostalDraft={setPostalDraft}
          cityDraft={cityDraft}
          setCityDraft={setCityDraft}
          countryDraft={countryDraft}
          setCountryDraft={setCountryDraft}
          geoError={geoError}
          savingAddress={savingAddress}
          address1Ref={address1Ref}
          rowBtn={rowBtn}
          rowLeft={rowLeft}
          rowTexts={rowTexts}
          rowTitle={rowTitle}
          rowValue={rowValue}
          iconPill={iconPill}
          chevron={chevron}
          editorWrap={editorWrap}
          input={input}
          btnRow={btnRow}
          btnGhost={btnGhost}
          btnPrimary={btnPrimary}
          onSaveAddress={async () => {
            setGeoError('');
            setSavingAddress(true);
            try {
              const geo = await geocodeNlPostcodeHouse(
                postalDraft,
                houseNumberDraft,
                countryDraft || 'NL'
              );

              await onSaveAddress({
                address_line1: address1Draft,
                house_number: houseNumberDraft,
                address_line2: address2Draft,
                postal_code: postalDraft,
                city: cityDraft,
                country_code: countryDraft || 'NL',
                home_lat: geo?.lat ?? null,
                home_lng: geo?.lng ?? null,
                home_place_id: geo?.place_id ?? null,
                home_formatted_address: geo?.formatted_address ?? null,
              });

              setOpenKey(null);
            } catch (e) {
              setGeoError(
                e?.message ||
                  (language === 'nl'
                    ? 'Adres opslaan mislukt.'
                    : 'Failed to save address.')
              );
            } finally {
              setSavingAddress(false);
            }
          }}
        />
        <div style={divider} />

        {/* Birth date */}
        <button
          type="button"
          style={rowBtn}
          onClick={() => openAndFocus('birth', birthDateInputRef)}
        >
          <div style={rowLeft}>
            <div style={iconPill}>◷</div>
            <div style={rowTexts}>
              <div style={rowTitle}>
                {language === 'nl' ? 'Geboortedatum' : 'Birth date'}
              </div>
              <div style={rowValue}>
                {profile?.birth_date ? isoToNl(profile.birth_date) : '—'}
              </div>
            </div>
          </div>
          <div style={chevron}>{openKey === 'birth' ? '×' : '›'}</div>
        </button>

        <AccountBirthDateSection
          language={language}
          profile={profile}
          openKey={openKey}
          setOpenKey={setOpenKey}
          birthDateDraft={birthDateDraft}
          setBirthDateDraft={setBirthDateDraft}
          savingBirthDate={savingBirthDate}
          birthDateInputRef={birthDateInputRef}
          isoToNl={isoToNl}
          nlToIso={nlToIso}
          rowBtn={rowBtn}
          rowLeft={rowLeft}
          rowTexts={rowTexts}
          rowTitle={rowTitle}
          rowValue={rowValue}
          iconPill={iconPill}
          chevron={chevron}
          editorWrap={editorWrap}
          input={input}
          btnRow={btnRow}
          btnGhost={btnGhost}
          btnPrimary={btnPrimary}
          onSaveBirthDate={async (nextIso) => {
            setSavingBirthDate(true);
            try {
              await onSaveBirthDate(nextIso);
            } finally {
              setSavingBirthDate(false);
            }
          }}
        />
      </div>

      <div style={sectionLabel}>
        {language === 'nl' ? 'Account' : 'Account'}
      </div>
      <div style={listWrap}>
        <AccountEmailSection
          language={language}
          user={user}
          openKey={openKey}
          setOpenKey={setOpenKey}
          newEmail={newEmail}
          setNewEmail={setNewEmail}
          emailInputRef={emailInputRef}
          rowBtn={rowBtn}
          rowLeft={rowLeft}
          rowTexts={rowTexts}
          rowTitle={rowTitle}
          rowValue={rowValue}
          iconPill={iconPill}
          chevron={chevron}
          editorWrap={editorWrap}
          input={input}
          help={help}
          btnRow={btnRow}
          btnGhost={btnGhost}
          btnPrimary={btnPrimary}
          loadingAuth={loadingAuth}
          handleUpdateEmail={handleUpdateEmail}
        />

        <div style={divider} />

        <AccountPasswordSection
          language={language}
          openKey={openKey}
          setOpenKey={setOpenKey}
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          showCurrentPassword={showCurrentPassword}
          setShowCurrentPassword={setShowCurrentPassword}
          showNewPassword={showNewPassword}
          setShowNewPassword={setShowNewPassword}
          currentPasswordRef={currentPwRef}
          rowBtn={rowBtn}
          rowLeft={rowLeft}
          rowTexts={rowTexts}
          rowTitle={rowTitle}
          rowValue={rowValue}
          iconPill={iconPill}
          chevron={chevron}
          editorWrap={editorWrap}
          input={input}
          help={help}
          btnRow={btnRow}
          btnGhost={btnGhost}
          btnPrimary={btnPrimary}
          loadingAuth={loadingAuth}
          handleUpdatePassword={handleUpdatePassword}
        />
      </div>

      <div style={sectionLabel}>{language === 'nl' ? 'Lokaly' : 'Lokaly'}</div>
      <div style={listWrap}>
        <button
          type="button"
          style={rowBtn}
          onClick={() => onNavigate?.('feedback')}
        >
          <div style={rowLeft}>
            <div style={iconPill}>✦</div>
            <div style={rowTexts}>
              <div style={rowTitle}>
                {language === 'nl' ? 'Geef feedback' : 'Give feedback'}
              </div>
              <div style={rowValue}>
                {language === 'nl'
                  ? 'Help Lokaly verbeteren'
                  : 'Help improve Lokaly'}
              </div>
            </div>
          </div>
          <div style={chevron}>›</div>
        </button>

        <div style={divider} />

        <button
          type="button"
          style={rowBtn}
          onClick={() => onNavigate?.('privacy')}
        >
          <div style={rowLeft}>
            <div style={iconPill}>⛨</div>
            <div style={rowTexts}>
              <div style={rowTitle}>
                {language === 'nl' ? 'Privacybeleid' : 'Privacy policy'}
              </div>
              <div style={rowValue}>
                {language === 'nl'
                  ? 'Lees hoe we data gebruiken'
                  : 'How we use data'}
              </div>
            </div>
          </div>
          <div style={chevron}>›</div>
        </button>

        <div style={divider} />

        <button
          type="button"
          style={rowBtn}
          onClick={() => onNavigate?.('terms')}
        >
          <div style={rowLeft}>
            <div style={iconPill}>⧉</div>
            <div style={rowTexts}>
              <div style={rowTitle}>
                {language === 'nl' ? 'Voorwaarden' : 'Terms & conditions'}
              </div>
              <div style={rowValue}>
                {language === 'nl' ? 'Juridische info' : 'Legal information'}
              </div>
            </div>
          </div>
          <div style={chevron}>›</div>
        </button>

        <div style={divider} />

        <button
          type="button"
          style={rowBtn}
          onClick={() => onNavigate?.('contact')}
        >
          <div style={rowLeft}>
            <div style={iconPill}>✎</div>
            <div style={rowTexts}>
              <div style={rowTitle}>
                {language === 'nl' ? 'Contact' : 'Contact'}
              </div>
              <div style={rowValue}>
                {language === 'nl'
                  ? 'Stuur ons een bericht'
                  : 'Send us a message'}
              </div>
            </div>
          </div>
          <div style={chevron}>›</div>
        </button>
      </div>

      <div style={{ marginTop: 14 }}>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loadingAuth}
          style={{
            ...btnGhost,
            width: '100%',
            padding: '12px 14px',
            borderRadius: 18,
            background: 'rgba(15,23,42,0.04)',
            opacity: loadingAuth ? 0.6 : 1,
          }}
        >
          {loadingAuth
            ? language === 'nl'
              ? 'Bezig…'
              : 'Working…'
            : language === 'nl'
            ? 'Uitloggen'
            : 'Log out'}
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        <button
          type="button"
          onClick={() => { setDeleteConfirmOpen(true); setDeleteError(''); }}
          disabled={loadingAuth || deletingAccount}
          style={{
            ...btnGhost,
            width: '100%',
            padding: '12px 14px',
            borderRadius: 18,
            background: 'transparent',
            border: '1px solid rgba(220,38,38,0.30)',
            color: 'rgba(220,38,38,0.85)',
            opacity: (loadingAuth || deletingAccount) ? 0.5 : 1,
          }}
        >
          {language === 'nl' ? 'Account verwijderen' : 'Delete account'}
        </button>
      </div>

      {deleteConfirmOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 20px',
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget && !deletingAccount) setDeleteConfirmOpen(false); }}
        >
          <div
            style={{
              background: 'var(--lokaly-surface)',
              borderRadius: 22,
              padding: '28px 24px 24px',
              maxWidth: 380,
              width: '100%',
              boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
              border: '1px solid var(--lokaly-border)',
            }}
          >
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(220,38,38,0.10)',
                border: '1px solid rgba(220,38,38,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                fontSize: 22,
              }}>
                ⚠
              </div>
              <h3 style={{
                fontFamily: 'var(--lokaly-font)',
                fontSize: 17,
                fontWeight: 700,
                color: 'var(--lokaly-text)',
                margin: '0 0 10px',
              }}>
                {language === 'nl' ? 'Account verwijderen?' : 'Delete account?'}
              </h3>
              <p style={{
                fontFamily: 'var(--lokaly-font)',
                fontSize: 14,
                lineHeight: 1.55,
                color: 'var(--lokaly-muted)',
                margin: 0,
              }}>
                {language === 'nl'
                  ? 'Dit verwijdert je account en alle bijbehorende gegevens permanent. Deze actie kan niet ongedaan worden gemaakt.'
                  : 'This will permanently delete your account and all associated data. This action cannot be undone.'}
              </p>
            </div>

            {deleteError ? (
              <div style={{
                background: 'rgba(220,38,38,0.08)',
                border: '1px solid rgba(220,38,38,0.25)',
                borderRadius: 12,
                padding: '10px 12px',
                marginBottom: 14,
                fontFamily: 'var(--lokaly-font)',
                fontSize: 13,
                color: 'rgb(220,38,38)',
              }}>
                {deleteError}
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: '1px solid rgba(220,38,38,0.35)',
                  background: 'rgba(220,38,38,0.09)',
                  color: 'rgb(200,30,30)',
                  fontFamily: 'var(--lokaly-font)',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: deletingAccount ? 'not-allowed' : 'pointer',
                  opacity: deletingAccount ? 0.6 : 1,
                }}
              >
                {deletingAccount
                  ? (language === 'nl' ? 'Bezig…' : 'Working…')
                  : (language === 'nl' ? 'Ja, verwijder mijn account' : 'Yes, delete my account')}
              </button>
              <button
                type="button"
                onClick={() => { setDeleteConfirmOpen(false); setDeleteError(''); }}
                disabled={deletingAccount}
                style={{
                  ...btnGhost,
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 14,
                  background: 'rgba(15,23,42,0.04)',
                  opacity: deletingAccount ? 0.5 : 1,
                }}
              >
                {language === 'nl' ? 'Annuleren' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
