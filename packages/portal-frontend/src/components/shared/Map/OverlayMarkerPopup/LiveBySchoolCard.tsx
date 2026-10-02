import { Box, Chip, Stack, Typography } from '@mui/material'

import { overlayColor } from 'utils/map/overlays'

import { OverlayCard } from './OverlayCard'
import { OverlayLocationButton } from './OverlayLocationButton'
import type { TooltipProps } from './tooltipRegistry'

const accentColor = overlayColor('livebySchool')

// Mapbox serializes feature properties through JSON — booleans become strings.
const asBool = (v: unknown): boolean => v === true || v === 'true'

const boardLabel = (
  schoolType: unknown,
  isCharterSchool: unknown,
  isPrivate: unknown
): string => {
  if (asBool(isCharterSchool)) return 'Charter'
  if (asBool(isPrivate) || schoolType === 'private') return 'Private'
  return 'Public'
}

/**
 * Minimal hover tooltip for a LiveBy school marker. Properties are the GeoJSON
 * feature properties produced by locationsToGeoJson.
 */
export const LiveBySchoolCard = ({ properties }: TooltipProps) => {
  if (!properties) return null

  const {
    schoolName,
    name,
    districtName,
    schoolType,
    schoolLevel,
    lowGrade,
    highGrade,
    isCharterSchool,
    isPrivate
  } = properties as Record<string, unknown>

  const title = (schoolName as string) || (name as string) || ''
  const gradeRange = lowGrade && highGrade ? `${lowGrade}–${highGrade}` : null
  const meta = [schoolLevel, gradeRange].filter(Boolean).join(' · ')
  const board = boardLabel(schoolType, isCharterSchool, isPrivate)

  return (
    <OverlayCard accentColor={accentColor} maxWidth={240}>
      <Stack spacing={1}>
        <Typography
          variant="body2"
          fontWeight={700}
          lineHeight={1.2}
          color="text.primary"
        >
          {title}
        </Typography>
        {meta ? (
          <Typography variant="caption" color="text.secondary">
            {meta}
          </Typography>
        ) : null}
        {districtName ? (
          <Typography variant="caption" color="text.secondary">
            {districtName as string}
          </Typography>
        ) : null}
        <Box>
          <Chip
            label={board}
            size="small"
            sx={{
              bgcolor: accentColor,
              color: '#fff',
              fontSize: 10,
              height: 18
            }}
          />
        </Box>
        <OverlayLocationButton />
      </Stack>
    </OverlayCard>
  )
}
