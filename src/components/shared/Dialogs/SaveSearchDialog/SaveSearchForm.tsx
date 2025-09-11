'use client'

import { useEffect, useState } from 'react'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'

import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material'

import { measurementSystem } from '@configs/i18n'
import defaultLocation from '@configs/location'
import { mapboxToken } from '@configs/map'
import { joiResolver } from '@hookform/resolvers/joi'

import { SelectLabel } from 'components/atoms'

import { type ApiSavedSearchUpdateRequest } from 'services/API'
import { type MapPosition, useMapOptions } from 'providers/MapOptionsProvider'
import {
  getAreaName,
  getRadiusDecimal,
  getRadiusImperial,
  type NotificationFrequency,
  notifications,
  useSaveSearch
} from 'providers/SaveSearchProvider'
import { useSearch } from 'providers/SearchProvider'
import { getPositionBounds } from 'utils/map'
import { formatUnionKey } from 'utils/strings'

import schema from './schema'

type ApiSaveSearch = {
  name: string
  searchId?: number
  clientId?: number
  notificationFrequency: NotificationFrequency
}

const SaveSearchForm = ({
  onSubmit,
  onCancel
}: {
  onSubmit?: () => void
  onCancel?: () => void
}) => {
  const { editId, list, processing, createSearch, editSearch } = useSaveSearch()
  const { filters, polygon } = useSearch()
  const { position } = useMapOptions()
  const { bounds } = position

  const [loadingArea, setLoadingArea] = useState(false)

  // NOTE: data object is used as a flag of edit mode
  const data = list.find((item) => item.searchId === editId)
  const [searchName, setSearchName] = useState<string>('Loading...')

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<Partial<ApiSaveSearch>>({
    mode: 'onBlur',
    resolver: joiResolver(schema),
    values: {
      name: data?.name || searchName,
      notificationFrequency: data?.notificationFrequency || 'instant'
    }
  })

  const onFormSubmit: SubmitHandler<Partial<ApiSaveSearch>> = async (data) => {
    const { name, notificationFrequency } = data
    if (editId) {
      await editSearch(editId, {
        name,
        searchId: editId,
        notificationFrequency
      } as ApiSavedSearchUpdateRequest)
    } else {
      await createSearch({
        name,
        filters,
        ...(polygon ? { polygon } : { bounds }),
        notificationFrequency
      })
    }
    onSubmit?.()
  }

  const fetchAreaName = async (position: MapPosition) => {
    const { center, zoom } = position
    if (!center) return

    try {
      setLoadingArea(true)
      const response = await fetch(
        'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
          `${center.lng},${center.lat}.json?access_token=${mapboxToken}`
      )
      const data = await response.json()

      const area = getAreaName(data.features, zoom)
      if (area) {
        const radius =
          measurementSystem === 'metric'
            ? getRadiusDecimal(position)
            : getRadiusImperial(position)

        setSearchName(`Listings within ${radius} of ${area}`)
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setSearchName(`Listings in ${defaultLocation.state}`)
    } finally {
      setLoadingArea(false)
    }
  }

  useEffect(() => {
    if (!editId) {
      if (polygon) {
        const polygonBounds = getPositionBounds(polygon)
        const polygonPosition: MapPosition = {
          center: polygonBounds.getCenter(),
          bounds: polygonBounds,
          zoom: position.zoom
        }
        fetchAreaName(polygonPosition)
      } else {
        fetchAreaName(position)
      }
    }
  }, [])

  return (
    <>
      <DialogContent>
        <Stack spacing={2} width="100%" sx={{ pb: 1 }}>
          <Typography align="center">
            Save your search and get notifications about new properties that
            match your search criteria.
          </Typography>
          <Stack spacing={2} width="100%">
            <Box>
              <SelectLabel>Name</SelectLabel>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    variant="filled"
                    disabled={processing || loadingArea}
                    slotProps={{
                      input: {
                        startAdornment: loadingArea ? (
                          <InputAdornment position="start">
                            <CircularProgress size={16} />
                          </InputAdornment>
                        ) : null
                      }
                    }}
                    {...field}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Box>
            <Box>
              <SelectLabel>Notification Frequency</SelectLabel>
              <Controller
                name="notificationFrequency"
                control={control}
                render={({ field }) => (
                  <ToggleButtonGroup
                    exclusive
                    fullWidth
                    {...field}
                    sx={{
                      ...(processing && {
                        opacity: 0.6,
                        pointerEvents: 'none'
                      }),
                      '& .MuiToggleButton-root': {
                        fontWeight: 400
                      }
                    }}
                  >
                    {notifications.map((item) => (
                      <ToggleButton key={item} value={item}>
                        {formatUnionKey(item)}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                )}
              />
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            size="large"
            variant="contained"
            loading={processing}
            disabled={processing || loadingArea}
            onClick={handleSubmit(onFormSubmit)}
            sx={{ flex: 1, minWidth: 124 }}
          >
            Save
          </Button>
          <Button
            size="large"
            variant="outlined"
            onClick={onCancel}
            disabled={processing}
            sx={{ flex: 1, minWidth: 124 }}
          >
            Cancel
          </Button>
        </Stack>
      </DialogActions>
    </>
  )
}

export default SaveSearchForm
