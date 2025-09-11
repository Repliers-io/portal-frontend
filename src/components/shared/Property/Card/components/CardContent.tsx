import { useTranslations } from 'next-intl'

import { Divider, Stack, Typography } from '@mui/material'

import { type PropertyCardSize } from '@configs/cards-grids'
import IcoBath from '@icons/IcoBath'
import IcoBed from '@icons/IcoBed'
import IcoSquare from '@icons/IcoSquare'

import { ScrubbedPrice, ScrubbedText } from 'components/atoms'

import { type Property } from 'services/API'
import { useUser } from 'providers/UserProvider'
import {
  formatFullAddress,
  getBathrooms,
  getBedrooms,
  getLotSize,
  getSqft,
  land,
  restricted,
  sold
} from 'utils/properties'
import { createPropertyI18nUtils } from 'utils/properties'
import { toRem } from 'utils/theme'

type ContentProps = {
  property: Property
  size: PropertyCardSize
}

const Content = ({ property, size }: ContentProps) => {
  const { logged } = useUser()
  const t = useTranslations()
  const { getDaysSinceListed } = createPropertyI18nUtils(t)

  const { address, listPrice, soldPrice, details } = property

  const beds = getBedrooms(details)
  const baths = getBathrooms(details)
  const sqft = getSqft(property, 'ft²')
  const days = getDaysSinceListed(property)
  const lotSize = getLotSize(property)

  // shorthands
  const sizeMap = size === 'map'
  const sizeDrawer = size === 'drawer'
  const soldProperty = sold(property)
  const contentFontSize = toRem(sizeMap ? 11 : sizeDrawer ? 18 : 14)
  const contentLineHeight = toRem(sizeMap ? 18 : sizeDrawer ? 28 : 20)
  const restrictedProperty = restricted(property) && !logged

  const color = sizeDrawer ? '#FFFFFF' : 'text.primary'
  const secondaryColor = sizeDrawer ? '#FFFFFF' : 'text.medium'
  const titleHeading = sizeDrawer ? 'h2' : 'h6'
  const daysHeading = sizeDrawer ? 'body1' : 'caption'

  return (
    <Stack
      justifyContent="space-between"
      spacing={1}
      sx={{
        pointerEvents: 'none',
        p: sizeMap ? 1 : 2,
        ...(sizeDrawer
          ? {
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              position: 'absolute',
              background:
                'linear-gradient(180deg, #0001 0%, #0001 50%, #000A 100%)'
            }
          : {})
      }}
    >
      <Stack
        spacing={1}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack
          spacing={1}
          width="100%"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            variant={titleHeading}
            color={color}
            sx={{
              textDecoration: soldProperty ? 'line-through' : ''
            }}
          >
            <ScrubbedPrice value={listPrice} />
          </Typography>
          <Typography variant={daysHeading} color={color} noWrap>
            {soldProperty && soldPrice ? (
              <>
                <span>Sold: </span>
                <ScrubbedPrice value={soldPrice} />
              </>
            ) : (
              days.label
            )}
          </Typography>
        </Stack>
      </Stack>
      <Stack spacing={sizeDrawer ? 2 : 1}>
        <Typography
          noWrap={!sizeDrawer}
          color={secondaryColor}
          fontSize={contentFontSize}
          lineHeight={contentLineHeight}
          width={sizeDrawer ? '70%' : 'auto'}
        >
          <ScrubbedText>{formatFullAddress(address)}</ScrubbedText>
        </Typography>
        <Typography
          component="div"
          fontWeight={500}
          color={color}
          fontSize={contentFontSize}
          lineHeight={toRem(sizeMap ? 18 : 20)}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            divider={
              <Divider flexItem variant="middle" orientation="vertical" />
            }
          >
            {restrictedProperty ? (
              <ScrubbedText replace="beds" />
            ) : beds.count ? (
              <>
                <IcoBed size={16} color={color} /> {beds.label}
              </>
            ) : null}

            {restrictedProperty ? (
              <ScrubbedText replace="bath" />
            ) : baths.count ? (
              <>
                <IcoBath size={16} color={color} /> {baths.label}
              </>
            ) : null}

            {restrictedProperty ? (
              <ScrubbedText replace="square ft" />
            ) : sqft.number ? (
              <>
                <IcoSquare size={13} color={color} />{' '}
                <span style={{ whiteSpace: 'nowrap' }}>{sqft.label}</span>
              </>
            ) : null}

            {land(property) &&
              lotSize.number &&
              (restrictedProperty ? (
                <ScrubbedText replace="0,00 acres" />
              ) : (
                <>
                  <IcoSquare size={13} color={color} />{' '}
                  <span style={{ whiteSpace: 'nowrap' }}>{lotSize.label}</span>
                </>
              ))}
          </Stack>
        </Typography>
      </Stack>
    </Stack>
  )
}

export default Content
