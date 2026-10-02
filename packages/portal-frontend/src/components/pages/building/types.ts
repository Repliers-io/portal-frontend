import { type BreadcrumbItem } from '@shared/Breadcrumbs'
import { type NavigationBarItem } from '@shared/NavigationBar'

import { type ApiBuilding, type ApiBuildingAddress } from 'services/API'
import { type Post } from 'services/CMS'
import { type CmsBuilding } from 'providers/BuildingProvider'
import { type SlideshowImage } from 'providers/BuildingProvider'

import { type BuildingInfoItem } from './components/BuildingInfo'

export type BuildingSection = {
  heading?: string
  content: string
  image?: number
  imageData?: {
    url: string
    alt?: string
    width?: number
    height?: number
  }
  related?: number[]
  relatedData?: any[]
  videoIds?: string[]
}

export type BuildingFAQ = {
  question: string
  answer: string
}

export type BuildingMap = {
  lat: number
  lng: number
  zoom?: number
  address?: string
  description?: string
}

export type BuildingReviews = {
  posts: Post[]
  totalPosts: number
}

export type Building = {
  // Identity
  name: string
  slug?: string

  // Address & Location (API takes priority)
  address?: ApiBuildingAddress
  location: { area?: string; city?: string; neighborhood?: string }

  // Media — two modes:
  // gallery.length >= 2 → gallery mode (HeroGallery with slideshow/fullscreen)
  // gallery.length < 2 → image+map mode (single image + map side-by-side)
  gallery: SlideshowImage[]
  heroImage?: string

  // Map
  map?: BuildingMap

  // Specs (merged, API priority for overlapping fields)
  specs: BuildingInfoItem[]

  // Amenities
  amenities: string[] | string
  nearbyAmenities: string[]

  // Content (CMS-only enrichment, empty if no CMS data)
  description?: string
  sections: BuildingSection[]
  faqs: BuildingFAQ[]
  reviews: BuildingReviews

  // Breadcrumbs (always programmatic location hierarchy)
  breadcrumbs: BreadcrumbItem[]

  // Navigation (computed from available data)
  navigationItems: NavigationBarItem[]

  // Raw sources (for components that need original data)
  apiBuilding?: ApiBuilding
  cmsBuilding?: CmsBuilding
}
