import { Poppins } from 'next/font/google'

export const primaryFont = Poppins({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-primary'
})

export const secondaryFont: typeof primaryFont | null = null
