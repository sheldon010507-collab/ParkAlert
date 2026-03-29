import { supabase } from './supabase'
import { WardenSighting, ParkedCar, WardenType, CountType, DirectionType, MovementType, MOVEMENT_EXPIRY_MINUTES } from '../types/database'

export interface ServiceResult<T> {
  data: T | null
  error: string | null
}

export async function createWardenSighting(
  data: { lat: number; lng: number; warden_type: WardenType; count: CountType; direction: DirectionType; movement: MovementType },
  userId: string
): Promise<ServiceResult<WardenSighting>> {
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + MOVEMENT_EXPIRY_MINUTES[data.movement])

  const { data: sighting, error } = await supabase.from('warden_sightings').insert({
    ...data,
    user_id: userId,
    expires_at: expiresAt.toISOString(),
  }).select().single()

  if (error) {
    return { data: null, error: error.message || 'Failed to create sighting' }
  }
  return { data: sighting, error: null }
}

export async function getActiveWardenSightings(): Promise<ServiceResult<WardenSighting[]>> {
  const now = new Date().toISOString()
  const { data, error } = await supabase.from('warden_sightings').select('*').gt('expires_at', now).order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message || 'Failed to fetch sightings' }
  }
  return { data: data || [], error: null }
}

export function subscribeToWardenSightings(onInsert: (sighting: WardenSighting) => void, onDelete: (id: string) => void) {
  const channel = supabase.channel('warden_sightings_changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'warden_sightings' }, (payload) => {
      const sighting = payload.new as WardenSighting
      if (new Date(sighting.expires_at) > new Date()) {
        onInsert(sighting)
      }
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'warden_sightings' }, (payload) => {
      onDelete(payload.old.id)
    })
    .subscribe()

  return channel
}

export async function setParkedCar(data: { lat: number; lng: number }, userId: string): Promise<ServiceResult<ParkedCar>> {
  const { data: parkedCar, error } = await supabase.from('parked_cars').upsert({
    user_id: userId,
    lat: data.lat,
    lng: data.lng,
    radius_m: 100,
  }, { onConflict: 'user_id' }).select().single()

  if (error) {
    return { data: null, error: error.message || 'Failed to set parked car' }
  }
  return { data: parkedCar, error: null }
}

export async function removeParkedCar(userId: string): Promise<ServiceResult<boolean>> {
  const { error } = await supabase.from('parked_cars').delete().eq('user_id', userId)

  if (error) {
    return { data: null, error: error.message || 'Failed to remove parked car' }
  }
  return { data: true, error: null }
}

export async function getParkedCar(userId: string): Promise<ServiceResult<ParkedCar>> {
  const { data, error } = await supabase.from('parked_cars').select('*').eq('user_id', userId).single()

  if (error) {
    if (error.code === 'PGRST116') {
      return { data: null, error: null }
    }
    return { data: null, error: error.message || 'Failed to get parked car' }
  }
  return { data, error: null }
}
