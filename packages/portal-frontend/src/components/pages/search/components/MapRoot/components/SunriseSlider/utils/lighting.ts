import type mapboxgl from 'mapbox-gl'

import mapConfig from '@configs/map'

import { setBuildingWindowActivity } from 'utils/map/buildingWindows'
import { styleReady } from 'utils/map/style'

import { ENABLE_FOG, LIGHTING_KEYS, type RGB } from '../constants'

import { clamp, clamp01, dayMs, smoothColor, smoothstep } from './math'

// ============================================================
// Seasonal & Time Calculations
// ============================================================

export const calcSummerFactor = (date: Date): number => {
  const year = date.getUTCFullYear()
  const summerSolstice = Date.UTC(year, 5, 21)
  const winterSolstice = Date.UTC(year, 11, 21)
  const dateDay = Date.UTC(year, date.getUTCMonth(), date.getUTCDate())

  const daysSinceWinter =
    dateDay < summerSolstice
      ? (dateDay - Date.UTC(year - 1, 11, 21)) / dayMs
      : (dateDay - winterSolstice) / dayMs

  return Math.abs(
    daysSinceWinter / Math.abs((summerSolstice - winterSolstice) / dayMs)
  )
}

export const calcSolarDeclination = (date: Date = new Date()): number => {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / dayMs
  )
  const angle = ((360 / 365) * (dayOfYear + 10) * Math.PI) / 180
  return -23.44 * Math.cos(angle)
}

export const calcMaxSolarAltitude = (latitude: number, date?: Date): number => {
  return 90 - Math.abs(latitude - calcSolarDeclination(date))
}

export const calcSunPosition = (
  dayProgress: number,
  maxSolarAltitude: number
): { azimuth: number; altitude: number } => ({
  azimuth: 90 + dayProgress * 180,
  altitude: Math.sin(dayProgress * Math.PI) * maxSolarAltitude
})

export const calcArcFactor = (
  altitude: number,
  maxAltitude: number
): number => {
  const normalized = clamp01(Math.abs(altitude) / maxAltitude)
  return Math.sin(normalized * Math.PI * 0.5)
}

export const calcTwilightFactor = (altitude: number): number =>
  clamp01(1 - Math.abs(altitude) / 15)

const rgbString = (rgb: RGB): string => {
  const [r, g, b] = rgb
  return `rgb(${r},${g},${b})`
}

// ============================================================
// Fog Calculations
// ============================================================

export const calcFog = (
  altitude: number,
  arcFactor: number,
  twilightFactor: number
) => {
  const nightSky: RGB = [180, 200, 230]
  const daySky: RGB = [245, 250, 255]

  const factor = altitude > 0 ? arcFactor ** 0.5 : 0

  const horizonBlend = 0.1 + (1 - arcFactor) * 0.6 // 0.1..0.4

  const fogColor = smoothColor(nightSky, daySky, factor * 0.5)
  const highColor = smoothColor(nightSky, daySky, factor * 0.75)
  const spaceColor = smoothColor(nightSky, daySky, factor * 1.0)

  const starIntensity = altitude < 0 ? clamp01(1 - twilightFactor) : 0

  return {
    fogRange: [0.5, 5] as [number, number],
    fogColor: rgbString(fogColor),
    fogHighColor: rgbString(highColor),
    fogSpaceColor: rgbString(spaceColor),
    fogHorizonBlend: horizonBlend,
    starIntensity
  }
}

// ============================================================
// Lighting Calculations
// ============================================================

export const calcAmbientLight = (
  altitude: number,
  arcFactor: number,
  summerFactor: number,
  twilightFactor: number
) => {
  let color: RGB
  let intensity: number

  if (altitude < 0) {
    // Nighttime
    color = smoothColor(
      LIGHTING_KEYS.night.ambient,
      LIGHTING_KEYS.twilight.ambient,
      twilightFactor
    )
    // winter: [0.4]
    // summer: [0.55]
    intensity = 0.4 + summerFactor * 0.15 - (1 - twilightFactor) * 0.3
  } else {
    // Daytime
    color = smoothColor(
      LIGHTING_KEYS.twilight.ambient,
      LIGHTING_KEYS.zenith.ambient,
      arcFactor
    )
    // winter: [0.4 .. 0.2]
    // summer: [0.4 .. 0.35]
    intensity = 0.4 + summerFactor * 0.15 + arcFactor * -0.2
  }

  return {
    ambientColor: rgbString(color),
    ambientIntensity: intensity
  }
}

