import { useState, useEffect, useCallback, useRef } from 'react'
import { WardenSighting } from '../types/database'
import { getParkedCar } from '../services/warden'
import { calculateDistance } from '../services/location'
import { useAuth } from '../contexts/AuthContext'
import { ALERT_RADIUS_METERS, ALERT_COOLDOWN_MINUTES } from '../constants'

interface AlertState {
  sighting: WardenSighting
  distance: number
  timestamp: number
}

interface UseAlertsOptions {
  parkedCar?: { lat: number; lng: number } | null
}

export function useAlerts(sightings: WardenSighting[], options?: UseAlertsOptions) {
  const { session } = useAuth()
  const [activeAlert, setActiveAlert] = useState<AlertState | null>(null)
  const [internalParkedCar, setInternalParkedCar] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const lastAlertTimes = useRef<Map<string, number>>(new Map())

  // Use external parkedCar if provided, otherwise fetch internally
  const parkedCarLocation = options?.parkedCar ?? internalParkedCar

  useEffect(() => {
    // Only fetch internally if external parkedCar is not provided
    if (options?.parkedCar === undefined && session?.user?.id) {
      getParkedCar(session.user.id).then((car) => {
        if (car) {
          setInternalParkedCar({ lat: car.lat, lng: car.lng })
        } else {
          setInternalParkedCar(null)
        }
      })
    }
  }, [session?.user?.id, options?.parkedCar])

  const checkAlerts = useCallback(() => {
    console.log('=== CHECK ALERTS ===')
    console.log('parkedCarLocation:', parkedCarLocation)
    console.log('sightings count:', sightings.length)
    
    if (!parkedCarLocation) {
      console.log('No parked car location, skipping alert check')
      return
    }

    const now = Date.now()
    const cooldownMs = ALERT_COOLDOWN_MINUTES * 60 * 1000

    console.log('Checking alerts:', {
      parkedCarLocation,
      sightingsCount: sightings.length,
      alertRadius: ALERT_RADIUS_METERS
    })

    for (const sighting of sightings) {
      const distance = calculateDistance(
        parkedCarLocation.lat,
        parkedCarLocation.lng,
        sighting.lat,
        sighting.lng
      )

      console.log(`Sighting ${sighting.id}: ${distance}m away`)

      if (distance <= ALERT_RADIUS_METERS) {
        const lastAlertTime = lastAlertTimes.current.get(sighting.id) || 0

        if (now - lastAlertTime > cooldownMs) {
          console.log('🚨 TRIGGERING ALERT for sighting:', sighting.id, 'distance:', distance)
          lastAlertTimes.current.set(sighting.id, now)
          setActiveAlert({
            sighting,
            distance: Math.round(distance),
            timestamp: now,
          })
          break
        } else {
          console.log('Alert cooldown not expired for sighting:', sighting.id)
        }
      }
    }
  }, [sightings, parkedCarLocation])

  useEffect(() => {
    checkAlerts()
  }, [checkAlerts])

  const dismissAlert = useCallback(() => {
    setActiveAlert(null)
  }, [])

  const clearParkedCar = useCallback(() => {
    setInternalParkedCar(null)
  }, [])

  return {
    activeAlert,
    dismissAlert,
    parkedCarLocation,
    clearParkedCar,
  }
}
