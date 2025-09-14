import { type Metadata } from 'next'

import { type ToolbarConfig } from '@templates/Header/components/ToolbarMenu'

const content = {
  siteLogo: { url: '/logo.svg', width: 36, height: 36 },
  siteMobileLogo: { url: '/logo.svg', width: 36, height: 36 },
  siteFooterLogo: { url: '/logo-footer.svg', width: 80, height: 100 },
  siteSplashscreen: '/splashscreen.webp',
  loginSplashscreen: '/splashscreen.webp',
  siteName: 'DEFAULTNAME',
  siteDefaultBrokerageName: 'DEFAULT BROKERAGE NAME',
  siteKeywords: ['DEFAULTKEY1', 'DEFAULTKEY2'],
  siteDescription:
    'DEFAULTNAME lorem ipsum dolor sit amet, consectetur adipiscing elit DEFAULTSTATE.',
  siteFooterDescription:
    'Our mission is to make the MLS more valuable while remaining committed to the needs of local markets. We do this by delivering exceptional customer service and striving for continuous innovation.',
  siteFullscreenFooter: '',
  homepageHeroBlock: {
    title: 'DEFAULTNAME',
    subTitle:
      'DEFAULTNAME serves over XX,XXX real estate professionals in DEFAULTSTATE. As a top-rated multiple listing service (MLS), we provide property information and innovative products.'
  },

  siteMetadata: {
    title: {
      template: 'DEFAULTNAME > %s',
      default: 'DEFAULTNAME' // fallback
    },
    // metadataBase: new URL('https://smartmls.com/'), // canonical URL
    alternates: {
      canonical: '/'
    },
    generator: 'Next.js',
    applicationName: 'DEFAULTNAME',
    referrer: 'origin-when-cross-origin',
    keywords: ['DEFAULTKEY1', 'DEFAULTKEY2'],
    // authors: [{ name: 'John' }, { name: 'Jane' }],
    creator: 'John Doe',
    publisher: 'John Doe',
    // formatDetection: {
    //   email: false,
    //   address: false,
    //   telephone: false
    // },
    description:
      'DEFAULTNAME lorem ipsum dolor sit amet, consectetur adipiscing elit DEFAULTSTATE.',
    icons: {
      icon: '/favicon.ico'
    }
  } as Metadata,
  estimateMetadata: {
    title:
      'DEFAULTNAME lorem ipsum dolor sit amet, consectetur adipiscing elit DEFAULTSTATE.',
    description:
      'DEFAULTNAME lorem ipsum dolor sit amet, consectetur adipiscing elit DEFAULTSTATE.'
  } as Metadata,
  estimateResultMetadata: {
    title: '$ Property Valuation Report',
    description:
      'View your comprehensive $ home valuation from HomeIQ. AI-powered insights, neighbourhood trends, and market data for informed decisions.'
  } as Metadata,
  missingPropertyMetadata: {
    title: "Listing you are looking for isn't there.",
    description: "Listing you are looking for isn't there."
  } as Metadata,
  restrictedPropertyTitle:
    'This listing is only visible to registered users due to MLS compliance.',
  estimateBoardRegulations: '',
  toolbarMenuItems: [] as ToolbarConfig[]
}

export default content
