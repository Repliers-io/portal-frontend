export interface ApiCoords {
  latitude: number
  longitude: number
}

export type ApiCoordsWithZip = ApiCoords & {
  zip?: string
}

export type ApiClass = 'condo' | 'residential' | 'commercial'

export type ApiClassResponse =
  | 'CommercialProperty'
  | 'ResidentialProperty'
  | 'CondoProperty'

export type YesNo = 'Y' | 'N'
