# Lokaly - Code Refactoring Guide

## Overzicht van huidige situatie

Je huidige App.jsx is **21.130 regels groot** - dit is een **kritiek probleem** voor onderhoudbaarheid, performance en samenwerking. Deze guide legt uit hoe je de applicatie stap voor stap kunt transformeren naar een professionele, modulaire codebase.

## ✅ Wat er al is gedaan

### Database Schema
- ✅ Volledige database schema gecreëerd in Supabase
- ✅ Row Level Security (RLS) policies toegevoegd voor alle tabellen
- ✅ Tables: `profiles`, `locations`, `vibes`, `categories`, `location_vibes`, `location_categories`, `favorites`, `reviews`, `analytics_events`
- ✅ Indexes toegevoegd voor performance

### Utility Bestanden
- ✅ `/src/components/Icons.jsx` - Alle icon components
- ✅ `/src/constants/theme.js` - Theme tokens en design system
- ✅ `/src/constants/strings.js` - Alle tekst/translations (NL & EN)
- ✅ `/src/utils/geocoding.js` - Google Maps geocoding functie met error handling
- ✅ `/src/utils/sharing.js` - Share functionaliteit met fallbacks
- ✅ `/src/hooks/useIsMobile.js` - Responsive breakpoint hook
- ✅ `/src/lib/analytics.js` - Verbeterd met try-catch blocks

## 🎯 Aanbevolen refactoring strategie

### Stap 1: Component Extractie (Hoge Prioriteit)

Je moet de volgende grote components uit App.jsx halen en in aparte bestanden plaatsen:

```
/src/components/
  ├── Header.jsx
  ├── Footer.jsx
  ├── LocationCard.jsx
  ├── LocationModal.jsx
  ├── HeroCard.jsx
  ├── HeroCarousel.jsx
  ├── AuthModal.jsx
  ├── SearchOverlay.jsx
  └── Skeleton/
      ├── SkeletonBox.jsx
      ├── SkeletonCard.jsx
      └── SkeletonGrid.jsx

/src/pages/
  ├── HomePage.jsx
  ├── CategoryPage.jsx
  ├── MapPage.jsx
  ├── AdminDashboard.jsx
  ├── AccountPage.jsx
  ├── ReviewsPage.jsx
  ├── FeedbackPage.jsx
  └── InfoPage.jsx

/src/sections/
  ├── SectionRow.jsx
  └── VibeRow.jsx
```

### Stap 2: State Management Optimalisatie

**Probleem:** Teveel useState declarations die elkaar kunnen triggeren.

**Oplossing:** Groepeer gerelateerde state met useReducer:

```javascript
// VOOR (21 separate useState calls):
const [pageState, setPageState] = useState('home');
const [language, setLanguage] = useState('nl');
const [selectedLocation, setSelectedLocation] = useState(null);
// ... 18 meer

// NA (gegroepeerd):
const [uiState, setUiState] = useReducer(uiReducer, {
  page: 'home',
  language: 'nl',
  selectedLocation: null,
  searchTerm: '',
  mobileSearchOpen: false,
  searchOpen: false,
  // etc.
});
```

### Stap 3: Memoization & Performance

**Kritieke verbeteringen:**

```javascript
// 1. useMemo voor gefilterde/gesorteerde data
const filteredLocations = useMemo(() => {
  return locationsFromDb.filter(/* logic */);
}, [locationsFromDb, filters]); // alleen re-compute als deze dependencies veranderen

// 2. useCallback voor event handlers
const handleLocationClick = useCallback((location) => {
  setSelectedLocation(location);
  track('location_click', { location_id: location.id });
}, []); // function identity blijft stabiel

// 3. React.memo voor child components
export const LocationCard = React.memo(({ location, onClick }) => {
  // ...
});
```

### Stap 4: Error Handling Pattern

**Consistent patroon voor alle async operations:**

```javascript
// Database calls
async function loadLocations() {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    setLocations(data || []);
  } catch (error) {
    console.error('Failed to load locations:', error);
    // Optioneel: toon error toast/notification
    setError(error.message);
  }
}

// Analytics tracking - moet NOOIT de UI blokkeren
async function trackEvent(name, meta) {
  try {
    await track(name, meta);
  } catch (error) {
    // Stil falen - analytics mag nooit de UX verstoren
    console.warn('Analytics tracking failed:', error);
  }
}
```

### Stap 5: Inline Styles Refactoring

**VOOR (in component):**
```javascript
<div style={{
  position: 'sticky',
  top: 0,
  zIndex: 9999,
  background: '#F7F3EA',
  borderBottom: '1px solid rgba(15,23,42,0.10)',
  // ... 15 meer properties
}}>
```

**NA (onderaan bestand):**
```javascript
const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 9999,
    background: THEME.bg,
    borderBottom: `1px solid ${THEME.border}`,
  },
  headerScrolled: {
    boxShadow: THEME.shadow,
  },
  // etc.
};

// In component:
<div style={navScrolled ? {...styles.header, ...styles.headerScrolled} : styles.header}>
```

### Stap 6: Data Fetching Strategie

**Huidige problemen:**
- Mogelijk meerdere keren data ophalen
- Geen loading/error states consistency
- Geen caching

**Aanbevolen patroon:**

