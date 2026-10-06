import { type LngLat } from 'mapbox-gl'
import * as SunCalc from 'suncalc'

import i18nConfig from '@configs/i18n'

/**
 * Get sunrise and sunset times for given location and date
 */
export const getSunTimes = (
  lat: number,
  lng: number,
  date: Date,
  timeZone: string
) => {
  const times = SunCalc.getTimes(date, lat, lng)
  const sunrise = times.sunrise
  const sunset = times.sunset

  const sunriseLocal = new Date(sunrise.toLocaleString('en-US', { timeZone }))
  const sunsetLocal = new Date(sunset.toLocaleString('en-US', { timeZone }))

  const sunriseHour = sunriseLocal.getHours() + sunriseLocal.getMinutes() / 60
  const sunsetHour = sunsetLocal.getHours() + sunsetLocal.getMinutes() / 60

  return { sunriseHour, sunsetHour }
}

/**
 * Get timezone based on coordinates for US/Canada regions
 * Uses longitude to approximate timezone boundaries
 */
export const getTimeZone = (center: LngLat): string => {
  const lng = Number(center.lng)

  // Pacific Time Zone (roughly -125° to -114°)
  if (lng >= -125 && lng < -114) return 'America/Los_Angeles'

  // Mountain Time Zone (roughly -114° to -104°)
  if (lng >= -114 && lng < -104) return 'America/Denver'

  // Central Time Zone (roughly -104° to -87°)
  if (lng >= -104 && lng < -87) return 'America/Chicago'

  // Eastern Time Zone (roughly -87° to -67°)
  if (lng >= -87 && lng < -67) return 'America/New_York'

  // Fallback to config timezone for regions outside US/Canada
  return i18nConfig.timeZone
}
