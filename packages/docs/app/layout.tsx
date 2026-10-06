import { Poppins } from 'next/font/google'
import { Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import type { ReactNode } from 'react'
// Default portal logo (house), a copy of portal-frontend/public/logo.svg. Imported, not
// served from public/, so the static export's basePath reaches its URL.
import logo from './logo.svg'
// Required for theme styles — previously was imported under the hood
import 'nextra-theme-docs/style.css'
// Default-portal branding (Poppins + green accents); imported after the theme CSS to win.
import './globals.css'

// Default instance's primary font.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-primary'
})

export const metadata = {
  description: 'Portal Frontend Documentation',
  robots: 'noindex, nofollow',
  // Reuse the house logo as the tab icon so the browser loads it instead of probing
  // /favicon.ico (which the MDX catch-all would otherwise try to resolve as a page).
  icons: { icon: logo.src }
}

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path
      fill="currentColor"
      d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12"
    />
  </svg>
)

// Inside the portal (`build:documentation` sets DOCS_BASE_PATH) the navbar links the hub and
// the backend site. Plain <a>: next/link would prefix the basePath, and both are separate
// apps. Classes of Nextra's own navbar links, hidden below md like them — its mobile menu
// takes no custom items.
const portalLinkClass =
  'x:focus-visible:nextra-focus x:text-sm x:contrast-more:text-gray-700 x:contrast-more:dark:text-gray-100 x:whitespace-nowrap x:text-gray-600 x:hover:text-black x:dark:text-gray-400 x:dark:hover:text-gray-200 x:ring-inset x:transition-colors x:max-md:hidden'

const navbar = (
  <Navbar
    logo={
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontWeight: 600
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.src} alt="" width={24} height={24} />
        Frontend Docs
      </span>
    }
    projectLink="https://github.com/Repliers-io/portal-frontend"
    projectIcon={<GithubIcon />}
  >
    {process.env.DOCS_BASE_PATH && (
      <>
        <a href="/documentation" className={portalLinkClass}>
          All Docs
        </a>
        <a href="/documentation/backend" className={portalLinkClass}>
          Backend Docs
        </a>
      </>
    )}
  </Navbar>
)

export default async function RootLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={poppins.variable}
    >
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/Repliers-io/portal-frontend/tree/main/packages/docs"
          editLink="Edit this page on GitHub"
          sidebar={{ defaultMenuCollapseLevel: 1, toggleButton: true }}
          toc={{ backToTop: true }}
          feedback={{ content: null }}
          footer={null}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
