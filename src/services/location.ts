import * as Location from 'expo-location'
import { DEFAULT_LOCATION } from '../constants'

export interface LocationResult {
  latitude: number
  longitude: number
}

export interface LocationError {
  code: 'permission_denied' | 'unavailable' | 'timeout'
  message: string
}

export async function requestLocationPermission(): Promise<{ granted: boolean; error?: LocationError }> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync()
    return { granted: status === 'granted' }
  } catch (e) {
    return { granted: false, error: { code: 'unavailable', message: 'Failed to request permission' } }
  }
}

export async function getCurrentLocation(): Promise<{ location: LocationResult | null; error?: LocationError }> {
  const permissionResult = await requestLocationPermission()
  if (!permissionResult.granted) {
    return { location: null, error: { code: 'permission_denied', message: 'Location permission denied' } }
  }

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeout: 10000,
    })

    return {
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    }
  } catch (e) {
    return { location: null, error: { code: 'unavailable', message: 'Failed to get location' } }
  }
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3
  const phi1 = (lat1 * Math.PI) / 180
  const phi2 = (lat2 * Math.PI) / 180
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export { DEFAULT_LOCATION }
