import { type Property } from 'services/API'

export const property1 = {
  address: {
    unitNumber: 'PH3',
    streetNumber: '135',
    streetName: 'LOWER BARRETTE',
    streetSuffix: 'Way',
    streetDirection: 'East',
    city: 'Ottawa',
    zip: 'K1L 7Z9'
  },
  mlsNumber: '12345',
  boardId: '12'
} as unknown as Property

export const property2 = {
  address: {
    streetNumber: '135',
    streetName: 'LOWER BARRETTE',
    streetSuffix: 'Way',
    city: 'OtTawA',
    zip: 'k1l 7z9'
  },
  mlsNumber: '12346',
  boardId: '13'
} as unknown as Property

export const property3 = {
  address: {
    streetNumber: '13/5',
    streetName: "D'ARTAGNAN`",
    streetSuffix: 'Bay',
    city: ' OTTAWA  ',
    zip: '     '
  },
  mlsNumber: '12346',
  startImage: 1
} as unknown as Property

export const property4 = {
  address: {},
  mlsNumber: '12347',
  boardId: '14'
} as unknown as Property

export const property5 = {
  address: {
    streetNumber: '!scrubbed!',
    streetName: "O'Reilly",
    city: '!scrubbed!',
    zip: '!scrubbed!'
  },
  mlsNumber: '12346'
} as unknown as Property
