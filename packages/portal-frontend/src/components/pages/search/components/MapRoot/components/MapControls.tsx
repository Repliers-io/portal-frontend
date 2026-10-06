import features from '@configs/features'
import { FenceIcon, HolidayVillageIcon } from '@configs/icons'
import mapConfig from '@configs/map'
import {
  MapControlsStack,
  MapLocateButton,
  MapNavigation,
  MapStyleSwitch
} from '@shared/Map'

import { parcelsOverlayId } from 'utils/map/parcelLayers'

import {
  Map3DButton,
  MapCompassButton,
  MapDrawButton,
  MapLayersMenu,
  OverlayToggleButton,
  ShadowsButton
} from '.'

// The neighborhoods overlay differs per tenant (LiveBy polygons vs MLS centroids),
// so resolve it by location type rather than a fixed id.
const neighborhoodOverlay = mapConfig.overlays.layers.find((l) =>
  l.locationTypes?.includes('neighborhood')
)

// The "locate me" control sits alone in the top-right corner.
export const MapControls = () => (
  <>
    <MapControlsStack>
      <MapCompassButton />
      <ShadowsButton />
      <Map3DButton desktopOnly={false} />
      {features.saveSearch && <MapDrawButton />}
      {features.saveSearch && (
        <MapDrawButton mode="freehand" desktopOnly={false} />
      )}
      <OverlayToggleButton overlayId={parcelsOverlayId} icon={FenceIcon} />
      {neighborhoodOverlay && (
        <OverlayToggleButton
          overlayId={neighborhoodOverlay.id}
          icon={HolidayVillageIcon}
        />
      )}
      <MapLayersMenu />
      <MapNavigation />
      <MapStyleSwitch />
    </MapControlsStack>

    <MapControlsStack position="top-right" mobilePosition="top-right">
      <MapLocateButton />
    </MapControlsStack>
  </>
)
