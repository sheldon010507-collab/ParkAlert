export const WARDEN_TYPES = [
  { value: 'council', label: 'Council Warden' },
  { value: 'private', label: 'Private Parking' },
  { value: 'police', label: 'Police' },
] as const

export const COUNT_OPTIONS = [
  { value: 'one', label: '1 Person' },
  { value: 'two', label: '2 People' },
  { value: 'multiple', label: 'Multiple' },
] as const

export const DIRECTIONS = [
  { value: 'N', label: 'North', icon: '↑' },
  { value: 'NE', label: 'Northeast', icon: '↗' },
  { value: 'E', label: 'East', icon: '→' },
  { value: 'SE', label: 'Southeast', icon: '↘' },
  { value: 'S', label: 'South', icon: '↓' },
  { value: 'SW', label: 'Southwest', icon: '↙' },
  { value: 'W', label: 'West', icon: '←' },
  { value: 'NW', label: 'Northwest', icon: '↖' },
] as const

export const MOVEMENT_TYPES = [
  { value: 'walking', label: 'Walking' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'driving', label: 'Driving' },
] as const

export const ALERT_RADIUS_METERS = 100
export const ALERT_COOLDOWN_MINUTES = 5
