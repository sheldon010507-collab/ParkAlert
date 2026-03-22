import { supabase } from './supabase'
import {
  WardenSighting,
  ParkedCar,
  WardenType,
  CountType,
  DirectionType,
  MovementType,
  MOVEMENT_EXPIRY_MINUTES,
} from '../types/database'

export async function createWardenSighting(
  data: {
    lat: number
    lng: number
    warden_type: WardenType
    count: CountType
    direction: DirectionType
    movement: MovementType
  },
  userId: string
): Promise<WardenSighting | null> {
  const expiresAt = new Date()
  expiresAt.setMinutes(
    expiresAt.getMinutes() + MOVEMENT_EXPIRY_MINUTES[data.movement]
  )

  const { data: sighting, error } = await supabase
    .from('warden_sightings')
    .insert({
      ...data,
      user_id: userId,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating warden sighting:', error)
    return null
  }

  return sighting
}

export async function getActiveWardenSightings(): Promise<WardenSighting[]> {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('warden_sightings')
    .select('*')
    .gt('expires_at', now)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching warden sightings:', error)
    return []
  }

  return data || []
}

export function subscribeToWardenSightings(
  onInsert: (sighting: WardenSighting) => void,
  onDelete: (id: string) => void
) {
  console.log('Subscribing to warden_sightings changes...')
  
  const channel = supabase
    .channel('warden_sightings_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'warden_sightings',
      },
      (payload) => {
        console.log('Received INSERT event:', payload)
        const sighting = payload.new as WardenSighting
        if (new Date(sighting.expires_at) > new Date()) {
          console.log('Adding new sighting to list:', sighting.id)
          onInsert(sighting)
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'warden_sightings',
      },
      (payload) => {
        console.log('Received DELETE event:', payload)
        onDelete(payload.old.id)
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status)
    })
    
  return channel
}

export async function setParkedCar(
  data: { lat: number; lng: number },
  userId: string
): Promise<ParkedCar | null> {
  const { data: parkedCar, error } = await supabase
    .from('parked_cars')
    .upsert(
      {
        user_id: userId,
        lat: data.lat,
        lng: data.lng,
        radius_m: 100,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) {
    console.error('Error setting parked car:', error)
    return null
  }

  return parkedCar
}

export async function removeParkedCar(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('parked_cars')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Error removing parked car:', error)
    return false
  }

  return true
}

export async function getParkedCar(userId: string): Promise<ParkedCar | null> {
  const { data, error } = await supabase
    .from('parked_cars')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    return null
  }

  return data
}
