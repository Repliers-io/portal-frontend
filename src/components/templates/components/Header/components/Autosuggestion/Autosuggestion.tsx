'use client'

import React, { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import {
  Autocomplete,
  Button,
  CircularProgress,
  Skeleton,
  Stack,
  TextField
} from '@mui/material'
import { type AutocompleteRenderInputParams } from '@mui/material/Autocomplete'

import { defaultAddressZoom, defaultAreaZoom } from '@configs/map'
import { minCharsToSuggest } from '@configs/search'
import IcoSearch from '@icons/IcoSearch'

import { APISearch } from 'services/API'
import {
  type AutosuggestionOption,
  type MapboxAddress,
  type Property
} from 'services/API'
import MapService, { MapSearch } from 'services/Map'
import SearchService from 'services/Search'
import { useLocations } from 'providers/LocationsProvider'
import { type MapPosition } from 'providers/MapOptionsProvider'
import useClientSide from 'hooks/useClientSide'
import useDebouncedEffect from 'hooks/useDebouncedEffect'
import {
  calcBoundsAtZoom,
  calcZoomLevel,
  getCenter,
  getCoords,
  getMapUrl,
  getZoom,
  toMapboxBounds,
  toMapboxPoint
} from 'utils/map'
import { getSeoUrl } from 'utils/properties'

import OptionAddress from './components/OptionAddress'
import OptionArea from './components/OptionArea'
import OptionGroup from './components/OptionGroup'
import OptionListing from './components/OptionListing'
import OptionLoader from './components/OptionLoader'
import {
  getAddressLabel,
  getAreaLabel,
  getListingLabel,
  removeQueryParam,
  updateQueryParam
} from './utils'

const Autosuggestion = ({
  showButton = false,
  buttonTitle = ''
}: {
  showButton?: boolean
  buttonTitle?: string | React.ReactNode
}) => {
  const router = useRouter()
  const t = useTranslations()
  const clientSide = useClientSide()

  const searchParams = useSearchParams()
  const paramsQuery = searchParams.get('q') || ''
  const paramsPosition = useMemo(
    () => ({
      zoom: getZoom(searchParams),
      center: getCoords(searchParams)
    }),
    []
  )
  const [position, setPosition] =
    useState<Omit<MapPosition, 'bounds'>>(paramsPosition)

  const { searchLocations } = useLocations()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [areaLoading, setAreaLoading] = useState(false)
  const [searchString, setSearchString] = useState(paramsQuery)

  const [listings, setListings] = useState<Property[]>([])
  const [address, setAddress] = useState<MapboxAddress[]>([])
  const [locations, setLocations] = useState<AutosuggestionOption[]>([])

  const { map } = MapService

  const handleButtonClick = () => {
    if (map && position.center) {
      map.flyTo({
        center: position.center,
        zoom: position.zoom,
        curve: 1
      })
    }
  }

  useDebouncedEffect(
    () => {
      const query = searchString.toLowerCase().trim()

      const fetchData = async () => {
        setLoading(true)
        try {
          // use the first part of the query and drop the second (if any),
          // because it is (probably) the parent region of the neighborhood or city.
          // TRIE doesn't have them in the index
          const trieQuery = query.split(',').at(0) || ''
          setLocations(await searchLocations(trieQuery))
          const { address, listings } =
            await APISearch.fetchAutosuggestions(query)
          setAddress(address)
          setListings(listings)
        } catch (error) {
          console.error('Failed to fetch autosuggestions:', error)
          // Handle error state here, e.g., show a message to the user
        } finally {
          setLoading(false)
        }
      }

      if (query.length >= minCharsToSuggest) {
        fetchData()
      }
    },
    200,
    [searchString]
  )

  // Options for <Autocomplete />
  const options = []

  // TODO: useEffect
  if (loading) {
    options.push({ type: 'loader' })
  } else {
    locations.forEach((location) => {
      const { source, parent } = location
      options.push({
        type: 'city', // combining both existing types into one, `location.type` not needed,
        source,
        parent
      })
    })
    address.forEach((address) => {
      options.push({
        type: 'address',
        source: address
      })
    })
    listings.forEach((listing) => {
      options.push({
        type: 'listing',
        source: listing
      })
    })
  }

  // TODO: useCallback
  const renderOptionElement = (
    props: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key },
    // TODO: add type for option
    option: any
  ) => {
    const { key, ...otherProps } = props
    switch (option.type) {
      case 'loader':
        return <OptionLoader key="loader" />
      case 'city':
      case 'neighborhood':
        return <OptionArea key={key} props={otherProps} option={option} />
      case 'address':
        return <OptionAddress key={key} props={otherProps} option={option} />
      case 'listing':
        return <OptionListing key={key} props={otherProps} option={option} />
      default:
        return null
    }
  }

  // TODO: useCallback
  const renderInputElement = (params: AutocompleteRenderInputParams) => (
    <TextField
      {...params}
      variant="filled"
      placeholder={t('Search.autosuggestPlaceholder')}
      autoComplete="off"
      slotProps={{
        input: {
          ...params.InputProps,
          endAdornment: areaLoading ? (
            <CircularProgress
              size={18}
              sx={{
                position: 'absolute',
                right: 18
              }}
            />
          ) : (
            params.InputProps.endAdornment
          )
        },

        htmlInput: {
          ...params.inputProps,
          autoComplete: 'off'
        }
      }}
    />
  )

  // TODO: useCallback
  const getOptionLabel = (option: any) => {
    switch (option.type) {
      case 'city':
      case 'neighborhood':
        return getAreaLabel(option)
      case 'address':
        return getAddressLabel(option)
      case 'listing':
        return getListingLabel(option)
      default:
        return ''
    }
  }

  const clearOptions = () => {
    setOpen(false)
    setAddress([])
    setListings([])
    setLocations([])
    setSearchString('')
    setPosition({ center: null, zoom: defaultAddressZoom })
    if (map) {
      const strippedUrl = removeQueryParam()
      router.replace(strippedUrl)
    }
  }

  const handleAddressClick = async (option: any) => {
    setOpen(false)
    setAreaLoading(true)
    const address = option.source as MapboxAddress
    const point = await MapSearch.fetchMapboxAddressPoint(address)
    if (!point) {
      setAreaLoading(false)
      return
    }

    const zoom = defaultAddressZoom
    const center = toMapboxPoint(point)
    const query = getAddressLabel(option)

    if (map) {
      const apiBounds = calcBoundsAtZoom(map, point, zoom)
      const mapboxBounds = toMapboxBounds(apiBounds)

      setSearchString(query)
      setPosition({ zoom, center }) // save last focused result
      map.fitBounds(mapboxBounds)
      const updatedUrl = updateQueryParam(query)
      router.replace(updatedUrl)
    } else {
      const coordsUrl = getMapUrl({ zoom, center, query })
      router.push(coordsUrl)
    }

    setTimeout(() => {
      setAreaLoading(false)
    }, 500)
  }

  const handleAreaClick = async (option: any) => {
    setOpen(false)
    setAreaLoading(true)

    const query = getAreaLabel(option)
    const bounds = await SearchService.fetchBoundsForArea(query)
    if (!bounds) {
      setAreaLoading(false)
      return
    }

    const center = getCenter(bounds)

    if (map) {
      // calculate zoom level based on bounds and current map size
      const zoom = calcZoomLevel(map, bounds)
      const mapboxBounds = toMapboxBounds(bounds)

      setSearchString(query)
      setPosition({ zoom, center }) // save last focused result
      map.fitBounds(mapboxBounds, {
        // NOTE: How did it happen NOBODY (!) read the Mapbox documentation
        // and figure out the native way to add bounds paddings ???
        // padding: { top: 50, bottom: 50, left: 50, right: 50 },
      })
      const updatedUrl = updateQueryParam(query)
      router.replace(updatedUrl)
    } else {
      // no map available, use default area zoom level
      const zoom = defaultAreaZoom
      const coordsUrl = getMapUrl({ zoom, center, query })
      router.push(coordsUrl)
    }

    setTimeout(() => {
      setAreaLoading(false)
    }, 500)
  }

  const handleListingClick = (option: any) => {
    // TODO: show PropertyDrawer instead of redirecting
    router.push(getSeoUrl(option.source as Property))
  }

  const handleChange = (option: any) => {
    if (!option) return

    switch (option.type) {
      case 'city':
      case 'neighborhood':
        handleAreaClick(option)
        break
      case 'address':
        handleAddressClick(option)
        break
      case 'listing':
        handleListingClick(option)
        break
      default:
    }
  }

  if (!clientSide) {
    return <Skeleton variant="rounded" sx={{ height: 48 }} />
  }

  return (
    <Stack spacing={0} direction="row" alignItems="center" width="100%">
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
        groupBy={(option) => option.type}
        onBlur={() => setOpen(false)}
        onFocus={() => setOpen(searchString.length >= minCharsToSuggest)}
        onChange={(e, v) => handleChange(v)}
        inputValue={searchString}
        onInputChange={(_, newValue, reason) => {
          // only update when user types
          if (reason === 'input') {
            setSearchString(newValue)
            setOpen(newValue.length >= minCharsToSuggest)
          } else if (reason === 'clear') {
            clearOptions()
          }
        }}
        getOptionLabel={getOptionLabel}
        renderInput={renderInputElement}
        renderOption={renderOptionElement}
        renderGroup={({ key, group, children }) => (
          <OptionGroup key={key} group={group}>
            {children}
          </OptionGroup>
        )}
      />
      {showButton && (
        <Button
          variant="contained"
          onClick={handleButtonClick}
          sx={{ minWidth: 56 }}
        >
          {buttonTitle || <IcoSearch color="white" size={18} />}
        </Button>
      )}
    </Stack>
  )
}

export default Autosuggestion
