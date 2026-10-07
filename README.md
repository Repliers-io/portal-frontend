# Repliers Portal Frontend

A white-label real estate portal built with Next.js on Repliers MLS data: map search, listing pages, saved searches, favorites and home estimates.

**Live Demo:** [portal.repliers.com](https://portal.repliers.com/)

**Documentation:** [portal.repliers.com/documentation](https://portal.repliers.com/documentation) — the full frontend and backend guides.

The repository is a pnpm workspace:

| Package                    | Contents                                               |
| -------------------------- | ------------------------------------------------------ |
| `packages/portal-frontend` | the portal app — Next.js 16.3 (App Router), React 19.2 |
| `packages/docs`            | frontend documentation site — Nextra 4.6               |
| `packages/backend-docs`    | backend documentation site — Nextra 4.6                |

## Getting Started

### Prerequisites

- Node.js 24.x or 26.x
- pnpm 12.6 (pinned in `package.json` → `packageManager`)
- Git
- A running [portal-backend](https://github.com/Repliers-io/portal-backend) — the proxy between the portal and the Repliers API; its README covers the local setup (default port 8080)

**API Keys:**

- **Repliers API Key** - Required; it goes into the backend's `.env` (`REPLIERS_API_KEY`), not into the frontend. Create a free account at [login.repliers.com](https://login.repliers.com/) to obtain your API key.
- **Mapbox API Key** - Required for maps and address search. Create a free account at [mapbox.com](https://www.mapbox.com/) to obtain your API key.
- **Google Maps API Key** - Optional; powers the Street View images on listing and home estimate pages and the satellite map preview on listing pages. Create a free account at [Google Cloud Console](https://cloud.google.com/) and enable the Street View Static API, Maps Static API and Geocoding API. Without the key these images do not load; the rest of the portal works.

### Installation

1. **Clone the repository**

```bash
git clone git@github.com:Repliers-io/portal-frontend.git
cd portal-frontend
```

2. **Install dependencies** of every package

```bash
pnpm install
```

3. **Configure environment variables** in `packages/portal-frontend/.env`:

```bash
# portal-backend URL
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_MAPBOX_KEY=<your Mapbox API key>
# optional
NEXT_PUBLIC_GMAPS_KEY=<your Google Maps API key>
```

> **Note:** All environment variables prefixed with `NEXT_PUBLIC_` will be bundled with the client-side code and exposed to the browser. For more information, see the [Next.js environment variables documentation](https://nextjs.org/docs/app/guides/environment-variables).

4. **Start the development server**

```bash
pnpm frontend:dev
```

Open [http://localhost:3000](http://localhost:3000). If the map stays blank, check `NEXT_PUBLIC_MAPBOX_KEY`; if search returns no listings, check that the backend is running at `NEXT_PUBLIC_API_URL`.

## Customization

The portal is white-label: branding, texts and the feature set are configured in files, without changing components. Paths are relative to `packages/portal-frontend/`:

| What                                                                   | Where                                                                     |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Brand colors and MUI theme                                             | `src/configs/defaults/colors.ts`, `src/configs/defaults/theme/`           |
| Site name, contacts, logo paths, SEO metadata, custom scripts          | `src/configs/defaults/content.ts`                                         |
| Logos, favicon, splash screen                                          | `public/`                                                                 |
| Enabled features (map, favorites, saved searches, estimate, blog, …)   | `src/configs/defaults/features.ts`                                        |
| Menus, map, search and filters                                         | `src/configs/defaults/` — `menu.ts`, `map.ts`, `search.ts`, `filters.ts` |
| Interface texts                                                        | `src/i18n/defaults/en.json`                                               |
| Static pages (about, contact, privacy policy, terms of use, …)          | `src/content/defaults/`                                                   |
| Icons                                                                  | `src/assets/icons/defaults/`                                              |

## Production

1. **Set the environment** in `packages/portal-frontend/.env` (or in your host's environment):

   - `NEXT_PUBLIC_API_URL` - your deployed portal-backend. It must be reachable from the build machine too: the build pre-renders pages and sitemaps from its data.
   - `NEXT_PUBLIC_APP_DOMAIN` - the public URL of the site (e.g. `https://homes.example.com`): the base URL of page metadata and sitemaps; it also turns on the same-origin check of the portal's API routes. Unset, metadata URLs point at `http://localhost:3000`.
   - **Blog CMS** (optional) - `CMS_BLOG_CLIENT=wordpress` with `WORDPRESS_API_URL`, or `CMS_BLOG_CLIENT=ghost` with `GHOST_API_URL` and `GHOST_API_KEY`. Without it the blog pages return 404.

2. **Allow search engines:** `noIndex: true` in `src/configs/defaults/content.ts` keeps the site out of search results (a `noindex` robots meta tag and `X-Robots-Tag` header). Set it to `false` for a live site.

3. **Build and start:**

```bash
pnpm build:documentation   # optional: the documentation at /documentation
pnpm frontend:build
pnpm frontend:start
```

## Commands

Run from the repository root:

| Command                                            | Description                                                                            |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `pnpm frontend:dev`                                | Development server at [localhost:3000](http://localhost:3000)                          |
| `pnpm frontend:build`                              | Production build                                                                       |
| `pnpm frontend:start` (alias: `pnpm start`)        | Serve the production build                                                             |
| `pnpm frontend:eslint`                             | Lint                                                                                   |
| `pnpm frontend:type-check`                         | TypeScript check                                                                       |
| `pnpm frontend:test`                               | Unit tests                                                                             |
| `pnpm docs:dev` / `pnpm docs:start`                | Frontend documentation site at [localhost:4000](http://localhost:4000) (dev / production) |
| `pnpm docs:build`                                  | Build the frontend documentation site                                                  |
| `pnpm docs:type-check`                             | TypeScript check of the frontend documentation site                                    |
| `pnpm docs:prettier` / `pnpm docs:prettier:fix`    | Check / fix formatting of the frontend documentation site                               |
| `pnpm docs:backend:dev` / `pnpm docs:backend:start` | Backend documentation site at [localhost:4001](http://localhost:4001) (dev / production) |
| `pnpm docs:backend:build`                          | Build the backend documentation site                                                   |
| `pnpm docs:backend:type-check`                     | TypeScript check of the backend documentation site                                     |
| `pnpm build:documentation`                         | Build both documentation sites into the portal at `/documentation`; run it before `pnpm frontend:build` |
| `pnpm clean:documentation`                         | Remove the documentation built into the portal                                         |
| `pnpm build:all`                                   | Build every package                                                                    |

## License

[Repliers Source-Available License](LICENSE): the code may be used only with an active Repliers API account and only with data from the Repliers API.
