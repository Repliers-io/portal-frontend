import { type CountryCode } from 'libphonenumber-js'

import { type Currency } from 'utils/formatters'

const config = {
  dateFormat: 'YYYY-MM-DD',
  dateFormatShort: 'MMM D, YYYY',
  dateFormatMonthYear: 'MMM YYYY',
  timeFormat: 'hh:mm A',
  timeZone: 'America/Toronto',
  phoneNumberLocale: 'CA' as CountryCode,
  measurementSystem: 'imperial' as 'imperial' | 'metric',
  // numbers and currency
  currency: 'USD' as Currency,
  numberFormat: 'en-US',
  fractionDigits: 2
}

export default config
