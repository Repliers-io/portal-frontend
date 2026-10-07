/** @jest-environment @happy-dom/jest-environment */
import { createMarkerElement } from './markerElement'

describe('createMarkerElement — name-tag kind', () => {
  it('renders a name-tag shape with the label text', () => {
    const root = createMarkerElement({
      kind: 'name',
      label: 'Downtown',
      color: '#1565C0'
    })
    const shape = root.querySelector('.lm__shape') as HTMLElement
    expect(shape).not.toBeNull()
    expect(shape.classList.contains('lm__name')).toBe(true)
    expect(shape.textContent).toBe('Downtown')
  })
})
