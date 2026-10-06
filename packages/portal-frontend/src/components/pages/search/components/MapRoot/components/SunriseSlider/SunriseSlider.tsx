import React, { useEffect, useMemo, useState } from 'react'
import { type LngLat } from 'mapbox-gl'

import { Box, Slider } from '@mui/material'

import mapConfig from '@configs/map'

import { useMapOptions } from 'providers/MapOptionsProvider'

import { SliderThumb } from './components/SliderThumb'
import { clamp01, lerp } from './utils/math'
// import { SUMMER_SOLSTICE, WINTER_SOLSTICE } from './constants'
import {
  calcMaxSolarAltitude,
  calcSunPosition,
  formatTooltip,
  getSkyGradient,
  getSunTimes,
  getTimeZone,
  resetMapLighting,
  updateMapLighting
} from './utils'

const amPmTime = true
const sliderWidth = 182 + 36 // Extra space for thumb
const labelWidth = amPmTime ? 64 : 48

type SunriseSliderProps = {
  currentDate: Date
}

export const SunriseSlider = ({ currentDate }: SunriseSliderProps) => {
  const { shadows, position, mapRef } = useMapOptions()
  const map = mapRef?.current

  const center = (position.center || mapConfig.proximitySearch.center) as LngLat
  const lat = Number(center.lat.toFixed(1))
  const lng = Number(center.lng.toFixed(1))

  // Get timezone based on map center coordinates
  const timeZone = getTimeZone(center)

  const { sunriseHour, sunsetHour, minTime, maxTime } = useMemo(() => {
    const times = getSunTimes(lat, lng, currentDate, timeZone)
    return {
      ...times,
      minTime: times.sunriseHour,
      maxTime: times.sunsetHour + 2
    }
  }, [lat, lng, currentDate, timeZone])

  const initialValue = (() => {
    const targetHour = 12.0 // Noon
    const t = (targetHour - minTime) / (maxTime - minTime)
    return clamp01(t) * 100
  })()

  const [value, setValue] = useState(initialValue)
  const currentTime = lerp(minTime, maxTime, value / 100)

  const maxSolarAltitude = useMemo(
    () => calcMaxSolarAltitude(lat, currentDate),
    [lat, currentDate]
  )

  const solarAltitude = useMemo(() => {
    const dayProgress = (currentTime - sunriseHour) / (sunsetHour - sunriseHour)
    const { altitude } = calcSunPosition(dayProgress, maxSolarAltitude)
    return altitude
  }, [currentTime, sunriseHour, sunsetHour, maxSolarAltitude])

  const handleChange = (_event: Event, newValue: number | number[]) => {
    const newVal = newValue as number
    setValue(newVal)
  }

  const lightingParams = useMemo(
    () => ({
      sunsetHour,
      sunriseHour,
      currentTime,
      currentDate,
      maxSolarAltitude
    }),
    [sunsetHour, sunriseHour, currentTime, currentDate, maxSolarAltitude]
  )

  // Update map lighting based on current time
  useEffect(() => {
    if (!map) return
    const applyLighting = () => {
      if (!shadows) {
        resetMapLighting(map)
      } else {
        updateMapLighting(map, lightingParams)
      }
    }
    applyLighting()
    map.on('style.load', applyLighting)
    return () => {
      map.off('style.load', applyLighting)
    }
  }, [map, shadows, lightingParams])

  return (
    <Box
      sx={{
        p: 0.75,
        px: 2,
        height: 36,
        width: sliderWidth,
        boxShadow: 1,
        color: '#333',
        display: 'flex',
        borderRadius: 5,
        fontWeight: 'bold',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        opacity: shadows ? 1 : 0,
        transition: 'opacity 0.15s linear',
        pointerEvents: shadows ? 'auto' : 'none',
        background: getSkyGradient(6, 22),
        border: 2,
        borderColor: '#FFFC'
      }}
    >
      <Slider
        slots={{ thumb: SliderThumb }}
        slotProps={{
          thumb: {
            sliderValue: value,
            solarAltitude,
            maxSolarAltitude
          } as React.HTMLAttributes<HTMLSpanElement>
        }}
        value={value}
        onChange={handleChange}
        min={0}
        max={100}
        step={0.1}
        valueLabelDisplay="auto"
        valueLabelFormat={() =>
          currentTime !== null ? formatTooltip(currentTime, amPmTime) : ''
        }
        sx={{
          width: '100%',

          '& .MuiSlider-thumb': {
            p: 0,
            ml: -2,
            mt: -1.75,
            width: 32,
            height: 32,
            padding: 0,
            borderRadius: '50%',
            position: 'absolute',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            '&:hover, &.Mui-active': {
              bgcolor: '#FFF6'
            }
          },

          '& .MuiSlider-valueLabel': {
            px: 0,
            py: 0.5,
            fontSize: 12,
            borderRadius: 1,
            color: '#FFF',
            bgcolor: '#000',
            fontWeight: 'bold',
            textAlign: 'center',
            minWidth: labelWidth
          },

          '& .MuiSlider-track': {
            display: 'none'
          },
          '& .MuiSlider-rail': {
            display: 'none'
          }
        }}
      />
    </Box>
  )
}
