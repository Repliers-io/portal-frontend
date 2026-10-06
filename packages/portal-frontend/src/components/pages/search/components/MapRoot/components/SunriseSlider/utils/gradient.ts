import { skyPalette } from '../constants'

/**
 * Normalize color to fixed saturation and lightness, keeping only hue
 */
export const normalizeColor = (
  hex: string,
  targetSaturation = 0.6,
  targetLightness = 0.85
) => {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  // Convert RGB to HSL to extract hue
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0

  if (max !== min) {
    const d = max - min

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  // Use extracted hue with fixed saturation and lightness
  const s = targetSaturation
  const l = targetLightness

  // Convert HSL back to RGB
  const hue2rgb = (p: number, q: number, tParam: number) => {
    let t = tParam
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let newR, newG, newB
  if (s === 0) {
    newR = newG = newB = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    newR = hue2rgb(p, q, h + 1 / 3)
    newG = hue2rgb(p, q, h)
    newB = hue2rgb(p, q, h - 1 / 3)
  }

  // Convert back to hex
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`
}

/**
 * Get sky gradient for slider background
 */
export const getSkyGradient = (
  startHour = 0,
  endHour = 24,
  direction = 'to right'
) => {
  const colors = skyPalette
    .filter((item) => item.hour >= startHour && item.hour <= endHour)
    .map((item) => normalizeColor(item.color))
  return `linear-gradient(${direction}, ${colors.join('F8, ')}F8)`
}

/**
 * Format time value to human-readable string
 */
export const formatTooltip = (val: number, amPmTime = true) => {
  let hours = Math.floor(val)
  let minutes = Math.round((val - hours) * 60)

  // Handle edge case when minutes round to 60
  if (minutes === 60) {
    hours += 1
    minutes = 0
  }

  if (amPmTime) {
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  return `${hours}:${minutes.toString().padStart(2, '0')}`
}
