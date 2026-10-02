import { parseWidgets } from './widgetParser'

describe('widgetParser', () => {
  describe('parseWidgets', () => {
    describe('basic parsing', () => {
      it('should parse widget with simple string props', () => {
        const content = '[TestWidget title="Hello" subtitle="World"]'
        const result = parseWidgets(content)

        expect(result).toHaveLength(1)
        expect(result[0]).toEqual({
          name: 'TestWidget',
          props: {
            title: 'Hello',
            subtitle: 'World'
          },
          originalMatch: '[TestWidget title="Hello" subtitle="World"]'
        })
      })

      it('should parse widget with unquoted values', () => {
        const content = '[TestWidget count=5 active=true]'
        const result = parseWidgets(content)

        expect(result[0].props).toEqual({
          count: '5',
          active: 'true'
        })
      })

      it('should handle empty props', () => {
        const content = '[TestWidget]'
        const result = parseWidgets(content)

        expect(result[0]).toEqual({
          name: 'TestWidget',
          props: {},
          originalMatch: '[TestWidget]'
        })
      })

      it('should allow square brackets inside quoted values', () => {
        const content =
          '[ContactWidget message="[Notify Me] Seattle Class" showMessage=false]'
        const result = parseWidgets(content)

        expect(result).toHaveLength(1)
        expect(result[0].props).toEqual({
          message: '[Notify Me] Seattle Class',
          showMessage: 'false'
        })
      })
    })

    describe('dot notation for nested objects', () => {
      it('should convert dot notation to nested object', () => {
        const content = '[CarouselWidget listings.resultsPerPage=8]'
        const result = parseWidgets(content)

        expect(result[0].props).toEqual({
          listings: {
            resultsPerPage: '8'
          }
        })
      })

      it('should handle multiple nested properties', () => {
        const content =
          '[CarouselWidget listings.resultsPerPage=8 listings.status="active" listings.class="residential"]'
        const result = parseWidgets(content)

        expect(result[0].props).toEqual({
          listings: {
            resultsPerPage: '8',
            status: 'active',
            class: 'residential'
          }
        })
      })

      it('should handle mixed flat and nested props', () => {
        const content =
          '[CarouselWidget title="Properties" listings.resultsPerPage=8 size="large"]'
        const result = parseWidgets(content)

        expect(result[0].props).toEqual({
          title: 'Properties',
          size: 'large',
          listings: {
            resultsPerPage: '8'
          }
        })
      })

      it('should handle deeply nested properties', () => {
        const content = '[TestWidget config.api.endpoint="https://api.com"]'
        const result = parseWidgets(content)

        expect(result[0].props).toEqual({
          config: {
            api: {
              endpoint: 'https://api.com'
            }
          }
        })
      })

      it('should create array from repeated nested params', () => {
        const content =
          '[MapWidget listings.listingStatus=sold listings.listingStatus=active]'
        const result = parseWidgets(content)

        expect(result[0].props).toEqual({
          listings: {
            listingStatus: ['sold', 'active']
          }
        })
      })
    })

    describe('array values', () => {
      it('should create array from multiple same params', () => {
        const content = '[TestWidget tag="foo" tag="bar" tag="baz"]'
        const result = parseWidgets(content)

        expect(result[0].props).toEqual({
          tag: ['foo', 'bar', 'baz']
        })
      })

      it('should handle single value as string, not array', () => {
        const content = '[TestWidget tag="foo"]'
        const result = parseWidgets(content)

        expect(result[0].props).toEqual({
          tag: 'foo'
        })
      })
    })

    describe('multiple widgets', () => {
      it('should parse multiple widgets from content', () => {
        const content = `
          [WidgetOneWidget title="First"]
          Some text here
          [WidgetTwoWidget count=5]
        `
        const result = parseWidgets(content)

        expect(result).toHaveLength(2)
        expect(result[0].name).toBe('WidgetOneWidget')
        expect(result[1].name).toBe('WidgetTwoWidget')
      })
    })

    describe('edge cases', () => {
      it('should handle empty content', () => {
        const content = ''
        const result = parseWidgets(content)

        expect(result).toEqual([])
      })

      it('should handle content without widgets', () => {
        const content = 'Just some regular text without any widgets'
        const result = parseWidgets(content)

        expect(result).toEqual([])
      })

      it('should NOT parse lowercase text in brackets as widgets', () => {
        const content = 'Contact us at [email] or [phone] for details'
        const result = parseWidgets(content)

        expect(result).toEqual([])
      })

      it('should NOT parse names without Widget suffix', () => {
        const content =
          '[Carousel title="Test"] [Grid count=5] [Button text="Click"]'
        const result = parseWidgets(content)

        expect(result).toEqual([])
      })

      it('should only parse names ending with Widget suffix', () => {
        const content = '[TestWidget title="Valid"] and [Test title="Invalid"]'
        const result = parseWidgets(content)

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('TestWidget')
      })

      it('should only parse widget names starting with uppercase', () => {
        const content =
          '[TestWidget title="Valid"] and [testWidget title="Invalid"]'
        const result = parseWidgets(content)

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('TestWidget')
      })

      it('should handle mixed case correctly', () => {
        const content =
          '[MyWidget a=1] [myWidget a=2] [TestWidget a=3] [Test a=4]'
        const result = parseWidgets(content)

        // Only MyWidget and TestWidget should be parsed (uppercase + proper name + Widget suffix)
        expect(result).toHaveLength(2)
        expect(result[0].name).toBe('MyWidget')
        expect(result[0].props).toEqual({ a: '1' })
        expect(result[1].name).toBe('TestWidget')
        expect(result[1].props).toEqual({ a: '3' })
      })

      it('should handle values with spaces in quotes', () => {
        const content = '[TestWidget title="Hello World" subtitle="Foo Bar"]'
        const result = parseWidgets(content)

        expect(result[0].props).toEqual({
          title: 'Hello World',
          subtitle: 'Foo Bar'
        })
      })

      it('should handle empty string values', () => {
        const content = '[TestWidget title="" subtitle=""]'
        const result = parseWidgets(content)

        expect(result[0].props).toEqual({
          title: '',
          subtitle: ''
        })
      })

      it('should handle numeric values', () => {
        const content = '[TestWidget count=123 price=99.99]'
        const result = parseWidgets(content)

        expect(result[0].props).toEqual({
          count: '123',
          price: '99.99'
        })
      })

      it('should handle boolean-like strings', () => {
        const content = '[TestWidget active=true disabled=false]'
        const result = parseWidgets(content)

        expect(result[0].props).toEqual({
          active: 'true',
          disabled: 'false'
        })
      })
    })

    describe('real-world examples', () => {
      it('should parse CarouselWidget with all params', () => {
        const content = `
          [CarouselWidget
            title="Featured Properties"
            subtitle="Check out our latest listings"
            size="large"
            listings.resultsPerPage=12
            listings.status="active"
            listings.class="residential"
            listings.minPrice=100000
            listings.maxPrice=500000
          ]
        `
        const result = parseWidgets(content)

        expect(result[0]).toEqual({
          name: 'CarouselWidget',
          props: {
            title: 'Featured Properties',
            subtitle: 'Check out our latest listings',
            size: 'large',
            listings: {
              resultsPerPage: '12',
              status: 'active',
              class: 'residential',
              minPrice: '100000',
              maxPrice: '500000'
            }
          },
          originalMatch: expect.any(String)
        })
      })
    })
  })
})
