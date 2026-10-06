'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
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

import locationConfig from '@configs/location'
import { joiResolver } from '@hookform/resolvers/joi'

import { SelectLabel } from 'components/atoms'

import {
  type ApiSavedSearch,
  type ApiSavedSearchUpdateRequest
} from 'services/API'
import {
  type MapPosition,
  useMapLocations,
  useMapOptions
} from 'providers/MapOptionsProvider'
import {
  getAreaName,
  notifications,
  useSaveSearch
} from 'providers/SaveSearchProvider'
import { useSearch } from 'providers/SearchProvider'
import { formatRadius } from 'utils/formatters'
import {
  getPositionBounds,
  getPositionRadius,
  getReverseGeocodingUrl
} from 'utils/map'
import { formatUnionKey } from 'utils/strings'

import schema, { searchNameMaxLength } from './schema'

const truncateSearchName = (name: string) =>
  name.length > searchNameMaxLength
    ? name.slice(0, searchNameMaxLength - 3) + '...'
    : name

export const SaveSearchForm = ({
  onSubmit,
  onCancel
}: {
  onSubmit?: () => void
  onCancel?: () => void
}) => {
  const { editId, list, processing, createSearch, editSearch } = useSaveSearch()
  const { filters, polygon, region } = useSearch()
  const { locations } = useMapLocations()
  const { position } = useMapOptions()
  const { bounds } = position
  const t = useTranslations()

  const [loadingArea, setLoadingArea] = useState(false)

  // NOTE: data object is used as a flag of edit mode
  const data = list.find((item) => item.searchId === editId)
  const [searchName, setSearchName] = useState<string>(
    t('Dialogs.SaveSearch.loadingName')
  )

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<Partial<ApiSavedSearch>>({
    mode: 'onBlur',
    resolver: joiResolver(schema),
    values: {
      name: data?.name || searchName,
      notificationFrequency: data?.notificationFrequency || 'instant'
    }
  })

  const onFormSubmit: SubmitHandler<Partial<ApiSavedSearch>> = async (data) => {
    const { name, notificationFrequency } = data
    if (editId) {
      await editSearch(editId, {
        name,
        searchId: editId,
        notificationFrequency
      } as ApiSavedSearchUpdateRequest)
    } else {
      // Region source priority mirrors prepareParams: selected locations >
      // drawn polygon > loaded saved-search region > viewport bounds.
      await createSearch({
        name,
        filters,
        locations,
        ...(polygon ? { polygon } : region?.length ? { region } : { bounds }),
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
      const response = await fetch(getReverseGeocodingUrl(center))
      const data = await response.json()

      const area = getAreaName(data.features, zoom)
      if (area) {
        const radiusKm = getPositionRadius(position)
        const radius = formatRadius(radiusKm)

        setSearchName(
          truncateSearchName(
            t('Dialogs.SaveSearch.nameWithinArea', { radius, area })
          )
        )
      }
    } catch {
      setSearchName(
        truncateSearchName(
          t('Dialogs.SaveSearch.nameInState', { state: locationConfig.state })
        )
      )
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
            {t('Dialogs.SaveSearch.description')}
          </Typography>
          <Stack spacing={2} width="100%">
            <Box>
              <SelectLabel>{t('Forms.nameLabel')}</SelectLabel>
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
              <SelectLabel>
                {t('Dialogs.SaveSearch.notificationFrequency')}
              </SelectLabel>
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
            {t('Dialogs.Common.save')}
          </Button>
          <Button
            size="large"
            variant="outlined"
            onClick={onCancel}
            disabled={processing}
            sx={{ flex: 1, minWidth: 124 }}
          >
            {t('Dialogs.Common.cancel')}
          </Button>
        </Stack>
      </DialogActions>
    </>
  )
}
