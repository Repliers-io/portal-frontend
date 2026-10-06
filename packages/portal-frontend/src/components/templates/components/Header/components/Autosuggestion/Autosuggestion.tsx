'use client'

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Autocomplete, Box, Button, Stack } from '@mui/material'

import { SearchIcon } from '@configs/icons'
import mapConfig from '@configs/map'
import routes from '@configs/routes'
import searchConfig from '@configs/search'

import { type ApiListing, type ApiLocation } from 'services/API'
import { type MapboxAddress } from 'services/Map'
import { type TransactionType } from 'services/Search'
import { type MapPosition, useMapOptions } from 'providers/MapOptionsProvider'
import useClientSide from 'hooks/useClientSide'
import useDebouncedEffect from 'hooks/useDebouncedEffect'
import { fitBounds, getCoords, getZoom } from 'utils/map'

import { useOptionClickHandlers } from './hooks/useOptionClickHandlers'
import { AutosuggestInput, AutosuggestOption, OptionGroup } from './components'
import {
  buildAutocompleteOptions,
  fetchAutosuggestions,
  getOptionLabel,
  getQueryCenterRadius,
  removeQueryParam
} from './utils'

const { minCharsToSuggest } = searchConfig
const { mapFlyCurve } = mapConfig

const getOptionKey = (option: any) => {
  const key =
    (option as ApiLocation).locationId || // location
    (option as MapboxAddress).mapbox_id || // address
    (option as ApiListing).mlsNumber || // listing
    'loader'
  return key
}

