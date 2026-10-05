import nextra from 'nextra';

const withNextra = nextra({
  defaultShowCopyCode: true,
});

// Set by the portal's `build:documentation`: a static export served from the
// portal's public/ under this prefix. Unset = the standalone (Vercel) build.
const basePath = process.env.DOCS_BASE_PATH;

export default withNextra({
  reactStrictMode: true,
  basePath,
  output: basePath ? 'export' : undefined,
  // Pages export as `<page>/index.html` — one portal rewrite serves them all.
  trailingSlash: Boolean(basePath),
  // Nextra renders MDX images through next/image; the optimizer needs a server.
  images: { unoptimized: Boolean(basePath) },
});
