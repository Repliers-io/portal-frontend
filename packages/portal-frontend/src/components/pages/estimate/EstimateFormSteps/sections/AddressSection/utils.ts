import { type ApiAddress } from 'services/API'
import { joinNonEmpty } from 'utils/strings'

export const formatAddress = (option: ApiAddress | null) => {
  const optionLabel = joinNonEmpty([option?.address, option?.city], ', ')
  return optionLabel
}
