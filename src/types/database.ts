export type WardenType = 'council' | 'private' | 'police'
export type CountType = 'one' | 'two' | 'multiple'
export type DirectionType = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'
export type MovementType = 'walking' | 'cycling' | 'driving'

export interface Profile {
  id: string
  username: string | null
  reputation: number
  created_at: string
}

export interface WardenSighting {
  id: string
  user_id: string
  lat: number
  lng: number
  warden_type: WardenType
  count: CountType
  direction: DirectionType
  movement: MovementType
  expires_at: string
  created_at: string
}

export interface ParkedCar {
  id: string
  user_id: string
  lat: number
  lng: number
  radius_m: number
  created_at: string
}

export const MOVEMENT_EXPIRY_MINUTES: Record<MovementType, number> = {
  walking: 20,
  cycling: 15,
  driving: 10,
}
