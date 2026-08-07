# ENSEM Sport — Premium Experience

A complete visual and motion redesign of the official ENSEM Sport website, built around the club's existing black, white, and red identity.

## What changed

- New kinetic editorial homepage with oversized typography, match-day ribbons, layered crest artwork, and strong calls to action.
- A consistent premium design system across every public page: À propos, Bureau, Événements, Actualités, Galerie, Podcast, Partenaires, Inscription, and Contact.
- Native motion effects for page entrances, scroll reveals, parallax depth, magnetic buttons, menu transitions, and page changes.
- Responsive layouts for desktop, tablet, and mobile.
- Accessibility support for keyboard navigation and `prefers-reduced-motion`.
- Existing Supabase-powered content, forms, event details, and committee dashboard functionality preserved.

## Preview locally

Run a local web server from this folder, then open `http://localhost:4173`:

```powershell
python -m http.server 4173
```

Opening the HTML files through a local server is recommended so every browser feature works consistently.

## Main files

- `index.html` — redesigned homepage
- `experience.css` — premium visual system and responsive layouts
- `experience.js` — motion and interaction enhancements
- `styles.css` — original shared styles retained for compatibility
- `app.js` — original site data and form behavior retained
- `dashboard.html` — existing committee administration area

## Design direction

The experience uses a kinetic Swiss-sports editorial language: strict grids, stadium-scale typography, deep black fields, ENSEM red, sharp white contrast, and animated event-tape motifs. It keeps the existing ENSEM Sport logo, content, event imagery, and institutional context rather than replacing the club's identity.

No build step or new dependency is required.
