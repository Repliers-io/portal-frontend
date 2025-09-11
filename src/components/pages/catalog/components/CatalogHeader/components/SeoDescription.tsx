import React from 'react'

import { Box, Skeleton, Stack, Typography } from '@mui/material'

import defaultLocation from '@configs/location'

import {
  type ApiBoardArea,
  type ApiBoardCity,
  type ApiNeighborhood
} from 'services/API'
import useClientSide from 'hooks/useClientSide'

import {
  majorCityFactor,
  maxSeoCities,
  maxSeoMajorCities
} from '../../../constants'

import { CatalogLink } from '.'

const Bold = ({ children }: { children: React.ReactNode }) => (
  <Typography
    variant="body2"
    component="span"
    fontWeight={600}
    color="text.default"
  >
    {children}
  </Typography>
)

const Counter = ({ count }: { count: number }) => (
  <Bold>{count.toLocaleString('en-GB')}</Bold>
)

const CommaSeparatedList = ({ items }: { items: React.ReactNode[] }) => (
  <>
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {item}
        {index < items.length - 1 && ', '}
      </React.Fragment>
    ))}
  </>
)

const SeoDescription = ({
  count,
  area,
  city,
  hood,
  location,
  cities,
  hoods,
  areas,
  onLinkFocus,
  onLinkBlur
}: {
  count: number
  area?: string
  city?: string
  hood?: string
  location?: ApiBoardCity | ApiNeighborhood
  cities: ApiBoardCity[]
  hoods: ApiNeighborhood[]
  areas: ApiBoardArea[]
  onLinkFocus?: (item: ApiBoardCity | ApiNeighborhood) => void
  onLinkBlur?: () => void
}) => {
  const clientSide = useClientSide()

  if (!clientSide) return null

  if (!cities.length || !count)
    return (
      <Stack spacing={2} pt={2}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Stack key={index} spacing={0} direction="row" flexWrap="wrap">
            {Array.from({ length: 26 }).map((_, index) => (
              <Skeleton
                key={index}
                variant="text"
                height={20}
                width={Math.random() * 80 + 20}
                sx={{ mr: 1 }}
              />
            ))}
          </Stack>
        ))}
      </Stack>
    )

  // Identify the main city (city with the highest listing count)
  const mainCity = cities[0]

  // Find other major cities with at least 15% of the main city’s listings
  const majorCities = cities
    .filter(
      (city) => city.activeCount >= mainCity.activeCount * majorCityFactor
    )
    .slice(1, maxSeoMajorCities + 1) // max 5 majors

  const MajorCities = majorCities.map((city) => (
    <React.Fragment key={city.name}>
      <CatalogLink city={city} onFocus={onLinkFocus} onBlur={onLinkBlur} /> (
      <Counter count={city.activeCount} /> listings)
    </React.Fragment>
  ))

  const Areas = areas
    // .filter((area) => area.name.toLowerCase() !== mainCity.name)
    .map((area, index) => <CatalogLink area={area} key={index} />)

  const Cities = cities
    .slice(1) // exclude the main city
    .filter((city) => !majorCities.includes(city))
    .slice(0, maxSeoCities)
    .map((city, index) => (
      <Box
        key={index}
        component="span"
        sx={{ opacity: Math.max(1 - index / 50, 0.5) }}
        onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '')}
      >
        <CatalogLink
          city={city}
          variant="secondary"
          onBlur={onLinkBlur}
          onFocus={onLinkFocus}
        />
      </Box>
    ))

  const Hoods =
    city && location
      ? hoods.map((hood, index) => (
          <CatalogLink
            city={location as ApiBoardCity}
            hood={hood}
            key={index}
            onBlur={onLinkBlur}
            onFocus={onLinkFocus}
          />
        ))
      : []

  return (
    <Typography mb={-2} variant="body2" component="div" color="text.hint">
      {!area && !city && (
        <p>
          <Bold>{defaultLocation.state}</Bold> offers an impressive{' '}
          <Counter count={count} /> real estate listings across{' '}
          <Bold>{areas.length} areas</Bold> and{' '}
          <Bold>{cities.length} cities</Bold>, catering to a wide range of
          preferences and lifestyles. Key areas include{' '}
          <CommaSeparatedList items={Areas} />, each contributing to the rich
          variety of real estate opportunities.
        </p>
      )}
      {!city && !area && (
        <>
          <p>
            Among these,{' '}
            <CatalogLink
              city={mainCity}
              onBlur={onLinkBlur}
              onFocus={onLinkFocus}
            />{' '}
            stands out with <Counter count={mainCity.activeCount} /> listings
            {majorCities.length > 1 && (
              <>
                , followed by other prominent cities like{' '}
                <CommaSeparatedList items={MajorCities} />
              </>
            )}
            . Whether you&apos;re seeking a family home, investment property, or
            rental, <Bold>{defaultLocation.state}</Bold> provides diverse
            housing options to meet every need.
          </p>
          <p>
            Other available cities in <Bold>{defaultLocation.state}</Bold>{' '}
            include <CommaSeparatedList items={Cities} />.
          </p>
        </>
      )}
      {!city && area && (
        <p>
          Cities:{' '}
          <CatalogLink
            city={mainCity}
            onBlur={onLinkBlur}
            onFocus={onLinkFocus}
          />{' '}
          (<Counter count={mainCity.activeCount} /> listings),{' '}
          <CommaSeparatedList items={MajorCities} />,{' '}
          <CommaSeparatedList items={Cities} />
        </p>
      )}
      {!hood && hoods.length > 0 && (
        <p>
          Neighborhoods: <CommaSeparatedList items={Hoods} />
        </p>
      )}
    </Typography>
  )
}

export default SeoDescription
