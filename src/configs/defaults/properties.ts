export const premiumCondoPrice = 950000
export const premiumResidentialPrice = 1125000

export const blurredImageRadius = 20 // px
export const minImagesToShow123Gallery = 6
export const notAvailableString = 'N/A'
export const scrubbedDataString = '!scrubbed!'
export const scrubbedDateString = '1900-06-21T01:39:00.000Z'

export const scrubbedDescriptionLabel =
  'You have to be logged in to see the description.'

export type ListingLastStatus =
  | 'Sus'
  | 'Exp'
  | 'Sld'
  | 'Ter'
  | 'Dft'
  | 'Lsd'
  | 'Sc'
  | 'Sce'
  | 'Lc'
  | 'Pc'
  | 'Ext'
  | 'New'

export const listingLastStatusMapping: Record<ListingLastStatus, string> = {
  Sus: 'Suspended',
  Exp: 'Expired',
  Sld: 'Sold',
  Ter: 'Terminated',
  Dft: 'Deal Fell Through',
  Lsd: 'Leased',
  Sc: 'Sold Conditionally',
  Sce: 'Sold Conditionally with Escape Clause',
  Lc: 'Leased Conditionally',
  Pc: 'Price Change',
  Ext: 'Extension',
  New: 'New'
}
