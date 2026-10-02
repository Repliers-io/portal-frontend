import { sanitize } from './WidgetHtmlText'

describe('WidgetHtmlText/sanitize', () => {
  describe('plain text', () => {
    it('returns plain text unchanged', () => {
      expect(sanitize('Hello world')).toBe('Hello world')
    })

    it('returns empty string unchanged', () => {
      expect(sanitize('')).toBe('')
    })
  })

  describe('<a> tag — allowed', () => {
    it('keeps <a> with https href', () => {
      const input = '<a href="https://example.com">link</a>'
      expect(sanitize(input)).toBe(
        '<a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>'
      )
    })

    it('keeps <a> with http href', () => {
      const input = '<a href="http://example.com">link</a>'
      expect(sanitize(input)).toBe(
        '<a href="http://example.com" target="_blank" rel="noopener noreferrer">link</a>'
      )
    })

    it('keeps <a> with root-relative href', () => {
      const input = '<a href="/listings">browse</a>'
      expect(sanitize(input)).toBe(
        '<a href="/listings" target="_blank" rel="noopener noreferrer">browse</a>'
      )
    })

    it('keeps <a> with mailto href', () => {
      const input = '<a href="mailto:info@example.com">email us</a>'
      expect(sanitize(input)).toBe(
        '<a href="mailto:info@example.com" target="_blank" rel="noopener noreferrer">email us</a>'
      )
    })

    it('keeps mixed text with <a> tag', () => {
      const input = 'See listings <a href="https://example.com">here</a> now'
      expect(sanitize(input)).toBe(
        'See listings <a href="https://example.com" target="_blank" rel="noopener noreferrer">here</a> now'
      )
    })

    it('always applies target and rel regardless of original attributes', () => {
      const input = '<a href="https://x.com" target="_self" rel="follow">x</a>'
      const result = sanitize(input)
      expect(result).toContain('target="_blank"')
      expect(result).toContain('rel="noopener noreferrer"')
    })
  })

  describe('<a> tag — blocked', () => {
    it('strips <a> with javascript: href', () => {
      const input = '<a href="javascript:alert(1)">xss</a>'
      expect(sanitize(input)).toBe('xss')
    })

    it('strips <a> with data: href', () => {
      const input = '<a href="data:text/plain,payload">xss</a>'
      expect(sanitize(input)).toBe('xss')
    })

    it('strips <a> with no href', () => {
      const input = '<a>no href</a>'
      expect(sanitize(input)).toBe('no href')
    })

    it('strips <a> with empty href', () => {
      const input = '<a href="">empty</a>'
      expect(sanitize(input)).toBe('empty')
    })

    it('strips <a> with no href attribute', () => {
      const input = '<a>no href</a>'
      expect(sanitize(input)).toBe('no href')
    })
  })

  describe('<a> tag — non-double-quoted href', () => {
    it('keeps <a> with single-quoted href', () => {
      const input = "<a href='https://example.com'>link</a>"
      expect(sanitize(input)).toBe(
        '<a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>'
      )
    })

    it('keeps <a> with unquoted href', () => {
      const input = '<a href=https://example.com>link</a>'
      expect(sanitize(input)).toBe(
        '<a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>'
      )
    })

    it('keeps <a> with unquoted href containing path', () => {
      const input =
        '<a href=https://www.urbnlivn.com/seattle-condos/belltown/belltown-court/>Belltown Court</a>'
      expect(sanitize(input)).toBe(
        '<a href="https://www.urbnlivn.com/seattle-condos/belltown/belltown-court/" target="_blank" rel="noopener noreferrer">Belltown Court</a>'
      )
    })
  })

  describe('formatting tags — allowed', () => {
    it('keeps <b> tags', () => {
      expect(sanitize('<b>bold</b>')).toBe('<b>bold</b>')
    })

    it('keeps <i> tags', () => {
      expect(sanitize('<i>italic</i>')).toBe('<i>italic</i>')
    })

    it('keeps <em> tags', () => {
      expect(sanitize('<em>text</em>')).toBe('<em>text</em>')
    })

    it('keeps <strong> tags', () => {
      expect(sanitize('<strong>text</strong>')).toBe('<strong>text</strong>')
    })

    it('keeps <u> tags', () => {
      expect(sanitize('<u>underline</u>')).toBe('<u>underline</u>')
    })

    it('keeps <s> tags', () => {
      expect(sanitize('<s>strikethrough</s>')).toBe('<s>strikethrough</s>')
    })

    it('keeps <br>', () => {
      expect(sanitize('line1<br>line2')).toBe('line1<br>line2')
    })

    it('strips attributes from formatting tags', () => {
      expect(sanitize('<b class="x" onclick="alert(1)">bold</b>')).toBe(
        '<b>bold</b>'
      )
    })
  })

  describe('disallowed tags', () => {
    it('strips <script> tags and their content markers', () => {
      const input = '<script>alert(1)</script>'
      expect(sanitize(input)).toBe('alert(1)')
    })

    it('strips <img> tags', () => {
      const input = 'text <img src="x" onerror="alert(1)"> end'
      expect(sanitize(input)).toBe('text  end')
    })

    it('strips <iframe> tags', () => {
      const input = '<iframe src="https://evil.com"></iframe>'
      expect(sanitize(input)).toBe('')
    })
  })

  describe('edge cases', () => {
    it('handles multiple links in one string', () => {
      const input =
        '<a href="https://a.com">A</a> and <a href="https://b.com">B</a>'
      expect(sanitize(input)).toBe(
        '<a href="https://a.com" target="_blank" rel="noopener noreferrer">A</a> and <a href="https://b.com" target="_blank" rel="noopener noreferrer">B</a>'
      )
    })

    it('handles a valid link mixed with a formatting tag', () => {
      const input = '<b>Bold</b> and <a href="https://x.com">link</a>'
      expect(sanitize(input)).toBe(
        '<b>Bold</b> and <a href="https://x.com" target="_blank" rel="noopener noreferrer">link</a>'
      )
    })
  })
})
