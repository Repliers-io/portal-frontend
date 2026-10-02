export type RGB = [number, number, number]

// ============================================================
// Debug Constants
// ============================================================

export const SUMMER_SOLSTICE = new Date('2025-06-21T12:00:00')
export const WINTER_SOLSTICE = new Date('2025-12-21T12:00:00')

// ============================================================
// Feature Flags
// ============================================================

export const ENABLE_FOG = false

// ============================================================
// Lighting Key Colors
// ============================================================

export const LIGHTING_KEYS = {
  night: {
    ambient: [70, 90, 140] as RGB,
    directional: [170, 190, 255] as RGB // moon
  },
  twilight: {
    // ambient: [180, 200, 230] as RGB,
    ambient: [125, 145, 185] as RGB, // navy twilight
    directional: [255, 180, 120] as RGB // warm sunrise/sunset (arcFactor=0)
  },
  zenith: {
    ambient: [180, 200, 230] as RGB,
    directional: [255, 248, 240] as RGB // more neutral
    // directional: [255, 245, 230] as RGB // neutral noon (arcFactor=1)
  }
} as const

// Sky gradient simulating sunrise to sunset
// From 1 hour before sunrise to 1 hour after sunset

export const skyPalette = [
  { hour: 0, color: '#172d3f' },
  { hour: 1, color: '#183144' },
  { hour: 2, color: '#163247' },
  { hour: 3, color: '#1b3246' },
  { hour: 4, color: '#28344d' },
  { hour: 5, color: '#303548' },
  { hour: 6, color: '#3a374f' },
  { hour: 7, color: '#b67c6e' },
  { hour: 8, color: '#e4e1b1' },
  // { hour: 9, color: '#cfdfe2' },
  { hour: 10, color: '#bcdbe4' },
  { hour: 11, color: '#a9d3e3' },
  { hour: 12, color: '#9fd0e3' },
  { hour: 13, color: '#99cee1' },
  { hour: 14, color: '#9ed1e3' },
  { hour: 15, color: '#cfdfe2' },
  { hour: 16, color: '#b2a189' },
  // { hour: 17, color: '#b28992' },
  { hour: 18, color: '#d17578' },
  { hour: 19, color: '#604182' },
  { hour: 20, color: '#29346e' },
  { hour: 21, color: '#182b3c' },
  { hour: 22, color: '#16375d' },
  { hour: 23, color: '#163048' }
  // { hour: 24, color: '#182b3c' }
]
