import { scrubbedDataString } from '@configs/properties'

import { type ApiRooms, type Property } from 'services/API'
import { formatImperialDistance } from 'utils/formatters'
import { capitalize, joinNonEmpty } from 'utils/strings'

import { type DetailsGroupType, type DetailsItemType } from '../../types'
import { filterEmptyGroups } from '../../utils'

const orderFloor = {
  Main: 0,
  '2nd': 1,
  '3rd': 2,
  '4th': 3,
  Ground: 1,
  Second: 2,
  Third: 3,
  Upper: 50,
  Bsmt: 99,
  Basement: 99
}

const orderFloorLabel: Record<string, string> = {
  Main: 'Main Floor',
  '2nd': '2nd Floor',
  '3rd': '3rd Floor',
  Bsmt: 'Basement',
  Ground: 'Ground Floor',
  Lower: 'Lower Floor',
  Upper: 'Upper Floor'
}

const roomLabels: Record<string, string> = {
  Rm: 'Room',
  Br: 'Bedroom',
  Bdrm: 'Bedroom',
  Prim: 'Primary',
  Rec: 'Recreational',
  'Media/Ent': 'Media/Entertainment'
}

const transformRoomLabels = (name: string) => {
  return name
    .split(' ')
    .map((word) => roomLabels[word] || word)
    .join(' ')
}

const transformRoomsByFloors = (property: Property) => {
  const floors: Record<string, Record<string, ApiRooms>> = {}

  if (Object.hasOwn(property, 'rooms')) {
    Object.values(property.rooms).forEach((room) => {
      if (!floors[room.level]) floors[room.level] = {}

      let counter = 2
      let description = capitalize(room.description)

      // generate keys with suffixes for rooms with the same description,
      // for example, 'Bedroom', 'Bedroom (2)', 'Bedroom (3)'
      while (floors[room.level][description]) {
        if (room.description === scrubbedDataString) {
          // add invisible space to avoid duplicates
          description = room.description + ' '.repeat(counter++)
        } else {
          description = `${capitalize(room.description)} (${counter++})`
        }
      }

      floors[room.level][description] = room
    })
  }

  return floors
}

const transformFloorsByOrderAndLabel = (
  floors: Record<string, Record<string, ApiRooms>>
) => {
  return Object.entries(floors)
    .filter(([floor]) => floor !== 'null')
    .sort((a, b) => {
      const room1Name = a[0] as keyof typeof orderFloor
      const room2Name = b[0] as keyof typeof orderFloor

      if (orderFloor[room1Name] && orderFloor[room2Name]) {
        return orderFloor[room1Name] - orderFloor[room2Name]
      }

      return 0
    })
    .map(([floor, rooms]) => [orderFloorLabel[floor] || floor, rooms])
}

const roomsResolver = (property: Property) => {
  const floors = transformRoomsByFloors(property)
  const formatedFloors = transformFloorsByOrderAndLabel(floors)

  return filterEmptyGroups(
    formatedFloors.map(([floor, rooms]) => {
      return {
        title: floor,
        items: Object.entries(rooms).map((item) => {
          const [label, room] = item

          const roomNullsToScrubs = [room.width, room.length]
            .map((v) => (v === 'null' ? scrubbedDataString : v))
            .map(formatImperialDistance)

          return {
            label: transformRoomLabels(label),
            value: joinNonEmpty(roomNullsToScrubs, ' × ')
          } as DetailsItemType
        })
      } as DetailsGroupType
    })
  )
}

export default roomsResolver