```javascript
// Custom hook voor data fetching
function useLocations() {
  const [state, setState] = useState({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      try {
        setState(prev => ({ ...prev, loading: true }));

        const { data, error } = await supabase
          .from('locations')
          .select('*, location_vibes(vibe_id), location_categories(category_id)');

        if (cancelled) return;

        if (error) throw error;

        setState({ data: data || [], loading: false, error: null });
      } catch (error) {
        if (cancelled) return;
        setState({ data: [], loading: false, error });
      }
    }

    fetch();

    return () => { cancelled = true; };
  }, []);

  return state;
}
```

## 🔒 Security Best Practices

### 1. Analytics Tracking
✅ **GOED:** Huidige implementation is al veilig:
```javascript
track('location_view', { /* meta */ }, location.id);
```

❌ **VERMIJD:** Gevoelige data in meta object:
```javascript
track('login', { password: '...' }); // NOOIT DOEN
```

### 2. RLS Policy Checks
De database RLS policies beschermen je data, maar check altijd:

```javascript
// ✅ GOED - RLS beschermt automatisch
const { data } = await supabase
  .from('favorites')
  .select('*');

// ❌ FOUT - Service role key bypass RLS
// Gebruik NOOIT service_role_key in frontend
```

### 3. Input Sanitization
Bij user input (reviews, feedback):

```javascript
// Simpele sanitization voor text input
function sanitizeText(text) {
  return String(text || '')
    .trim()
    .slice(0, 5000); // max length
}
```

## 📊 Performance Optimalisaties

### 1. Google Maps Lazy Loading
```javascript
// Laad Maps API pas als map page wordt bezocht
const [mapsLoaded, setMapsLoaded] = useState(false);

useEffect(() => {
  if (currentPage === 'map' && !mapsLoaded) {
    loadGoogleMapsScript().then(() => setMapsLoaded(true));
  }
}, [currentPage]);
```

### 2. Image Optimization
```javascript
// Gebruik lazy loading voor images
<img
  src={location.main_image}
  loading="lazy"
  alt={location.name}
/>
```

### 3. Virtualization voor lange lijsten
Als je meer dan 50 locations toont, overweeg react-window of react-virtualized.

## 🧪 Testing Strategie

### Wat te testen:

1. **Database interacties:**
   - Locations laden
   - Favorites toevoegen/verwijderen
   - Reviews submitting
   - Analytics tracking

2. **Error scenarios:**
   - Network failure
   - Invalid geocoding
   - Missing API keys
   - Database timeout

3. **User flows:**
   - Search → Filter → Detail view
   - Save favorite → View in account
   - Write review → See on location page

### Test checklist voor build:

```bash
# 1. Installeer dependencies
npm install

# 2. Check TypeScript errors
npm run build

# 3. Test in productie mode
npm run preview
```

## 📝 Code Style Verbeteringen

### DRY Principle Voorbeelden

**VOOR (herhaling):**
```javascript
const { data: vibes, error: vibesError } = await supabase.from('vibes').select('*');
const { data: categories, error: catError } = await supabase.from('categories').select('*');
const { data: locations, error: locError } = await supabase.from('locations').select('*');
```

**NA (helper functie):**
```javascript
async function fetchTable(tableName) {
  try {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Failed to fetch ${tableName}:`, error);
    return [];
  }
}

const vibes = await fetchTable('vibes');
const categories = await fetchTable('categories');
const locations = await fetchTable('locations');
```

### Consistent Naming

```javascript
// ✅ GOED
const handleLocationClick = () => {};
const handleSearchChange = () => {};
const handleVibeSelect = () => {};

// ❌ INCONSISTENT
const clickLocation = () => {};
const onSearchChange = () => {};
const selectVibe = () => {};
```

## 🚀 Deployment Checklist

Voordat je live gaat:

- [ ] Alle console.logs verwijderd (behalve errors)
- [ ] Environment variables getest
- [ ] Database migrations toegepast
- [ ] RLS policies getest
- [ ] Analytics tracking gevalideerd
- [ ] Error boundaries toegevoegd
- [ ] Loading states overal
- [ ] Mobile responsive getest
- [ ] Cross-browser getest
- [ ] Performance audit gedaan (Lighthouse)

## 🎓 Volgende Stappen

1. **Week 1:** Extract top 5 grootste components uit App.jsx
2. **Week 2:** Implementeer useReducer voor state management
3. **Week 3:** Voeg memoization toe aan alle components
4. **Week 4:** Refactor inline styles naar style objects
5. **Week 5:** Complete error handling implementatie
6. **Week 6:** Performance optimalisatie & testing

## 💡 Quick Wins (Doe dit eerst!)

Deze verbeteringen kun je **vandaag** al doorvoeren met minimaal risico:

1. ✅ Gebruik de nieuwe utility files (al gemaakt)
2. ✅ Voeg try-catch toe aan alle database calls
3. ✅ Vervang inline styles in 1-2 components als test
4. ✅ Voeg loading states toe aan alle data fetching
5. ✅ Test de analytics tracking met de verbeterde functie

## 📞 Support

Bij vragen of problemen, check:
- Supabase dashboard voor database errors
- Browser console voor runtime errors
- Network tab voor API call failures
- React DevTools voor component re-renders

---

**Gemaakt:** 2026-03-08
**Status:** Database schema ✅ | Utilities ✅ | App refactor ⏳
