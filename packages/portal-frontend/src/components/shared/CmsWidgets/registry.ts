import Joi from 'joi'

import features from '@configs/features'

import type { WidgetParamSchema, WidgetRegistry } from './types'
import {
  AuthorsWidget,
  BlogPostWidget,
  CarouselWidget,
  ContactWidget,
  EstimateWidget,
  GridWidget,
  MapGridWidget,
  MapWidget,
  MediaPlatformsWidget,
  PageWidget,
  ReviewsWidget,
  SubscribeWidget,
  TestWidget,
  YouTubeWidget
} from './widgets'

/**
 * Listings schema accepts ANY field from ApiQueryParams
 * All fields are passed through without validation in properties
 * Only Joi validation applies (which allows .unknown(true))
 */
const listingsQueryProperties: Record<string, WidgetParamSchema> = {}

// MLS numbers become query-string values; allow only slug-safe characters and
// cap the list so an embed URL can't build an oversized request.
const mlsNumberPattern = /^[\w-]{1,50}$/

// FUB tags a CMS ContactWidget attaches to its leads. Mirrors the backend's
// plain-label rule (validate/contact.ts) so a widget can't submit a rejected tag.
const tagPattern = /^[\p{L}\p{N} .'-]{1,50}$/u
const mlsNumber = Joi.alternatives(
  Joi.string().pattern(mlsNumberPattern),
  Joi.array().items(Joi.string().pattern(mlsNumberPattern)).max(50)
)

const listingsValidationSchema = Joi.object({ mlsNumber })
  .unknown(true) // Allow any other ApiQueryParams field
  .optional()

/**
 * Central registry of all available widgets
 * Maps widget names to their components and parameter schemas
 *
 * To add a new widget:
 * 1. Create widget component in CmsWidgets/ folder
 * 2. Define its props interface
 * 3. Add entry here with schema
 */
export const widgetRegistry: WidgetRegistry = {
  TestWidget: {
    component: TestWidget,
    params: {
      title: {
        type: 'string',
        required: true
      },
      count: {
        type: 'number',
        required: true
      },
      enabled: {
        type: 'boolean',
        defaultValue: true
      },
      tags: {
        type: 'string[]',
        forceArray: true, // Convert single value to array
        defaultValue: []
      },
      colors: {
        type: 'string[]',
        forceArray: true,
        defaultValue: []
      }
    },
    validation: Joi.object({
      title: Joi.string().min(3).max(100).required(),
      count: Joi.number().min(0).max(1000).required(),
      enabled: Joi.boolean(),
      tags: Joi.array().items(Joi.string()),
      colors: Joi.array().items(
        Joi.string().valid(
          'red',
          'green',
          'blue',
          'yellow',
          'purple',
          'orange',
          'pink',
          'black',
          'white',
          'gray',
          'brown'
        )
      )
    })
  },
  CarouselWidget: {
    component: CarouselWidget,
    params: {
      title: { type: 'string' },
      subtitle: { type: 'string' },
      buttonTitle: { type: 'string' },
      size: { type: 'string', defaultValue: 'medium' },
      bgcolor: { type: 'string' },
      listings: {
        type: 'object',
        properties: listingsQueryProperties
      }
    },
    validation: Joi.object({
      title: Joi.string().max(200).optional(),
      subtitle: Joi.string().max(500).optional(),
      buttonTitle: Joi.string().max(100).optional(),
      size: Joi.string().valid('small', 'medium', 'large').optional(),
      bgcolor: Joi.string().optional(),
      listings: listingsValidationSchema
    })
  },
  MapWidget: {
    component: MapWidget,
    params: {
      title: { type: 'string' },
      subtitle: { type: 'string' },
      width: { type: 'string' },
      height: { type: 'number', defaultValue: 400 },
      center: { type: 'string' },
      zoom: { type: 'number', defaultValue: 10 },
      markerSize: { type: 'string', defaultValue: 'tag' },
      fitToListings: { type: 'boolean', defaultValue: true },
      zoomButtons: { type: 'boolean', defaultValue: false },
      styleButtons: { type: 'boolean', defaultValue: false },
      scrollZoom: { type: 'boolean', defaultValue: false },
      listings: {
        type: 'object',
        properties: listingsQueryProperties
      }
    },
    validation: Joi.object({
      title: Joi.string().max(200).optional(),
      subtitle: Joi.string().max(500).optional(),
      width: Joi.alternatives()
        .try(
          Joi.string().valid('xs', 'sm', 'md', 'lg', 'xl'),
          Joi.number().min(200).max(1800)
        )
        .optional(),
      height: Joi.number().min(100).max(1200).optional(),
      zoom: Joi.number().min(1).max(22).optional(),
      center: Joi.string().optional(),
      markerSize: Joi.string().valid('point', 'tag', 'cluster').optional(),
      fitToListings: Joi.boolean().optional(),
      zoomButtons: Joi.boolean().optional(),
      styleButtons: Joi.boolean().optional(),
      scrollZoom: Joi.boolean().optional(),
      listings: listingsValidationSchema
    })
  },
  MapGridWidget: {
    component: MapGridWidget,
    params: {
      title: { type: 'string' },
      subtitle: { type: 'string' },
      height: { type: 'number' },
      mobileHeight: { type: 'number' },
      // Total width in card columns. The grid beside the map takes
      // `gridColumns` (auto: up to 2); the map fills the remaining width.
      maxColumns: { type: 'number', defaultValue: 4 },
      gridColumns: { type: 'number' },
      center: { type: 'string' },
      zoom: { type: 'number', defaultValue: 10 },
      markerSize: { type: 'string', defaultValue: 'tag' },
      fitToListings: { type: 'boolean', defaultValue: true },
      scrollZoom: { type: 'boolean', defaultValue: false },
      zoomButtons: { type: 'boolean', defaultValue: false },
      styleButtons: { type: 'boolean', defaultValue: false },
      layoutSwitch: { type: 'boolean', defaultValue: false },
      pagination: { type: 'boolean', defaultValue: true },
      pageSize: { type: 'number', defaultValue: 4 },
      listings: {
        type: 'object',
        properties: listingsQueryProperties
      }
    },
    validation: Joi.object({
      title: Joi.string().max(200).optional(),
      subtitle: Joi.string().max(500).optional(),
      maxColumns: Joi.number().min(1).max(6).optional(),
      gridColumns: Joi.number().min(1).max(6).optional(),
      height: Joi.number().min(100).max(1200).optional(),
      mobileHeight: Joi.number().min(100).max(1200).optional(),
      zoom: Joi.number().min(1).max(22).optional(),
      center: Joi.string().optional(),
      layoutSwitch: Joi.boolean().optional(),
      markerSize: Joi.string().valid('point', 'tag', 'cluster').optional(),
      fitToListings: Joi.boolean().optional(),
      scrollZoom: Joi.boolean().optional(),
      zoomButtons: Joi.boolean().optional(),
      styleButtons: Joi.boolean().optional(),
      pageSize: Joi.number().min(1).optional(),
      pagination: Joi.boolean().optional(),
      listings: listingsValidationSchema
    })
  },
  GridWidget: {
    component: GridWidget,
    params: {
      title: { type: 'string' },
      maxColumns: { type: 'number' },
      size: { type: 'string', defaultValue: 'medium' },
      pagination: { type: 'boolean', defaultValue: false },
      pageSize: { type: 'number' },
      listings: {
        type: 'object',
        properties: listingsQueryProperties
      }
    },
    validation: Joi.object({
      title: Joi.string().max(200).optional(),
      maxColumns: Joi.number().min(1).max(12).optional(),
      size: Joi.string().valid('small', 'medium', 'large').optional(),
      pageSize: Joi.number().min(1).optional(),
      pagination: Joi.boolean().optional(),
      listings: listingsValidationSchema
    })
  },
  PageWidget: {
    component: PageWidget,
    params: {
      slug: { type: 'string', required: true },
      title: { type: 'string' },
      maxWidth: { type: 'string', defaultValue: 'md' },
      bgcolor: { type: 'string' }
    },
    validation: Joi.object({
      slug: Joi.string().required(),
      title: Joi.string().optional(),
      maxWidth: Joi.string()
        .valid('xs', 'sm', 'md', 'lg', 'xl', 'false')
        .optional(),
      bgcolor: Joi.string().optional()
    })
  },
  EstimateWidget: {
    component: EstimateWidget,
    params: {
      height: { type: 'number' },
      showLogo: { type: 'boolean', defaultValue: false },
      maxWidth: { type: 'string', defaultValue: 'md' },
      bgcolor: { type: 'string', defaultValue: 'background.default' },
      target: { type: 'string', defaultValue: '_blank' },
      title: { type: 'string' },
      subtitle: { type: 'string' },
      submit: { type: 'string' },
      formAlign: { type: 'string', defaultValue: 'right' }
    },
    validation: Joi.object({
      height: Joi.number().min(200).max(1000).optional(),
      showLogo: Joi.boolean().optional(),
      maxWidth: Joi.string()
        .valid('xs', 'sm', 'md', 'lg', 'xl', 'false')
        .optional(),
      bgcolor: Joi.string().optional(),
      target: Joi.string().valid('_blank', '_self', '_top').optional(),
      title: Joi.string().max(200).optional(),
      subtitle: Joi.string().max(500).optional(),
      submit: Joi.string().max(100).optional(),
      formAlign: Joi.string().valid('left', 'right').optional()
    })
  },
  SubscribeWidget: {
    component: SubscribeWidget,
    params: {
      title: { type: 'string' },
      subtitle: { type: 'string' },
      bgcolor: { type: 'string' },
      submit: { type: 'string' },
      redirectUrl: { type: 'string' },
      formAlign: { type: 'string', defaultValue: 'right' }
    },
    validation: Joi.object({
      title: Joi.string().max(200).optional(),
      subtitle: Joi.string().max(500).optional(),
      bgcolor: Joi.string().optional(),
      submit: Joi.string().max(100).optional(),
      redirectUrl: Joi.string().uri().optional(),
      formAlign: Joi.string().valid('left', 'right').optional()
    })
  },
  ContactWidget: {
    component: ContactWidget,
    params: {
      title: { type: 'string' },
      subtitle: { type: 'string' },
      bgcolor: { type: 'string' },
      submit: { type: 'string' },
      showMessage: { type: 'boolean', defaultValue: true },
      redirectUrl: { type: 'string' },
      message: { type: 'string' },
      formAlign: { type: 'string', defaultValue: 'right' },
      tags: { type: 'string[]', forceArray: true }
    },
    validation: Joi.object({
      title: Joi.string().max(200).optional(),
      subtitle: Joi.string().max(500).optional(),
      bgcolor: Joi.string().optional(),
      submit: Joi.string().max(100).optional(),
      showMessage: Joi.boolean().optional(),
      redirectUrl: Joi.string().uri().optional(),
      message: Joi.string().max(500).optional(),
      formAlign: Joi.string().valid('left', 'right').optional(),
      tags: Joi.array()
        .items(Joi.string().pattern(tagPattern))
        .max(5)
        .optional()
    })
  },
  YouTubeWidget: {
    component: YouTubeWidget,
    params: {
      title: { type: 'string' },
      subtitle: { type: 'string' },
      maxResults: { type: 'number', defaultValue: 2 },
      feed: { type: 'number' },
      bgcolor: { type: 'string' }
    },
    validation: Joi.object({
      title: Joi.string().max(200).optional(),
      subtitle: Joi.string().max(500).optional(),
      maxResults: Joi.number().min(1).max(50).optional(),
      feed: Joi.number().optional(),
      bgcolor: Joi.string().optional()
    })
  },
  MediaPlatformsWidget: {
    component: MediaPlatformsWidget,
    params: {},
    validation: Joi.object()
  },
  ...(features.blog && {
    BlogPostWidget: {
      component: BlogPostWidget,
      params: {
        slug: { type: 'string' },
        index: { type: 'number', defaultValue: 0 },
        category: { type: 'string' },
        tag: { type: 'string' },
        title: { type: 'string' },
        showCategory: { type: 'boolean', defaultValue: false },
        bgcolor: { type: 'string' }
      },
      validation: Joi.object({
        slug: Joi.string().optional(),
        index: Joi.number().min(0).optional(),
        category: Joi.string().optional(),
        tag: Joi.string().optional(),
        title: Joi.string().optional(),
        showCategory: Joi.boolean().optional(),
        bgcolor: Joi.string().optional()
      })
    },
    AuthorsWidget: {
      component: AuthorsWidget,
      params: {
        title: { type: 'string' },
        subtitle: { type: 'string' },
        maxWidth: { type: 'string', defaultValue: 'lg' },
        disableGutters: { type: 'boolean', defaultValue: true },
        slugs: { type: 'string[]', forceArray: true, defaultValue: [] }
      },
      validation: Joi.object({
        title: Joi.string().max(200).optional(),
        subtitle: Joi.string().max(500).optional(),
        maxWidth: Joi.string()
          .valid('xs', 'sm', 'md', 'lg', 'xl', 'false')
          .optional(),
        disableGutters: Joi.boolean().optional(),
        slugs: Joi.array().items(Joi.string()).optional()
      })
    },
    ReviewsWidget: {
      component: ReviewsWidget,
      params: {
        title: { type: 'string' },
        subtitle: { type: 'string' },
        bgcolor: { type: 'string' }
      },
      validation: Joi.object({
        title: Joi.string().max(200).optional(),
        subtitle: Joi.string().max(500).optional(),
        bgcolor: Joi.string().optional()
      })
    }
  })

  // Add more widgets here
  // ExampleWidget: {
  //   component: ExampleWidget,
  //   params: {
  //     name: { type: 'string', required: true },
  //     items: { type: 'string[]', forceArray: true }
  //   }
  // }
}

/**
 * Get widget schema by name (case-insensitive)
 */
export function getWidgetSchema(name: string) {
  if (name in widgetRegistry) return widgetRegistry[name]
  const key = Object.keys(widgetRegistry).find(
    (k) => k.toLowerCase() === name.toLowerCase()
  )
  return key ? widgetRegistry[key] : undefined
}

/**
 * Check if widget is registered (case-insensitive)
 */
export function hasWidget(name: string): boolean {
  if (name in widgetRegistry) return true
  return Object.keys(widgetRegistry).some(
    (k) => k.toLowerCase() === name.toLowerCase()
  )
}
