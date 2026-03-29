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
  const [internalParkedCar, setInternalParkedCar] = useState<{ lat: number; lng: number } | null>(null)
  const lastAlertTimes = useRef<Map<string, number>>(new Map())

  const parkedCarLocation = options?.parkedCar ?? internalParkedCar

  useEffect(() => {
    if (options?.parkedCar === undefined && session?.user?.id) {
      getParkedCar(session.user.id).then((result) => {
        if (result.data) {
          setInternalParkedCar({ lat: result.data.lat, lng: result.data.lng })
        } else {
          setInternalParkedCar(null)
        }
      })
    }
  }, [session?.user?.id, options?.parkedCar])

  const checkAlerts = useCallback(() => {
    if (!parkedCarLocation) return

    const now = Date.now()
    const cooldownMs = ALERT_COOLDOWN_MINUTES * 60 * 1000

    for (const sighting of sightings) {
      const distance = calculateDistance(parkedCarLocation.lat, parkedCarLocation.lng, sighting.lat, sighting.lng)

      if (distance <= ALERT_RADIUS_METERS) {
        const lastAlertTime = lastAlertTimes.current.get(sighting.id) || 0
        if (now - lastAlertTime > cooldownMs) {
          lastAlertTimes.current.set(sighting.id, now)
          setActiveAlert({ sighting, distance: Math.round(distance), timestamp: now })
          break
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

  return { activeAlert, dismissAlert, parkedCarLocation, clearParkedCar }
}
