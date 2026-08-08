# JK Photography Website

Premium cinematic wedding photography portfolio for **JK Photography** (jkphotographychennai).

## Stack

- Next.js 15 (App Router)
- Tailwind CSS 4
- GSAP + Framer Motion
- Sharp-optimized WebP/AVIF media pipeline

## Setup

```bash
cd website
npm install
npm run optimize-media   # converts images/ + Videos posters into public/media
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run optimize-media` | Rebuild optimized gallery/heroes/films from local assets |

## Notes

- Source masters live in `../images` and `../Videos`.
- Optimized outputs land in `public/media` and `lib/media-manifest.json`.
- Full wedding video masters are large; film cards link to Instagram highlights until web-encoded clips are added under `public/media/films`.
