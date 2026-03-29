import { useState, useEffect, useCallback } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { WardenSighting } from '../types/database'
import { getActiveWardenSightings, subscribeToWardenSightings } from '../services/warden'

export function useWardenSightings() {
  const [sightings, setSightings] = useState<WardenSighting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let subscription: RealtimeChannel

    const init = async () => {
      const data = await getActiveWardenSightings()
      setSightings(data)
      setLoading(false)

      subscription = subscribeToWardenSightings(
        (newSighting) => {
          setSightings((prev) => [newSighting, ...prev])
        },
        (deletedId) => {
          setSightings((prev) => prev.filter((s) => s.id !== deletedId))
        }
      )
    }

    init()

    const cleanup = setInterval(() => {
      const now = new Date()
      setSightings((prev) => prev.filter((s) => new Date(s.expires_at) > now))
    }, 60000)

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
      clearInterval(cleanup)
    }
  }, [])

  const removeExpired = useCallback(() => {
    const now = new Date()
    setSightings((prev) => prev.filter((s) => new Date(s.expires_at) > now))
  }, [])

  return { sightings, loading, removeExpired }
}
