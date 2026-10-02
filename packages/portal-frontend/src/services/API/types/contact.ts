export type ContactScheduleMethod = 'InPerson' | 'LiveVideo'

export interface SignUpRequest {
  fname: string
  lname: string
  email: string
  phone?: string
}

export interface LogInRequest {
  email?: string
  phone?: string
}

export type NeighborhoodsRankingSorting =
  | 'gainHighToLow'
  | 'gainLowToHigh'
  | 'avgHighToLow'
  | 'avgLowToHigh'
