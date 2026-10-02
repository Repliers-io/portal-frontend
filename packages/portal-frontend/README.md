# Repliers Portal Frontend

A modern React application built with Next.js for the Repliers Portal platform. This repository contains the frontend interface that connects to the Repliers backend API to provide a comprehensive real estate portal experience.

## Overview

This application provides a full-featured real estate portal with interactive maps, property listings, and advanced search capabilities. The frontend is built using modern web technologies and follows Next.js best practices for performance and developer experience.

**Live Demo:** [portal.repliers.com](https://portal.repliers.com/)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (min v22.x)
- Git
- fully operational Repliers API backend (see [portal-backend](https://github.com/Repliers-io/portal-backend) for instructions on how to get it running locally)

**Required API Keys:**

- **Mapbox API Key** - Required for location and mapping features. Create a free account at [mapbox.com](https://www.mapbox.com/) to obtain your API key.
- **Google Maps API Key** - Required for Street View functionality. Create a free account at [Google Cloud Console](https://cloud.google.com/) and enable the Street View Static API.

### Installation

1. **Clone the repository**

```bash
git clone git@github.com:Repliers-io/portal-frontend.git
cd portal-frontend
```

2. **Install dependencies**

```bash
pnpm install
```

4. **Configure environment variables**

Create a `.env` file based on the provided `env.example` template:

```bash
cp env.example .env
```

Then update the `.env` file with your actual values:

**API Configuration:**

- `NEXT_PUBLIC_API_URL` - Base URL for your Repliers portal backend API (typically `http://localhost:8080` in development)

**Mapbox Configuration:**

- `NEXT_PUBLIC_MAPBOX_KEY` - Your Mapbox API key for location and mapping features. Get yours at [mapbox.com](https://www.mapbox.com/).

**Google Maps Configuration:**

- `NEXT_PUBLIC_GMAPS_KEY` - Your Google Maps API key for Street View functionality. Create an account at [Google Cloud Console](https://cloud.google.com/) and enable the Street View Static API.

> **Note:** All environment variables prefixed with `NEXT_PUBLIC_` will be bundled with the client-side code and exposed to the browser. For more information, see the [Next.js environment variables documentation](https://nextjs.org/docs/app/guides/environment-variables).

5. **Start the development server**

```bash
pnpm dev
```

Your app should now be running on the default port (3000).

### Reload the running development server

From the monorepo root:

```bash
pnpm frontend:dev:reload
```

From `packages/portal-frontend`, use `pnpm dev:reload`.

The command updates only the modification time of `next.config.js`. Next.js's
existing config watcher restarts its server worker on the same port. File contents
stay unchanged, so the command creates no config diff and needs no backup/restore.
The dev server must already be running; this command does not start one or wait
for the restarted worker to become ready. Watch its terminal for the Ready message.

Use it when a newly added tenant component fork is not picked up, or after changing
the webpack override resolver. Ordinary component/style edits use HMR and do not
need this command. It can also be called by a script or coding agent after those
specific changes; do not trigger it on every source edit.

This does not run prebuild, regenerate aliases or clear `.next`. After adding a
tenant config override, run the existing `generate:tsconfig` command with that
tenant's environment before reloading. To switch tenants or reread values injected
by `env-cmd -f .env.<tenant>`, stop and rerun the tenant's development command:
the automatic worker restart inherits the existing parent process environment.