export const Autosuggestion = ({
  showButton = false,
  buttonTitle = '',
  placeholder,
  startAdornment,
  endAdornment,
  searchIcon,
  searchIconPosition = 'end',
  type
}: {
  showButton?: boolean
  buttonTitle?: string | React.ReactNode
  placeholder?: string
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
  // Clickable magnifying-glass icon for surfaces that show one instead of the button.
  // It triggers the same search action, so off-map it navigates to the map.
  searchIcon?: React.ReactNode
  searchIconPosition?: 'start' | 'end'
  // Set only by the home hero toggle; when absent no `type` is sent, so other surfaces/tenants are unchanged.
  type?: TransactionType
}) => {
  const router = useRouter()
  const clientSide = useClientSide()
  const searchParams = useSearchParams()
  const { mapRef, position: mapPosition } = useMapOptions()

  const paramsQuery = searchParams.get('q') || ''
  const paramsPosition = useMemo(
    () => ({
      center: getCoords(searchParams),
      zoom: getZoom(searchParams),
      bounds: null
    }),
    []
  )
  const buttonFlyPosition = useRef<MapPosition>(paramsPosition)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchString, setSearchString] = useState(paramsQuery)

  const [locations, setLocations] = useState<ApiLocation[]>([])
  const [address, setAddress] = useState<MapboxAddress[]>([])
  const [listings, setListings] = useState<ApiListing[]>([])

  const map = mapRef.current

  // Options for <Autocomplete />
  const options = useMemo(
    () =>
      buildAutocompleteOptions({
        loading,
        locations,
        addresses: address,
        listings
      }),
    [loading, locations, address, listings]
  )

  const {
    locationLoading,
    handleLocationClick,
    handleAddLocationClick,
    handleRemoveLocationClick,
    handleAddressClick,
    handleListingClick
  } = useOptionClickHandlers({
    buttonFlyPosition,
    inputRef,
    setOpen,
    setSearchString,
    type
  })

  const clearOptions = useCallback(() => {
    setOpen(false)
    setAddress([])
    setListings([])
    setLocations([])
    setSearchString('')
    buttonFlyPosition.current = { center: null, bounds: null, zoom: -1 }
    if (map) {
      const strippedUrl = removeQueryParam()
      router.replace(strippedUrl)
    }
  }, [map, router])

  const handleChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (option: any) => {
      if (!option || typeof option === 'string') return

      if (['area', 'city', 'neighborhood'].includes(option.type)) {
        handleLocationClick(option)
      } else if (option.type === 'address') {
        handleAddressClick(option)
      } else if (option.type === 'listing') {
        handleListingClick(option)
      }
    },
    [handleLocationClick, handleAddressClick, handleListingClick]
  )

  const handleInputChange = useCallback(
    (
      _: React.SyntheticEvent<Element, Event>,
      newValue: string,
      reason: string
    ) => {
      if (reason === 'input') {
        setSearchString(newValue)
        setOpen(newValue.length >= minCharsToSuggest)
      } else if (reason === 'clear') {
        clearOptions()
      }
    },
    [clearOptions]
  )

  const handleSearchButtonClick = useCallback(() => {
    const { center, bounds, zoom } = buttonFlyPosition.current
    // Off the map (header, home hero, 404) there is nothing to fly to — go to the map.
    if (bounds && map) {
      fitBounds(map, bounds)
    } else if (center && map) {
      map.flyTo({ center, zoom, ...mapFlyCurve })
    } else {
      router.push(routes.map)
    }
  }, [map, router])

  useDebouncedEffect(
    () => {
      const query = searchString.toLowerCase().split(',')[0].trim()
      // Use proximity search (default center + 5000km)
      // if zoom is too low or position is incomplete
      const { center } = getQueryCenterRadius(mapPosition)

      const fetchData = async () => {
        setLoading(true)
        const result = await fetchAutosuggestions(
          query,
          center,
          undefined,
          type
        )
        setLocations(result.locations)
        setListings(result.listings)
        setAddress(result.addresses)
        setLoading(false)
      }

      if (query.length >= minCharsToSuggest) {
        fetchData()
      } else {
        // Clear results if query is too short
        setAddress([])
        setListings([])
        setLocations([])
      }
    },
    200,
    [searchString, type]
  )

  const searchIconButton = searchIcon ? (
    <Box
      component="button"
      type="button"
      disabled={!clientSide}
      onClick={handleSearchButtonClick}
      sx={{
        p: 0,
        border: 0,
        color: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'pointer',
        background: 'none'
      }}
    >
      {searchIcon}
    </Box>
  ) : null

  const startSlot =
    searchIconButton && searchIconPosition === 'start'
      ? searchIconButton
      : startAdornment
  const endSlot =
    searchIconButton && searchIconPosition === 'end'
      ? searchIconButton
      : endAdornment

  return (
    <Stack
      spacing={0}
      direction="row"
      alignItems="center"
      sx={{ width: '100%', borderRadius: 1 }}
    >
      <Autocomplete
        open={open}
        freeSolo
        fullWidth
        blurOnSelect
        autoHighlight
        selectOnFocus
        clearOnEscape
        disableListWrap
        handleHomeEndKeys
        options={options}
        filterSelectedOptions
        filterOptions={(x) => x}
        disabled={!clientSide}
        groupBy={(option) => (typeof option === 'string' ? '' : option.type)}
        onBlur={() => setOpen(false)}
        onFocus={() => setOpen(searchString.length >= minCharsToSuggest)}
        onChange={(_e, v) => handleChange(v)}
        inputValue={searchString}
        onInputChange={handleInputChange}
        getOptionLabel={getOptionLabel}
        renderInput={(params) => (
          <AutosuggestInput
            params={params}
            inputRef={inputRef}
            loading={locationLoading}
            placeholder={placeholder}
            startAdornment={startSlot}
            endAdornment={endSlot}
          />
        )}
        renderOption={(props, option) => (
          <AutosuggestOption
            key={getOptionKey(option)}
            props={props}
            option={option}
            onAdd={handleAddLocationClick}
            onRemove={handleRemoveLocationClick}
          />
        )}
        renderGroup={({ key, group, children }) => (
          <OptionGroup key={key} group={group}>
            {children}
          </OptionGroup>
        )}
      />

      {showButton && (
        <Button
          variant="contained"
          disabled={!clientSide}
          onClick={handleSearchButtonClick}
          sx={{ minWidth: 56 }}
        >
          {buttonTitle || <SearchIcon color="white" size={18} />}
        </Button>
      )}
    </Stack>
  )
}
