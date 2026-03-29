import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../theme/colors'
import { typography, spacing } from '../../theme/typography'
import type { WardenSighting } from '../../types/database'

declare global {
  interface Window {
    L: any
  }
}

interface WebInteractiveMapProps {
  sightings: WardenSighting[]
  userLocation?: { latitude: number; longitude: number } | null
  parkedCar?: { lat: number; lng: number; radius_m: number } | null
  onAddSighting: (data: {
    lat: number
    lng: number
    warden_type: string
    direction: string
    movement: string
  }) => void
  onMarkCar?: (lat: number, lng: number) => void
  onRemoveCar?: () => void
}

const WARDEN_TYPES = [
  { value: 'council', label: 'Council', color: '#FF3B30' },
  { value: 'private', label: 'Private', color: '#FBBC05' },
  { value: 'police', label: 'Police', color: '#1A73E8' },
]

const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

const MOVEMENT_TYPES = [
  { value: 'walking', label: 'Walking', expiry: 60 },
  { value: 'cycling', label: 'Cycling', expiry: 45 },
  { value: 'driving', label: 'Driving', expiry: 30 },
]

export function WebInteractiveMap({
  sightings,
  userLocation,
  parkedCar,
  onAddSighting,
  onMarkCar,
  onRemoveCar,
}: WebInteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const carMarkerRef = useRef<any>(null)
  const carCircleRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [selectedType, setSelectedType] = useState('council')
  const [selectedMovement, setSelectedMovement] = useState('walking')
  const [isAdding, setIsAdding] = useState(false)
  const [isMarkingCar, setIsMarkingCar] = useState(false)
  const [tempMarker, setTempMarker] = useState<any>(null)
  const [placementData, setPlacementData] = useState<{
    lat: number
    lng: number
    direction: string
  } | null>(null)

  const center = userLocation || { latitude: 55.8609, longitude: -4.2514 }

  // Load Leaflet and init map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Load CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    const init = () => {
      if (!mapRef.current || !window.L) return

      const map = window.L.map(mapRef.current, {
        center: [center.latitude, center.longitude],
        zoom: 15,
      })

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      mapInstanceRef.current = map
      setIsReady(true)
    }

    if (window.L) {
      init()
    } else {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = init
      document.head.appendChild(script)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Center map on user location when it changes
  useEffect(() => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setView([userLocation.latitude, userLocation.longitude], 16)
    }
  }, [userLocation])

  // Update user location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !isReady || !userLocation) return
    
    const map = mapInstanceRef.current
    
    // Clear old user marker
    markersRef.current.forEach((marker, key) => {
      if (key === 'user') {
        map.removeLayer(marker)
        markersRef.current.delete(key)
      }
    })

  // Add user marker with popup option to mark car
    const userIcon = window.L.divIcon({
      className: 'user-marker',
      html: `<div style="
        width: 24px; height: 24px; background: #9C27B0;
        border: 3px solid white; border-radius: 50%;
        box-shadow: 0 2px 8px rgba(156, 39, 176, 0.5);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

    const marker = window.L.marker(
      [userLocation.latitude, userLocation.longitude],
      { icon: userIcon, zIndexOffset: 1000 }
    ).addTo(map)

    // Popup with "Mark My Car" option
    const popupContent = parkedCar
      ? `<b>You are here</b><br><small>Car marked nearby</small>`
      : `<b>You are here</b><br><button id="mark-car-btn" style="
          background: #6750A4; color: white; border: none;
          padding: 8px 16px; border-radius: 20px; cursor: pointer;
          margin-top: 8px; font-size: 14px;
        ">🚗 Mark My Car</button>`

    marker.bindPopup(popupContent)

    // Handle mark car button click
    marker.on('popupopen', () => {
      if (!parkedCar) {
        setTimeout(() => {
          const btn = document.getElementById('mark-car-btn')
          if (btn) {
            btn.addEventListener('click', () => {
              marker.closePopup()
              if (onMarkCar) {
                onMarkCar(userLocation.latitude, userLocation.longitude)
              }
            })
          }
        }, 100)
      }
    })

    markersRef.current.set('user', marker)
  }, [isReady, userLocation, parkedCar, onMarkCar])

  // Update sightings markers
  useEffect(() => {
    if (!mapInstanceRef.current || !isReady) return

    const map = mapInstanceRef.current

    // Clear old sightings
    markersRef.current.forEach((marker, key) => {
      if (key !== 'user' && key !== 'temp' && key !== 'car' && key !== 'carCircle') {
        map.removeLayer(marker)
        markersRef.current.delete(key)
      }
    })

    // Add sightings
    sightings.forEach((sighting) => {
      const typeInfo = WARDEN_TYPES.find(t => t.value === sighting.warden_type) || WARDEN_TYPES[0]

      const icon = window.L.divIcon({
        className: 'sighting-marker',
        html: `<div style="
          width: 16px; height: 16px; background: ${typeInfo.color};
          border: 2px solid white; border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      const marker = window.L.marker([sighting.lat, sighting.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <b>${typeInfo.label}</b><br>
          Direction: ${sighting.direction}<br>
          Movement: ${sighting.movement}<br>
          <small>${new Date(sighting.created_at).toLocaleTimeString()}</small>
        `)

      markersRef.current.set(sighting.id, marker)
    })
  }, [isReady, sightings])

  // Update parked car marker
  useEffect(() => {
    if (!mapInstanceRef.current || !isReady) return

    const map = mapInstanceRef.current

    // Remove old car marker and circle
    if (carMarkerRef.current) {
      map.removeLayer(carMarkerRef.current)
      carMarkerRef.current = null
    }
    if (carCircleRef.current) {
      map.removeLayer(carCircleRef.current)
      carCircleRef.current = null
    }

    if (parkedCar) {
      // Add car marker
      const carIcon = window.L.divIcon({
        className: 'car-marker',
        html: `<div style="
          width: 28px; height: 28px; background: #34C759;
          border: 3px solid white; border-radius: 50%;
          box-shadow: 0 2px 8px rgba(52, 199, 89, 0.5);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        ">🚗</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })

      carMarkerRef.current = window.L.marker([parkedCar.lat, parkedCar.lng], {
        icon: carIcon,
        zIndexOffset: 900,
      }).addTo(map).bindPopup('<b>My Car</b><br>Alert radius: 500m')

      // Add alert radius circle
      carCircleRef.current = window.L.circle([parkedCar.lat, parkedCar.lng], {
        radius: parkedCar.radius_m,
        color: '#34C759',
        fillColor: '#34C759',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map)
      
      // Update popup text
      carMarkerRef.current.bindPopup(`<b>My Car</b><br>Alert radius: ${parkedCar.radius_m}m<br><button id="remove-car-btn" style="
        background: #FF3B30; color: white; border: none;
        padding: 8px 16px; border-radius: 20px; cursor: pointer;
        margin-top: 8px; font-size: 14px;
      ">Remove</button>`)
      
      // Handle remove car button
      carMarkerRef.current.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.getElementById('remove-car-btn')
          if (btn) {
            btn.addEventListener('click', () => {
              carMarkerRef.current.closePopup()
              if (onRemoveCar) {
                onRemoveCar()
              }
            })
          }
        }, 100)
      })
    }
  }, [isReady, parkedCar, onRemoveCar])

  // Handle map click for adding marker
  useEffect(() => {
    if (!mapInstanceRef.current || !isReady) return
    
    const map = mapInstanceRef.current
    
  const handleClick = (e: any) => {
      console.log('Map clicked, isAdding:', isAdding, 'isMarkingCar:', isMarkingCar)
      
      if (isMarkingCar) {
        const { lat, lng } = e.latlng
        if (onMarkCar) {
          onMarkCar(lat, lng)
        }
        setIsMarkingCar(false)
        return
      }
      
      if (!isAdding) return

const { lat, lng } = e.latlng
      console.log('Creating marker at:', lat, lng)

      // Remove old temp marker
      if (tempMarker) {
        map.removeLayer(tempMarker)
      }
      
  // Create simple red location marker (only the dot, no arrow)
      const icon = window.L.divIcon({
        className: 'temp-marker',
        html: `<div style="
          width: 24px; height: 24px; background: #FF3B30;
          border: 3px solid white; border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          cursor: grab;
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = window.L.marker([lat, lng], {
        icon,
        draggable: true,
        zIndexOffset: 2000,
      }).addTo(map)

  // Calculate direction on drag end (just track position, no visual line/arrow)
      marker.on('dragend', (event: any) => {
        const pos = event.target.getLatLng()
        setPlacementData({
          lat: pos.lat,
          lng: pos.lng,
          direction: 'N',
        })
      })

      setTempMarker(marker)
      setPlacementData({ lat, lng, direction: 'N' })
    }
    
    map.on('click', handleClick)
    return () => {
      map.off('click', handleClick)
    }
  }, [isReady, isAdding, isMarkingCar, selectedType, tempMarker])

  const handleStartAdding = () => {
    console.log('Starting add mode')
    setIsMarkingCar(false)
    setIsAdding(true)
    setPlacementData(null)
  }

  const handleStartMarkingCar = () => {
    console.log('Starting car marking mode')
    setIsAdding(false)
    setIsMarkingCar(true)
  }

  const handleCancelCarMarking = () => {
    setIsMarkingCar(false)
  }

  const handleRemoveCar = () => {
    if (onRemoveCar) {
      onRemoveCar()
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    if (tempMarker && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(tempMarker)
    }
    setTempMarker(null)
    setPlacementData(null)
  }

  const handleConfirm = () => {
    if (placementData) {
      console.log('Confirming sighting:', placementData, selectedType, selectedMovement)
      onAddSighting({
        lat: placementData.lat,
        lng: placementData.lng,
        warden_type: selectedType,
        direction: placementData.direction,
        movement: selectedMovement,
      })
      handleCancel()
    } else {
      console.log('No placement data to confirm')
    }
  }

  const recenter = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setView(
        [userLocation.latitude, userLocation.longitude],
        15
      )
    }
  }

return (
    <View style={styles.container}>
      {/* Type & Movement Row */}
      <View style={styles.typeRow}>
        <View style={styles.rowSection}>
          <Text style={styles.rowLabel}>Type</Text>
          <View style={styles.chipRow}>
            {WARDEN_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.chip,
                  selectedType === type.value && { backgroundColor: type.color },
                ]}
                onPress={() => setSelectedType(type.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedType === type.value && styles.chipTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.rowSection}>
          <Text style={styles.rowLabel}>Movement</Text>
          <View style={styles.chipRow}>
            {MOVEMENT_TYPES.map((move) => (
              <TouchableOpacity
                key={move.value}
                style={[
                  styles.chip,
                  selectedMovement === move.value && styles.chipActive,
                ]}
                onPress={() => setSelectedMovement(move.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedMovement === move.value && styles.chipTextActive,
                  ]}
                >
                  {move.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionRow}>
        {!isAdding ? (
          <>
            <TouchableOpacity style={styles.reportBtn} onPress={handleStartAdding}>
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.reportBtnText}>Report</Text>
            </TouchableOpacity>
            {parkedCar ? (
              <TouchableOpacity style={styles.carBtnOn} onPress={handleRemoveCar}>
                <Ionicons name="car" size={16} color="#fff" />
                <Text style={styles.carBtnTextOn}>🚗 ON</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.carBtnOff} onPress={() => {
                if (userLocation && onMarkCar) {
                  onMarkCar(userLocation.latitude, userLocation.longitude)
                }
              }}>
                <Ionicons name="car-outline" size={16} color={colors.primary} />
                <Text style={styles.carBtnTextOff}>My Car</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Ionicons name="close" size={18} color={colors.error} />
            </TouchableOpacity>
            {placementData && (
              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                <Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={styles.confirmBtnText}>OK</Text>
              </TouchableOpacity>
            )}
          </>
        )}
        <TouchableOpacity style={styles.meBtn} onPress={recenter}>
          <Ionicons name="locate" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Instruction */}
      {(isAdding || isMarkingCar) && (
        <View style={styles.tip}>
          <Text style={styles.tipText}>
            {isMarkingCar ? 'Tap map to mark your car' : 'Tap map to place marker'}
          </Text>
        </View>
      )}

      {/* Map */}
      <div ref={mapRef} style={styles.mapDiv as any} />

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.statsText}>{sightings.length} active</Text>
        {userLocation && (
          <Text style={styles.statsText}>
            You: {userLocation.latitude.toFixed(3)}, {userLocation.longitude.toFixed(3)}
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
  },
  rowSection: {
    flex: 1,
  },
  rowLabel: {
    ...typography.labelSmall,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.outline,
    minWidth: 45,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    ...typography.labelSmall,
    color: colors.onSurface,
    fontSize: 12,
  },
  chipTextActive: {
    color: '#fff',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
    gap: spacing.sm,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: spacing.xs,
  },
  reportBtnText: {
    ...typography.labelMedium,
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelBtn: {
    backgroundColor: colors.surfaceVariant,
    padding: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.error,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: spacing.xs,
  },
  confirmBtnText: {
    ...typography.labelMedium,
    color: '#fff',
    fontWeight: 'bold',
  },
  meBtn: {
    backgroundColor: colors.surfaceVariant,
    padding: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  carBtnOn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: 4,
  },
  carBtnTextOn: {
    ...typography.labelMedium,
    color: '#fff',
    fontWeight: 'bold',
  },
  carBtnOff: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  carBtnTextOff: {
    ...typography.labelMedium,
    color: colors.primary,
  },
  tip: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  tipText: {
    ...typography.labelSmall,
    color: colors.onPrimaryContainer,
  },
  mapDiv: {
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outline,
  },
  statsText: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
  },
})
