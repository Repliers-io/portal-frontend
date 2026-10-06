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

const BitbucketIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path
      fill="#94c748"
      d="M0 6a6 6 0 0 1 6-6h12a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6z"
    />
    <path
      fill="#101214"
      d="m17.898 11.353-.994 6.064c-.065.367-.324.583-.691.583H7.787c-.367 0-.627-.216-.691-.583L5.346 6.604C5.28 6.237 5.476 6 5.82 6h12.358c.346 0 .54.237.475.604l-.475 2.85c-.065.41-.303.582-.691.582h-7.432c-.109 0-.173.065-.152.194l.584 3.583c.021.086.086.151.172.151h2.68c.086 0 .15-.065.172-.151l.41-2.59c.044-.324.26-.453.563-.453H17.4c.432 0 .562.216.497.582"
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
    projectLink="https://bitbucket.org/repliers-client-work/smartmls-frontend"
    projectIcon={<BitbucketIcon />}
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
          docsRepositoryBase="https://bitbucket.org/repliers-client-work/smartmls-frontend/src/master/packages/docs"
          editLink="Edit this page on Bitbucket"
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
