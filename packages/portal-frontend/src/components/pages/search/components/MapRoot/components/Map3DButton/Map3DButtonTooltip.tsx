import React from 'react'
import { useTranslations } from 'next-intl'

import mapConfig from '@configs/map'

import { capitalize } from 'utils/strings'

/**
 * Check if user is on Mac platform
 */
const checkMacPlatform = () => {
  if (typeof window === 'undefined') return false
  return /Mac|iPhone|iPad|iPod/.test(window.navigator.userAgent)
}

/**
 * Get platform-specific modifier key display with symbol and name
 */
const getModifierKeyName = (key: string) => {
  const macPlatform = checkMacPlatform()

  switch (key) {
    case 'altKey':
      return macPlatform ? 'Option' : 'Alt'
    case 'metaKey':
      return macPlatform ? 'Cmd' : 'Win'
    default:
      return capitalize(key.replace('Key', ''))
  }
}

/**
 * Generate enhanced tooltip text for 3D button
 */
export const Map3DButtonTooltip = () => {
  const t = useTranslations()

  const {
    pitchModifier,
    rotationModifier: rotationModifierConfig,
    pitchEnabled,
    rotationEnabled,
    combinedMode
  } = mapConfig.map3D

  const macPlatform = checkMacPlatform()
  const rotationModifier = macPlatform
    ? rotationModifierConfig.mac
    : rotationModifierConfig.win

  const tooltipTitle = t('Map.switchTo3DView')

  if (combinedMode && pitchEnabled && rotationEnabled) {
    // Combined mode: single modifier for both actions
    const modifier = getModifierKeyName(pitchModifier)
    return (
      <div style={{ textAlign: 'center' }}>
        <div>{tooltipTitle}</div>
        <div style={{ fontWeight: 'normal', fontSize: '80%' }}>
          {t('Map.3DViewTiltAndRotateHint', { modifier })}
        </div>
      </div>
    )
  }

  // Separate modifiers mode
  let pitchHint = null
  let rotateHint = null

  if (pitchEnabled) {
    const modifier = getModifierKeyName(pitchModifier)
    pitchHint = (
      <div style={{ fontWeight: 'normal', fontSize: '80%' }}>
        {t('Map.3DViewTiltHint', { modifier })}
      </div>
    )
  }

  if (rotationEnabled) {
    const modifier = getModifierKeyName(rotationModifier)
    rotateHint = (
      <div style={{ fontWeight: 'normal', fontSize: '80%' }}>
        {t('Map.3DViewRotateHint', { modifier })}
      </div>
    )
  }

  return (
    <div>
      <div style={{ textAlign: 'center' }}>{tooltipTitle}</div>
      {rotateHint}
      {pitchHint}
    </div>
  )
}
