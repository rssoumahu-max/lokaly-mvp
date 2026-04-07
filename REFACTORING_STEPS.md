# App.jsx Refactoring - Herstel Instructies

## Probleem
Het App.jsx bestand is beschadigd geraakt tijdens de refactoring. Het originele bestand was 21.130 regels.

## Oplossing
We moeten het originele App.jsx bestand herstellen en dan de juiste imports toevoegen + de geëxtraheerde secties verwijderen.

## Stap 1: Herstel origineel bestand
Het originele App.jsx bestand moet hersteld worden vanuit een backup of versiecontrole.

## Stap 2: Voeg imports toe
Voeg deze imports toe DIRECT na de bestaande React en Supabase imports:

```javascript
import { STRINGS } from './constants/strings';
import { THEME } from './constants/theme';
import { VIBES } from './constants/vibes';
import { CATEGORIES } from './constants/categories';
import { LOCATIONS } from './constants/locations';
import { shareLocation } from './lib/shareLocation';
import { getVibeColor } from './lib/getVibeColor';
import { useIsMobile } from './hooks/useIsMobile';
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
```

## Stap 3: Verwijder deze secties
Verwijder VOLLEDIG uit App.jsx (zoek naar de comments):

1. `const STRINGS = { ... };` (regel ~89-266)
2. `const THEME = { ... };` (regel ~270-298)
3. `function useIsMobile(...) { ... }` (regel ~302-314)
4. `const VIBES = [ ... ];` (regel ~318-481)
5. `const CATEGORIES = [ ... ];` (regel ~483-745)
6. `const getVibeColor = (...) => { ... };` (regel ~749-767)
7. `const LOCATIONS = [ ... ];` (regel ~771-932)
8. `function shareLocation(...) { ... }` (regel ~936-975)
9. Alle Icon functies (regel ~977-1245):
   - IconSearch
   - IconMenu
   - IconUser
   - IconStar
   - StarFill
   - RenderStars
   - IconBookmark
   - IconShare
   - IconGrid
   - IconPin
   - IconArrowUpRight

## BELANGRIJK
LAAT DEZE STAAN in App.jsx:
- `const GOOGLE_MAPS_API_KEY = ...`
- `async function geocodeNlPostcodeHouse(...) { ... }`
- Alle component definities
- De main App() functie

## Nieuwe bestanden die al gemaakt zijn:
✅ src/constants/strings.js
✅ src/constants/theme.js
✅ src/constants/vibes.js
✅ src/constants/categories.js
✅ src/constants/locations.js
✅ src/lib/shareLocation.js
✅ src/lib/getVibeColor.js
✅ src/hooks/useIsMobile.js (was al aanwezig)
✅ src/components/icons.jsx

## Test
```bash
npm run build
```
