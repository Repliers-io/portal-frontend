// Freehand stroke: a drag point is kept only this far (screen px) from the last one
export const freehandStepPx = 4
// Douglas–Peucker tolerance applied on release, in screen px
export const freehandSimplifyPx = 3
// The ring is serialized into the page URL (~23 bytes per rounded vertex)
export const freehandMaxVertices = 200
// Coordinate decimals: 5 ≈ 1 m
export const freehandPrecision = 5
// gl-draw `meta` of the in-progress freehand fill: the polygon stroke layers skip
// it, so the stroke has no closing edge while drawing
export const freehandFillMeta = 'freehand-fill'
