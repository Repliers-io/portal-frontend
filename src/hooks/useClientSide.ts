import { useEffect, useState } from 'react'

const useClientSide = () => {
  const [clientSide, setClientSide] = useState(false)
  useEffect(() => {
    setClientSide(true)
  }, [])
  return clientSide
}

export default useClientSide
