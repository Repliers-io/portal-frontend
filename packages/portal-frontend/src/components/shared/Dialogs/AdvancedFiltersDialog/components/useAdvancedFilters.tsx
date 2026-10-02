import { isValidElement, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { Box, Divider, Stack } from '@mui/material'

import features from '@configs/features'
import filtersConfig from '@configs/filters'
import { type AdvancedFilterSlot } from '@defaults/filters'

import { type Filters } from 'services/Search'

import { useAdvancedFilterSlots } from './useAdvancedFilterSlots'
import {
  ActiveRangeSelect,
  CancelledRangeFilter,
  DaysSelect,
  FilterButtonGroup,
  LotFrontageFilter,
  LotSizeFilter,
  MaintenanceFeeFilter,
  OpenHouseFilter,
  OpenHouseSwitch,
  PricePicker,
  PropertySizeFilter,
  SearchFilter,
  SoldRangeSelect,
  StyleFilter,
  UnknownFilters,
  YearBuiltSelect
} from '.'

export const useAdvancedFilters = ({
  dialogState,
  priceBuckets,
  onChange,
  onSubmit
}: {
  dialogState: Filters
  priceBuckets: Record<string, number>
  onChange: (mutation: Partial<Filters>) => void
  onSubmit: () => void
}): ReactNode[] => {
  const t = useTranslations('MapFilters')

  const bedsItems: [string, number][] = [
    [t('any'), 0],
    [t('studio'), -1],
    ['1+', 1],
    ['2+', 2],
    ['3+', 3],
    ['4+', 4]
  ]

  const {
    minPrice,
    maxPrice,
    minBaths,
    minBedrooms,
    minGarageSpaces,
    minParkingSpaces,
    listingStatus,
    listingType,
    soldWithin,
    daysOnMarket,
    minYearBuilt,
    maxYearBuilt,
    maxMaintenanceFee,
    minLotSizeSqft,
    maxLotSizeSqft,
    minLotWidth,
    maxLotWidth,
    minSqft,
    maxSqft,
    search,
    openHouse,
    style,
    basement,
    cancelledRange,
    activeRange,
    soldRange,
    type
  } = dialogState

  const types = [listingType].flat()
  const condoCapable = types.includes('allListings') || types.includes('condo')
  const condoOnly = types.length > 0 && types.every((t) => t === 'condo')

  const handlePriceChange = ([minPrice, maxPrice]: number[]) => {
    onChange({ minPrice, maxPrice })
  }

  const slotComponents: Partial<Record<AdvancedFilterSlot, ReactNode>> = {
    minBedrooms: (
      <FilterButtonGroup
        label={t('beds')}
        name="minBedrooms"
        value={minBedrooms || 0}
        items={bedsItems}
        onChange={onChange}
      />
    ),
    minBaths: (
      <FilterButtonGroup
        label={t('baths')}
        name="minBaths"
        value={minBaths || 0}
        onChange={onChange}
      />
    ),
    minGarageSpaces: (
      <FilterButtonGroup
        label={t('garage')}
        name="minGarageSpaces"
        value={minGarageSpaces || 0}
        onChange={onChange}
      />
    ),
    minParkingSpaces: (
      <FilterButtonGroup
        label={t('parking')}
        name="minParkingSpaces"
        value={minParkingSpaces || 0}
        onChange={onChange}
      />
    ),
    price: (
      <PricePicker
        variant="bars"
        label={t('price')}
        buckets={priceBuckets}
        values={[minPrice || 0, maxPrice || 0]}
        onChange={handlePriceChange}
      />
    ),
    daysOnMarket: (
      <DaysSelect
        status={Array.isArray(listingStatus) ? listingStatus[0] : listingStatus}
        soldValue={soldWithin}
        daysValue={daysOnMarket}
        onChange={onChange}
      />
    ),
    yearBuilt: (
      <YearBuiltSelect
        from={minYearBuilt}
        to={maxYearBuilt}
        onChange={onChange}
      />
    ),
    maintenanceFee: (
      <MaintenanceFeeFilter
        to={maxMaintenanceFee}
        disabled={!condoCapable}
        onChange={onChange}
      />
    ),
    lotSize: (
      <LotSizeFilter
        from={minLotSizeSqft}
        to={maxLotSizeSqft}
        disabled={condoOnly}
        onChange={onChange}
      />
    ),
    lotFrontage: (
      <LotFrontageFilter
        from={minLotWidth}
        to={maxLotWidth}
        disabled={condoOnly}
        onChange={onChange}
      />
    ),
    propertySize: (
      <PropertySizeFilter from={minSqft} to={maxSqft} onChange={onChange} />
    ),
    search: (
      <SearchFilter value={search} onChange={onChange} onSubmit={onSubmit} />
    ),
    openHouse: features.openHouse ? (
      <OpenHouseSwitch value={openHouse} onChange={onChange} />
    ) : null,
    openHouseDate: features.openHouse ? (
      <OpenHouseFilter value={openHouse} onChange={onChange} />
    ) : null,
    styleHome: (
      <StyleFilter
        value={style}
        field="style"
        label={t('style')}
        listingType={listingType}
        options={filtersConfig.styleOptions}
        onChange={onChange}
      />
    ),
    basementHome: (
      <StyleFilter
        value={basement}
        field="basement"
        label={t('basement')}
        options={filtersConfig.basementOptions}
        onChange={onChange}
      />
    ),
    cancelledRange: (
      <CancelledRangeFilter value={cancelledRange} onChange={onChange} />
    ),
    activeRange: (
      <Stack direction="row" spacing={{ xs: 2, sm: 4 }}>
        <ActiveRangeSelect value={activeRange} onChange={onChange} />
        <Box flex={1} />
      </Stack>
    ),
    soldRange: (
      <Stack direction="row" spacing={{ xs: 2, sm: 4 }}>
        <SoldRangeSelect
          value={soldRange}
          label={t(type === 'lease' ? 'leased' : 'sold')}
          onChange={onChange}
        />
        <Box flex={1} />
      </Stack>
    ),
    // The pair is exclusive — whichever is set locks the other. One still
    // holding a value stays open so it can be cleared, so a draft carrying both
    // never locks them together. The standalone slots above render one of the
    // pair alone, where there is no counterpart on screen to release the lock.
    activeAndSoldRange: (
      <Stack direction="row" spacing={{ xs: 2, sm: 4 }}>
        <ActiveRangeSelect
          value={activeRange}
          disabled={Boolean(soldRange) && !activeRange}
          onChange={onChange}
        />
        <SoldRangeSelect
          value={soldRange}
          label={t(type === 'lease' ? 'leased' : 'sold')}
          disabled={Boolean(activeRange) && !soldRange}
          onChange={onChange}
        />
      </Stack>
    ),
    '-': <Divider />
  }

  const slots = useAdvancedFilterSlots()

  const nodes = slots
    .map((slot) => slotComponents[slot] ?? null)
    .filter(Boolean) as ReactNode[]

  const divider = (node: ReactNode) =>
    isValidElement(node) && node.type === Divider
  while (nodes.length > 0 && divider(nodes[0])) nodes.shift()
  while (nodes.length > 0 && divider(nodes[nodes.length - 1])) nodes.pop()

  // Filters with no slot in this tenant are listed above the first slot,
  // where they stay visible and removable.
  nodes.unshift(
    <UnknownFilters
      key="unknown"
      dialogState={dialogState}
      onChange={onChange}
    />
  )

  return nodes
}
