# Repliers Portal Frontend

A modern React application built with Next.js for the Repliers Portal platform. This repository contains the frontend interface that connects to the Repliers backend API to provide a comprehensive real estate portal experience.

## Overview

This application provides a full-featured real estate portal with interactive maps, property listings, and advanced search capabilities. The frontend is built using modern web technologies and follows Next.js best practices for performance and developer experience.

**Live Demo:** [portal.repliers.com](https://portal.repliers.com/)

The repository is a pnpm workspace:

| Package                    | Contents                                                     |
| -------------------------- | ------------------------------------------------------------ |
| `packages/portal-frontend` | the portal app — Next.js (App Router)                        |
| `packages/ai-agent-client` | the AI chat interface embedded in the portal — Vite + React  |
| `packages/docs`            | frontend documentation site — Nextra                         |
| `packages/backend-docs`    | backend documentation site — Nextra                          |

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (min v22.x)
- pnpm (min v10.x)
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

2. **Install dependencies** of every package

```bash
pnpm install
```

3. **Configure environment variables**

Create `packages/portal-frontend/.env` with your values:

**API Configuration:**

- `NEXT_PUBLIC_API_URL` - Base URL for your Repliers portal backend API (typically `http://localhost:8080` in development)

**Mapbox Configuration:**

- `NEXT_PUBLIC_MAPBOX_KEY` - Your Mapbox API key for location and mapping features. Get yours at [mapbox.com](https://www.mapbox.com/).

**Google Maps Configuration:**

- `NEXT_PUBLIC_GMAPS_KEY` - Your Google Maps API key for Street View functionality. Create an account at [Google Cloud Console](https://cloud.google.com/) and enable the Street View Static API.

> **Note:** All environment variables prefixed with `NEXT_PUBLIC_` will be bundled with the client-side code and exposed to the browser. For more information, see the [Next.js environment variables documentation](https://nextjs.org/docs/app/guides/environment-variables).

4. **Start the development server**

```bash
pnpm frontend:dev
```

Your app should now be running on the default port (3000).
