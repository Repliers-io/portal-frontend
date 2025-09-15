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

const config = {
  premiumCondoPrice: 950_000,
  premiumResidentialPrice: 1_125_000,
  blurredImageRadius: 20, // px
  minImagesToShow123Gallery: 6,
  notAvailableString: 'N/A',
  // scrubbed data
  scrubbedDataString: '!scrubbed!',
  scrubbedDateString: '1900-06-21T01:39:00.000Z',
  scrubbedDescriptionLabel: 'You have to be logged in to see the description.',
  // listing status labels
  listingLastStatusMapping: {
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
  } as Record<ListingLastStatus, string>
}

export default config
