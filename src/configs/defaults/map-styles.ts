const mapStyles = {
  map: 'streets-v12',
  hybrid: 'satellite-streets-v12',
  satellite: 'satellite-v9'
}

export type MapStyle = keyof typeof mapStyles

export default mapStyles
