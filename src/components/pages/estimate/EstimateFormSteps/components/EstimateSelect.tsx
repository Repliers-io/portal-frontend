import React from 'react'

import {
  Box,
  Checkbox,
  CircularProgress,
  FormControl,
  FormHelperText,
  ListItemText,
  MenuItem
} from '@mui/material'

import Select from 'components/atoms/PatchedSelect'
import SelectLabel from 'components/atoms/SelectLabel'

import useBreakpoints from 'hooks/useBreakpoints'
import { capitalize } from 'utils/strings'

// component utils
//
import { renderValue, sanitizeArr, sanitizeString } from './utils'

// component renderers
//
const renderOptionLabel = (item: string | number) => capitalize(String(item))

const renderOptionCheckbox = (item: string, values: string[]) => (
  <>
    <Checkbox
      sx={{ ml: -1, mr: 1, my: -1 }}
      checked={sanitizeArr(values).indexOf(sanitizeString(item)) > -1}
    />
    <ListItemText primary={capitalize(item)} />
  </>
)

interface EstimateSelectProps {
  label?: string
  name: string
  value: string | number | null | undefined
  noEmptyValue?: boolean
  multiple?: boolean
  disabled?: boolean
  loading?: boolean
  items: string[]
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void
  error?: boolean
  helperText?: string
  inputRef?: React.Ref<HTMLInputElement>
  [key: string]: any
}

const EstimateSelect = React.forwardRef<HTMLInputElement, EstimateSelectProps>(
  (
    {
      label,
      name,
      value,
      items = [],
      noEmptyValue = false,
      multiple = false,
      disabled = false,
      loading = false,
      onChange,
      onBlur,
      error,
      helperText,
      inputRef,
      ...props
    },
    ref
  ) => {
    const { mobile } = useBreakpoints()
    // convert incoming value to array if it is not for some reason
    if (multiple && !Array.isArray(value)) {
      // eslint-disable-next-line no-param-reassign
      value = sanitizeArr(String(value).split(','))
    }

    const id = `estimate-${name}`
    const selectValue = multiple ? sanitizeArr(value) : sanitizeString(value)

    return (
      <FormControl id={id} fullWidth error={error}>
        {label && <SelectLabel>{label}</SelectLabel>}
        <Box
          sx={{
            width: '100%',
            position: 'relative',
            // WARN: display: table + tableLayout: fixed
            // guarantees that the select will NOT resize the parent and will not cause overflow
            display: 'table',
            tableLayout: 'fixed'
          }}
        >
          <Select
            fullWidth
            name={name}
            displayEmpty
            multiple={multiple}
            value={selectValue}
            disabled={disabled || loading}
            inputRef={inputRef || ref}
            onChange={onChange}
            onBlur={onBlur}
            renderValue={
              props.renderValue ||
              ((value) => renderValue(value, items, multiple))
            }
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: mobile ? 300 : '60vh'
                }
              }
            }}
            {...props}
          >
            {!multiple && !noEmptyValue && (
              // display first empty option for single selects
              <MenuItem value="" key={-1}>
                &nbsp;
              </MenuItem>
            )}
            {items.map((item: string) => (
              <MenuItem value={sanitizeString(item)} key={item}>
                {props.renderValue
                  ? props.renderValue(item)
                  : multiple
                    ? renderOptionCheckbox(item, value) // value is an array!
                    : renderOptionLabel(item)}
              </MenuItem>
            ))}
          </Select>
          {loading && (
            <Box
              sx={{
                p: 1,
                top: 4,
                right: 8,
                height: 24,
                position: 'absolute',
                bgcolor: 'background.paper'
              }}
            >
              <CircularProgress size={16} sx={{ color: 'grey.300' }} />
            </Box>
          )}
        </Box>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    )
  }
)

EstimateSelect.displayName = 'EstimateSelect'

export default EstimateSelect
