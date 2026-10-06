import React from 'react'

import { StreetView } from '../index'

import type { RenderStreetViewProps } from './HomeView'

const DefaultStreetView = ({ estimateData }: RenderStreetViewProps) => {
  return <StreetView estimateData={estimateData} />
}

export default DefaultStreetView
