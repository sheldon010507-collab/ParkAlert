import AsyncStorage from '@react-native-async-storage/async-storage'
import { ParkingLocation, LocationCoords, AlertLog } from '../types'
import { supabase } from './supabase'
import { LocationService } from './location'
import { logger } from '../utils/logger'
import { PARKING_CONSTANTS } from '../constants'

export class WardenService {
  private static alertCooldownKey = 'last_alert_time'
  private static parkingLocationKey = 'parking_location'

  static async saveParkingLocation(location: Omit<ParkingLocation, 'id' | 'created_at'>): Promise<ParkingLocation> {
    try {
      const { data, error } = await supabase
        .from('parking_locations')
        .insert(location)
        .select()
        .single()

      if (error) throw error

      const parkingLocation = data as ParkingLocation
      await AsyncStorage.setItem(this.parkingLocationKey, JSON.stringify(parkingLocation))
      return parkingLocation
    } catch (error) {
      logger.error('Error saving parking location:', error)
      const fallbackLocation: ParkingLocation = {
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...location,
      }
      await AsyncStorage.setItem(this.parkingLocationKey, JSON.stringify(fallbackLocation))
      return fallbackLocation
    }
  }

  static async getActiveParkingLocation(userId: string): Promise<ParkingLocation | null> {
    try {
      const { data, error } = await supabase
        .from('parking_locations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error

      if (data) {
        const parkingLocation = data as ParkingLocation
        await AsyncStorage.setItem(this.parkingLocationKey, JSON.stringify(parkingLocation))
        return parkingLocation
      }

      const cachedLocation = await this.getCachedParkingLocation()
      if (cachedLocation?.user_id === userId && cachedLocation.is_active) {
        return cachedLocation
      }

      return null
    } catch (error) {
      logger.error('Error getting active parking location:', error)
      const cachedLocation = await this.getCachedParkingLocation()
      if (cachedLocation?.user_id === userId && cachedLocation.is_active) {
        return cachedLocation
      }
      return null
    }
  }

  static async clearParkingLocation(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('parking_locations')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      await AsyncStorage.removeItem(this.parkingLocationKey)
    } catch (error) {
      logger.error('Error clearing parking location:', error)
      const cachedLocation = await this.getCachedParkingLocation()
      if (cachedLocation?.id === id) {
        await AsyncStorage.setItem(
          this.parkingLocationKey,
          JSON.stringify({ ...cachedLocation, is_active: false })
        )
      }
      throw error
    }
  }

  static async logAlert(alertLog: Omit<AlertLog, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('alert_logs')
        .insert(alertLog)

      if (error) throw error
    } catch (error) {
      logger.error('Error logging alert:', error)
    }
  }

  static shouldShowAlert(distance: number, alertRadius: number): boolean {
    return distance > alertRadius
  }

  static async canShowAlert(): Promise<boolean> {
    try {
      const lastAlertTime = await AsyncStorage.getItem(this.alertCooldownKey)
      if (!lastAlertTime) return true

      const lastAlert = new Date(lastAlertTime)
      const now = new Date()
      const minutesSinceLastAlert = (now.getTime() - lastAlert.getTime()) / (1000 * 60)

      return minutesSinceLastAlert >= PARKING_CONSTANTS.ALERT_COOLDOWN_MINUTES
    } catch (error) {
      logger.error('Error checking alert cooldown:', error)
      return true
    }
  }

  static async setAlertCooldown(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.alertCooldownKey, new Date().toISOString())
    } catch (error) {
      logger.error('Error setting alert cooldown:', error)
    }
  }

  static async extendAlert(minutes: number): Promise<void> {
    try {
      const futureTime = new Date(Date.now() + minutes * 60 * 1000)
      await AsyncStorage.setItem(this.alertCooldownKey, futureTime.toISOString())
    } catch (error) {
      logger.error('Error extending alert:', error)
    }
  }

  static async getCachedParkingLocation(): Promise<ParkingLocation | null> {
    try {
      const cached = await AsyncStorage.getItem(this.parkingLocationKey)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      logger.error('Error getting cached parking location:', error)
      return null
    }
  }
}
