import { useEffect, useMemo, useRef, useState } from 'react'

import { debounce } from '@mui/material/utils'

import { type ApiAddress, APIEstimate } from 'services/API'

import { formatAddress } from './utils'

const useFetchAddresses = (
  inputValue: string,
  currentValue: ApiAddress | null,
  debounceDelay: number = 300
) => {
  const [options, setOptions] = useState<ApiAddress[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const lastQueryRef = useRef<string>('')

  const fetch = useMemo(
    () =>
      debounce((query: string, callback: (results?: ApiAddress[]) => void) => {
        setLoading(true)
        lastQueryRef.current = query
        APIEstimate.fetchAutosuggestions(query)
          .then((res) => callback(res))
          .catch(() => callback([]))
          .finally(() => setLoading(false))
      }, debounceDelay),
    [debounceDelay]
  )

  useEffect(() => {
    if (inputValue.length < 2) return
    // Skip API call if this is the same query as the last one
    if (inputValue === lastQueryRef.current) return
    // Skip API call if the input value matches the formatted current value
    if (inputValue === formatAddress(currentValue)) return

    let active = true

    fetch(inputValue, (results?: ApiAddress[]) => {
      if (active) {
        let newOptions: ApiAddress[] = []

        if (currentValue) newOptions = [currentValue]
        if (results) newOptions = [...results]

        setOptions(newOptions)
      }
    })

    return () => {
      active = false
    }
  }, [inputValue, fetch, currentValue])

  return { options, loading }
}

export default useFetchAddresses
