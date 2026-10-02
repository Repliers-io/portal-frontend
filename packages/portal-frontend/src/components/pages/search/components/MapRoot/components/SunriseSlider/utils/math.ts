import { type RGB } from '../constants'

/** Milliseconds in a day */
export const dayMs = 1000 * 60 * 60 * 24

// ============================================================
// Basic Math Helpers
// ============================================================

/**
 * Linear interpolation between two values
 */
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

/**
 * Clamp value between min and max
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

/**
 * Clamp value between 0 and 1
 */
export const clamp01 = (value: number): number => clamp(value, 0, 1)

/**
 * Smoothstep interpolation for smoother transitions
 * Creates an S-curve: slow at edges, fast in middle
 */
export const smoothstep = (t: number): number => {
  const clamped = clamp01(t)
  return clamped * clamped * (3 - 2 * clamped)
}

// ============================================================
// RGB Color Helpers
// ============================================================

/**
 * Linear interpolation between two RGB colors
 */
export const lerpColor = (a: RGB, b: RGB, t: number): RGB => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t)
]

/**
 * Smooth interpolation between two RGB colors using smoothstep
 * Creates natural, cinematic color transitions
 */
export const smoothColor = (a: RGB, b: RGB, t: number): RGB => {
  const smoothT = smoothstep(t)
  return lerpColor(a, b, smoothT)
}
