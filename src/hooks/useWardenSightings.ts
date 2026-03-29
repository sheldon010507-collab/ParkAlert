import { useState, useEffect, useCallback, useRef } from 'react'
import { RealtimeChannel, RealtimeChannelState } from '@supabase/supabase-js'
import { WardenSighting } from '../types/database'
import { getActiveWardenSightings, subscribeToWardenSightings } from '../services/warden'

const RECONNECT_DELAY = 5000
const MAX_RECONNECT_ATTEMPTS = 5

export function useWardenSightings() {
  const [sightings, setSightings] = useState<WardenSighting[]>([])
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const subscriptionRef = useRef<RealtimeChannel | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(async () => {
    setConnectionStatus('connecting')
    const result = await getActiveWardenSightings()
    
    if (result.error) {
      setLoading(false)
      setConnectionStatus('disconnected')
      return
    }

    setSightings(result.data || [])
    setLoading(false)

    const subscription = subscribeToWardenSightings(
      (newSighting) => {
        setSightings((prev) => {
          if (prev.some(s => s.id === newSighting.id)) return prev
          return [newSighting, ...prev]
        })
      },
      (deletedId) => {
        setSightings((prev) => prev.filter((s) => s.id !== deletedId))
      }
    )

    subscriptionRef.current = subscription

    subscription.on('system', (payload: any) => {
      if (payload === 'SUBSCRIBED') {
        setConnectionStatus('connected')
        reconnectAttemptsRef.current = 0
      } else if (payload === 'CLOSED' || payload === 'ERRORED') {
        setConnectionStatus('disconnected')
        attemptReconnect()
      }
    })
  }, [])

  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) return

    reconnectAttemptsRef.current++
    reconnectTimeoutRef.current = setTimeout(() => {
      connect()
    }, RECONNECT_DELAY * reconnectAttemptsRef.current)
  }, [connect])

  useEffect(() => {
    connect()

    const cleanup = setInterval(() => {
      const now = new Date()
      setSightings((prev) => prev.filter((s) => new Date(s.expires_at) > now))
    }, 60000)

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      clearInterval(cleanup)
    }
  }, [connect])

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0
    connect()
  }, [connect])

  const removeExpired = useCallback(() => {
    const now = new Date()
    setSightings((prev) => prev.filter((s) => new Date(s.expires_at) > now))
  }, [])

  return { sightings, loading, connectionStatus, reconnect, removeExpired }
}