export const calcDirectionalLight = (
  altitude: number,
  arcFactor: number,
  summerFactor: number,
  twilightFactor: number
) => {
  let color: RGB
  let intensity: number
  let shadowIntensity: number

  if (altitude < 0) {
    // Nighttime
    color = smoothColor(
      LIGHTING_KEYS.night.directional,
      LIGHTING_KEYS.twilight.directional,
      twilightFactor
    )
    // winter: [0.6]
    // summer: [0.6]
    intensity = 0.6
    // winter: [0.01]
    // summer: [0.01 .. 0.1]
    shadowIntensity = 0.01 + summerFactor * 0.09
  } else {
    // Daytime
    color = smoothColor(
      LIGHTING_KEYS.twilight.directional,
      LIGHTING_KEYS.zenith.directional,
      arcFactor
    )
    // winter: [0.6 .. 1.0]
    // summer: [0.6 .. 0.85]
    intensity = 0.6 + arcFactor * (0.4 - summerFactor * 0.15)
    // winter: [0.01 .. 0.61]
    // summer: [0.01 .. 0.76]
    shadowIntensity = 0.6 * arcFactor ** 0.5 + summerFactor * 0.15 + 0.01
  }

  return {
    directionalColor: rgbString(color),
    directionalIntensity: intensity,
    shadowIntensity
  }
}

export const calcLightingProperties = (params: {
  currentTime: number
  sunriseHour: number
  sunsetHour: number
  maxSolarAltitude: number
  currentDate: Date
}) => {
  const {
    currentTime,
    sunriseHour,
    sunsetHour,
    maxSolarAltitude,
    currentDate
  } = params
  const dayProgress = (currentTime - sunriseHour) / (sunsetHour - sunriseHour)
  const { azimuth, altitude } = calcSunPosition(dayProgress, maxSolarAltitude)
  const arcFactor = calcArcFactor(altitude, maxSolarAltitude)
  const summerFactor = calcSummerFactor(currentDate)
  const twilightFactor = calcTwilightFactor(altitude)

  const polarAngle = clamp(90 - altitude, 0, 90)

  const ambientLighting = calcAmbientLight(
    altitude,
    arcFactor,
    summerFactor,
    twilightFactor
  )
  const directionalLighting = calcDirectionalLight(
    altitude,
    arcFactor,
    summerFactor,
    twilightFactor
  )

  const fogProperties = calcFog(altitude, arcFactor, twilightFactor)

  return {
    azimuth,
    altitude,
    polarAngle,
    maxSolarAltitude,
    ...ambientLighting,
    ...directionalLighting,
    ...fogProperties
  }
}

export const calcBuildingWindowActivity = (nightProgress: number) => {
  const { peakLitPercent, peakNightPercent, lightsOutPercent } =
    mapConfig.map3D.windows
  const peak = peakNightPercent / 100
  const visible = (peakLitPercent / 100) * smoothstep(nightProgress / peak)
  const fade = smoothstep((nightProgress - peak) / (1 - peak))
  return { visible, lit: visible * (1 - (lightsOutPercent / 100) * fade) }
}

export const resetMapLighting = (map: mapboxgl.Map | null) => {
  if (!map || !styleReady(map)) return

  setBuildingWindowActivity(map, { visible: 0, lit: 0 })

  map.setLights([
    {
      id: 'ambient-light',
      type: 'ambient',
      properties: { color: 'rgb(255,255,255)', intensity: 0.2 }
    },
    {
      id: 'sun-directional',
      type: 'directional',
      properties: {
        color: 'rgb(255,255,255)',
        intensity: 0.8,
        direction: [180, 15],
        'cast-shadows': false
      }
    }
  ])

  map.setFog(null)
}

export const updateMapLighting = (
  map: mapboxgl.Map | null,
  params: {
    currentDate: Date
    currentTime: number
    sunriseHour: number
    sunsetHour: number
    maxSolarAltitude: number
  }
) => {
  if (!map || !styleReady(map)) return

  const {
    azimuth,
    polarAngle,
    ambientColor,
    ambientIntensity,
    directionalColor,
    directionalIntensity,
    shadowIntensity,
    fogRange,
    fogColor,
    fogHorizonBlend,
    fogHighColor,
    fogSpaceColor,
    starIntensity
  } = calcLightingProperties(params)

  setBuildingWindowActivity(
    map,
    // The moon interval already spans sunset to sunset + 2h in SunriseSlider.
    calcBuildingWindowActivity((params.currentTime - params.sunsetHour) / 2)
  )

  map.setLights([
    {
      id: 'ambient-light',
      type: 'ambient',
      properties: { color: ambientColor, intensity: ambientIntensity }
    },
    {
      id: 'sun-directional',
      type: 'directional',
      properties: {
        color: directionalColor,
        intensity: directionalIntensity,
        direction: [azimuth, polarAngle],
        'shadow-intensity': shadowIntensity,
        'cast-shadows': true
      }
    }
  ])

  // Update fog for atmospheric depth
  if (ENABLE_FOG) {
    map.setFog({
      range: fogRange,
      color: fogColor,
      'high-color': fogHighColor,
      'space-color': fogSpaceColor,
      'horizon-blend': fogHorizonBlend,
      'star-intensity': starIntensity
    })
  }
}
