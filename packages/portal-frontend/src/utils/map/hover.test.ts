import { setupHoverState } from './hover'

type HoverState = Record<string, { hover?: boolean }>

const createMap = () => {
  const handlers: Record<string, (e?: unknown) => void> = {}
  const state: HoverState = {}
  const map = {
    on: (type: string, _layer: string, handler: (e?: unknown) => void) => {
      handlers[type] = handler
    },
    off: () => undefined,
    setFeatureState: (
      target: { source: string; id: string },
      s: { hover?: boolean }
    ) => {
      state[target.id] = { ...state[target.id], ...s }
    },
    getCanvas: () => ({ style: {} as Record<string, string> })
  }
  return { map, handlers, state }
}

const move = (handlers: Record<string, (e?: unknown) => void>, id: string) =>
  handlers.mousemove?.({ features: [{ id }] })

describe('setupHoverState — suppress after click-select', () => {
  it('keeps the just-clicked feature un-hovered until the cursor leaves it', () => {
    const { map, handlers, state } = createMap()
    const { suppress } = setupHoverState(map as never, 'src', 'lyr')

    move(handlers, 'a')
    expect(state.a.hover).toBe(true)

    // Click-select → suppress: the feature goes un-hovered.
    suppress()
    expect(state.a.hover).toBe(false)

    // Cursor still inside 'a': a mousemove must NOT re-hover it (the bug).
    move(handlers, 'a')
    expect(state.a.hover).toBe(false)

    // Cursor leaves the layer (mouseleave → clear), then returns to 'a'.
    handlers.mouseleave?.()
    move(handlers, 'a')
    expect(state.a.hover).toBe(true)
  })

  it('lifts suppression when the cursor moves onto a different feature', () => {
    const { map, handlers, state } = createMap()
    const { suppress } = setupHoverState(map as never, 'src', 'lyr')

    move(handlers, 'a')
    suppress()
    expect(state.a.hover).toBe(false)

    // Move onto 'b': it hovers normally, suppression no longer applies.
    move(handlers, 'b')
    expect(state.b.hover).toBe(true)
  })
})
