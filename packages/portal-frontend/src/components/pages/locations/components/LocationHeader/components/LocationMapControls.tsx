import { MapControlsStack, MapNavigation, MapStyleSwitch } from '@shared/Map'

export const LocationMapControls = () => (
  <MapControlsStack>
    <MapNavigation />
    <MapStyleSwitch />
  </MapControlsStack>
)
