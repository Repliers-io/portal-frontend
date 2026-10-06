import type { WidgetSchema } from '../../CmsWidgets/types'

import type { WidgetConfig } from './widgetParser'
import { collapseMatchQueries, transformWidgetProps } from './widgetTransform'

// Mock component for tests
const MockComponent = () => null

describe('widgetTransform', () => {
  describe('transformWidgetProps', () => {
    describe('basic type transformations', () => {
      it('should transform string params', () => {
        const schema: WidgetSchema = {
          component: MockComponent,
          params: {
            title: { type: 'string' },
            subtitle: { type: 'string' }
          }
        }
        const widget: WidgetConfig = {
          name: 'TestWidget',
          props: { title: 'Hello', subtitle: 'World' },
          originalMatch: ''
        }

        const result = transformWidgetProps(widget, schema)

        expect(result.props).toEqual({
          title: 'Hello',
          subtitle: 'World'
        })
        expect(result.errors).toEqual([])
      })

      it('should transform number params from strings', () => {
        const schema: WidgetSchema = {
          component: MockComponent,
          params: {
            count: { type: 'number' }
          }
        }
        const widget: WidgetConfig = {
          name: 'TestWidget',
          props: { count: '42' },
          originalMatch: ''
        }

        const result = transformWidgetProps(widget, schema)

        expect(result.props).toEqual({ count: 42 })
        expect(result.errors).toEqual([])
      })

      it('should transform boolean params from strings', () => {
        const schema: WidgetSchema = {
          component: MockComponent,
          params: {
            active: { type: 'boolean' },
            disabled: { type: 'boolean' }
          }
        }
        const widget: WidgetConfig = {
          name: 'TestWidget',
          props: { active: 'true', disabled: 'false' },
          originalMatch: ''
        }

        const result = transformWidgetProps(widget, schema)

        expect(result.props).toEqual({ active: true, disabled: false })
        expect(result.errors).toEqual([])
      })

      it('should transform array params', () => {
        const schema: WidgetSchema = {
          component: MockComponent,
          params: {
            tags: { type: 'string[]' }
          }
        }
        const widget: WidgetConfig = {
          name: 'TestWidget',
          props: { tags: ['foo', 'bar', 'baz'] },
          originalMatch: ''
        }

        const result = transformWidgetProps(widget, schema)

        expect(result.props).toEqual({ tags: ['foo', 'bar', 'baz'] })
        expect(result.errors).toEqual([])
      })

      it('should convert single value to array if schema says array', () => {
        const schema: WidgetSchema = {
          component: MockComponent,
          params: {
            tags: { type: 'string[]', forceArray: true }
          }
        }
        const widget: WidgetConfig = {
          name: 'TestWidget',
          props: { tags: 'single' },
          originalMatch: ''
        }

        const result = transformWidgetProps(widget, schema)

        expect(result.props).toEqual({ tags: ['single'] })
      })
    })

    describe('default values', () => {
      it('should apply default values for missing params', () => {
        const schema: WidgetSchema = {
          component: MockComponent,
          params: {
            title: { type: 'string' },
            count: { type: 'number', defaultValue: 10 }
          }
        }
        const widget: WidgetConfig = {
          name: 'TestWidget',
          props: { title: 'Hello' },
          originalMatch: ''
        }

        const result = transformWidgetProps(widget, schema)

        expect(result.props).toEqual({
          title: 'Hello',
          count: 10
        })
      })

      it('should not apply defaults when value is provided', () => {
        const schema: WidgetSchema = {
          component: MockComponent,
          params: {
            count: { type: 'number', defaultValue: 10 }
          }
        }
        const widget: WidgetConfig = {
          name: 'TestWidget',
          props: { count: '5' },
          originalMatch: ''
        }

        const result = transformWidgetProps(widget, schema)

        expect(result.props).toEqual({ count: 5 })
      })
    })

    describe('nested object schemas', () => {
      it('should transform nested object from parser output', () => {
        const schema: WidgetSchema = {
          component: MockComponent,
          params: {
            title: { type: 'string' },
            listings: {
              type: 'object',
              properties: {
                resultsPerPage: { type: 'number', defaultValue: 12 },
                status: { type: 'string' }
              }
            }
          }
        }
        const widget: WidgetConfig = {
          name: 'CarouselWidget',
          props: {
            title: 'Properties',
            listings: {
              resultsPerPage: '8',
              status: 'active'
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
          originalMatch: ''
        }

        const result = transformWidgetProps(widget, schema)

        expect(result.props).toEqual({
          title: 'Properties',
          listings: {
            resultsPerPage: 8,
            status: 'active'
          }
        })
        expect(result.errors).toEqual([])
      })

      it('should return undefined for object if no real values provided', () => {
        const schema: WidgetSchema = {
          component: MockComponent,
          params: {
            title: { type: 'string' },
            listings: {
              type: 'object',
              properties: {
                resultsPerPage: { type: 'number', defaultValue: 12 },
                status: { type: 'string' }
              }
            }
          }
        }
        const widget: WidgetConfig = {
          name: 'CarouselWidget',
          props: {
            title: 'Properties'
            // No listings provided
          },
          originalMatch: ''
        }

        const result = transformWidgetProps(widget, schema)

        expect(result.props).toEqual({
          title: 'Properties'
          // listings should not be present
        })
      })

      it('should handle partial nested object values', () => {
        const schema: WidgetSchema = {
          component: MockComponent,
          params: {
            listings: {
              type: 'object',
              properties: {
                resultsPerPage: { type: 'number', defaultValue: 12 },
                status: { type: 'string' },
                minPrice: { type: 'number' }
              }
            }
          }
        }
        const widget: WidgetConfig = {
          name: 'CarouselWidget',
          props: {
            listings: {
              status: 'active'
              // Only status provided, not resultsPerPage or minPrice
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
          originalMatch: ''
        }

        const result = transformWidgetProps(widget, schema)

        expect(result.props).toEqual({
          listings: {
            resultsPerPage: 12, // default
            status: 'active'
            // minPrice not present (no default, no value)
          }
        })
      })

      it('should map listings.count to listings.resultsPerPage', () => {
        const schema: WidgetSchema = {
          component: MockComponent,
          params: {
            title: { type: 'string' },
            listings: {
              type: 'object',
              properties: {} // Empty properties - pass through all fields
            }
          }
        }
        const widget: WidgetConfig = {
          name: 'GridWidget',
          props: {
            title: 'Properties',
            listings: {
              count: '9',
              class: 'condo'
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
          originalMatch: ''
        }

        const result = transformWidgetProps(widget, schema)

        expect(result.props).toEqual({
          title: 'Properties',
          listings: {
            resultsPerPage: '9', // count mapped to resultsPerPage
            class: 'condo'
          }
        })
        expect(result.errors).toEqual([])
      })

      it('should pass through all listings fields when properties is empty', () => {
        const schema: WidgetSchema = {
          component: MockComponent,
          params: {
            listings: {
              type: 'object',
              properties: {} // Empty - accept all fields
            }
          }
        }
        const widget: WidgetConfig = {
          name: 'CarouselWidget',
          props: {
            listings: {
              resultsPerPage: '12',
              status: 'active',
              class: 'residential',
              minPrice: '100000',
              maxPrice: '500000',
              listingType: 'condo',
              area: 'downtown'
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
          originalMatch: ''
        }

        const result = transformWidgetProps(widget, schema)

        expect(result.props.listings).toEqual({
          resultsPerPage: '12',
          status: 'active',
          class: 'residential',
          minPrice: '100000',
          maxPrice: '500000',
          listingType: 'condo',
          area: 'downtown'
        })
      })
    })

    describe('error handling', () => {
      it('should convert invalid number to 0 without Joi validation', () => {
        const schema: WidgetSchema = {
          component: MockComponent,
          params: {
            count: { type: 'number' }
          }
        }
        const widget: WidgetConfig = {
          name: 'TestWidget',
          props: { count: 'not-a-number' },
          originalMatch: ''
        }

        const result = transformWidgetProps(widget, schema)

        expect(result.props.count).toBe(0) // Falls back to 0
        expect(result.errors).toHaveLength(0) // No Joi validation
      })

      it('should skip params not in schema', () => {
        const schema: WidgetSchema = {
          component: MockComponent,
          params: {
            title: { type: 'string' }
          }
        }
        const widget: WidgetConfig = {
          name: 'TestWidget',
          props: { title: 'Hello', unknown: 'value' },
          originalMatch: ''
        }

        const result = transformWidgetProps(widget, schema)

        expect(result.props).toEqual({ title: 'Hello' })
        expect(result.props).not.toHaveProperty('unknown')
      })
    })

    describe('real-world scenarios', () => {
      it('should transform CarouselWidget props correctly', () => {
        const schema: WidgetSchema = {
          component: MockComponent,
          params: {
            title: { type: 'string' },
            subtitle: { type: 'string' },
            size: {
              type: 'string',
              defaultValue: 'medium'
            },
            listings: {
              type: 'object',
              properties: {
                resultsPerPage: { type: 'number', defaultValue: 12 },
                status: { type: 'string' },
                class: { type: 'string' },
                minPrice: { type: 'number' },
                maxPrice: { type: 'number' }
              }
            }
          }
        }

        const widget: WidgetConfig = {
          name: 'CarouselWidget',
          props: {
            title: 'Featured Properties',
            subtitle: 'Check out our latest listings',
            size: 'large',
            listings: {
              resultsPerPage: '8',
              status: 'active',
              class: 'residential',
              minPrice: '100000',
              maxPrice: '500000'
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
          originalMatch: ''
        }

        const result = transformWidgetProps(widget, schema)

        expect(result.props).toEqual({
          title: 'Featured Properties',
          subtitle: 'Check out our latest listings',
          size: 'large',
          listings: {
            resultsPerPage: 8,
            status: 'active',
            class: 'residential',
            minPrice: 100000,
            maxPrice: 500000
          }
        })
        expect(result.errors).toEqual([])
      })

      it('should handle minimal CarouselWidget props with defaults', () => {
        const schema: WidgetSchema = {
          component: MockComponent,
          params: {
            title: { type: 'string' },
            subtitle: { type: 'string' },
            size: {
              type: 'string',
              defaultValue: 'medium'
            },
            listings: {
              type: 'object',
              properties: {
                resultsPerPage: { type: 'number', defaultValue: 12 }
              }
            }
          }
        }

        const widget: WidgetConfig = {
          name: 'CarouselWidget',
          props: {
            title: 'Properties'
          },
          originalMatch: ''
        }

        const result = transformWidgetProps(widget, schema)

        expect(result.props).toEqual({
          title: 'Properties',
          size: 'medium'
          // listings should not be present (no values provided)
        })
      })
    })
  })

  describe('collapseMatchQueries', () => {
    it('collapses match1/match2 into an ordered queries array', () => {
      const result = collapseMatchQueries({
        listingStatus: 'sold',
        match2: { raw: { BuyerAgentKey: 'X' } },
        match1: { agentId: 'X' }
      })

      expect(result.errors).toEqual([])
      expect(result.listings).toEqual({
        listingStatus: 'sold',
        queries: [{ agentId: 'X' }, { 'raw.BuyerAgentKey': 'X' }]
      })
    })

    it('preserves array values inside a batch', () => {
      const result = collapseMatchQueries({
        match1: { lastStatus: ['Sld', 'Sc'] }
      })

      expect(result.listings).toEqual({
        queries: [{ lastStatus: ['Sld', 'Sc'] }]
      })
    })

    it('leaves base-only listings unchanged', () => {
      const listings = { listingStatus: 'active', agentId: 'X' }
      const result = collapseMatchQueries(listings)

      expect(result.listings).toBe(listings)
      expect(result.errors).toEqual([])
    })

    it('reports and drops an out-of-range match index', () => {
      const result = collapseMatchQueries({
        match1: { agentId: 'X' },
        match10: { agentId: 'Y' }
      })

      expect(result.listings).toEqual({ queries: [{ agentId: 'X' }] })
      expect(result.errors).toEqual([
        'listings.match10: match index must be between 1 and 9'
      ])
    })
  })

  describe('transformWidgetProps — listings.match wiring', () => {
    it('exposes collapsed queries on the listings prop', () => {
      const schema: WidgetSchema = {
        component: MockComponent,
        params: { listings: { type: 'object', properties: {} } }
      }
      const widget: WidgetConfig = {
        name: 'GridWidget',
        props: {
          listings: {
            listingStatus: 'sold',
            match1: { agentId: 'X' },
            match2: { raw: { BuyerAgentKey: 'X' } }
          }
        } as unknown as WidgetConfig['props'],
        originalMatch: ''
      }

      const result = transformWidgetProps(widget, schema)

      expect(result.props.listings).toEqual({
        listingStatus: 'sold',
        queries: [{ agentId: 'X' }, { 'raw.BuyerAgentKey': 'X' }]
      })
    })
  })
})
