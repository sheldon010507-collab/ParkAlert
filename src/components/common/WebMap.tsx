import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Dimensions, ScrollView, Platform } from 'react-native'
import * as Location from 'expo-location'
import { colors } from '../../theme/colors'
import { typography, spacing } from '../../theme/typography'

interface WebMapProps {
  sightings: Array<{
    id: string
    lat: number
    lng: number
    warden_type: string
    created_at: string
  }>
  parkedCar?: {
    lat: number
    lng: number
  } | null
  userLocation?: {
    latitude: number
    longitude: number
  } | null
}

const WARDEN_COLORS: Record<string, string> = {
  council: '#FF3B30',
  private: '#FBBC05',
  police: '#1A73E8',
}

const WARDEN_LABELS: Record<string, string> = {
  council: 'Council Warden',
  private: 'Private Parking',
  police: 'Police',
}

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ''

export function WebMap({ sightings, parkedCar, userLocation: propUserLocation }: WebMapProps) {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(propUserLocation || null)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    if (propUserLocation) {
      setUserLocation(propUserLocation)
      return
    }

    // Try to get location on Web
    if (Platform.OS === 'web' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          setLocationError('Location access denied')
        }
      )
    }
  }, [propUserLocation])

  const glasgowCenter = { lat: 55.8609, lng: -4.2514 }
  const center = userLocation
    ? { lat: userLocation.latitude, lng: userLocation.longitude }
    : glasgowCenter

  // Build markers string for Embed API
  const buildMarkers = () => {
    const markers: string[] = []
    
    // Add user location first (if available)
    if (userLocation) {
      markers.push(`markers=color:purple|label:U|${userLocation.latitude},${userLocation.longitude}`)
    }
    
    // Add warden sightings as markers
    sightings.forEach((sighting) => {
      const color = sighting.warden_type === 'council' ? 'red' : 
                   sighting.warden_type === 'private' ? 'yellow' : 'blue'
      markers.push(`markers=color:${color}|${sighting.lat},${sighting.lng}`)
    })
    
    // Add parked car
    if (parkedCar) {
      markers.push(`markers=color:green|label:P|${parkedCar.lat},${parkedCar.lng}`)
    }
    
    return markers
  }

  // Generate Embed URL - Embed view mode doesn't support custom markers
  const generateEmbedUrl = () => {
    // For Web Embed API, we use 'view' mode which doesn't support markers
    // We'll show the map centered on user location or Glasgow
    return `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${center.lat},${center.lng}&zoom=16&maptype=roadmap`
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins === 1) return '1 min ago'
    return `${diffMins} mins ago`
  }

  const { width } = Dimensions.get('window')
  const mapHeight = 400

  return (
    <View style={styles.container}>
      {/* Location Status */}
      {locationError && (
        <View style={styles.locationBanner}>
          <Text style={[styles.locationBannerText, typography.bodyMedium]}>
            ⚠️ {locationError}
          </Text>
        </View>
      )}
      
      {userLocation && (
        <View style={styles.locationBanner}>
          <Text style={[styles.locationBannerText, typography.bodyMedium]}>
            📍 Your location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
        </View>
      )}

      {/* Map Embed with User Location Marker Overlay */}
      <View style={[styles.mapContainer, { height: mapHeight }]}>
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0, borderRadius: 16 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={generateEmbedUrl()}
        />
        {/* Center Location Marker Overlay */}
        {userLocation && (
          <View style={styles.markerOverlay} pointerEvents="none">
            <View style={styles.locationMarker}>
              <View style={styles.markerPulse} />
              <View style={styles.markerDot}>
                <Text style={styles.markerIcon}>📍</Text>
              </View>
            </View>
            <View style={styles.markerLabel}>
              <Text style={[styles.markerLabelText, typography.labelSmall]}>
                YOU
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={[styles.legendTitle, typography.titleMedium]}>
          Legend
        </Text>
        <View style={styles.legend}>
          {userLocation && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#9C27B0' }]} />
              <Text style={[styles.legendText, typography.bodyMedium]}>
                Your Location
              </Text>
            </View>
          )}
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
            <Text style={[styles.legendText, typography.bodyMedium]}>
              Council Warden
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FBBC05' }]} />
            <Text style={[styles.legendText, typography.bodyMedium]}>
              Private Parking
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#1A73E8' }]} />
            <Text style={[styles.legendText, typography.bodyMedium]}>
              Police
            </Text>
          </View>
          {parkedCar && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#34A853' }]} />
              <Text style={[styles.legendText, typography.bodyMedium]}>
                Your Car
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Sightings List */}
      <ScrollView style={styles.listContainer}>
        <Text style={[styles.listTitle, typography.titleMedium]}>
          Active Sightings ({sightings.length})
        </Text>
        
        {sightings.length === 0 ? (
          <Text style={[styles.emptyText, typography.bodyMedium]}>
            No active sightings in the area
          </Text>
        ) : (
          <View style={styles.sightingsList}>
            {sightings.map((sighting) => (
              <View key={sighting.id} style={styles.sightingItem}>
                <View
                  style={[
                    styles.sightingDot,
                    { backgroundColor: WARDEN_COLORS[sighting.warden_type] },
                  ]}
                />
                <View style={styles.sightingInfo}>
                  <Text style={[styles.sightingType, typography.bodyMedium]}>
                    {WARDEN_LABELS[sighting.warden_type]}
                  </Text>
                  <Text style={[styles.sightingTime, typography.bodySmall]}>
                    {getTimeAgo(sighting.created_at)}
                  </Text>
                </View>
                <Text style={[styles.sightingCoords, typography.labelSmall]}>
                  {sighting.lat.toFixed(3)}, {sighting.lng.toFixed(3)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {parkedCar && (
          <View style={styles.parkedSection}>
            <Text style={[styles.parkedTitle, typography.titleMedium]}>
              🅿️ Your Parked Car
            </Text>
            <Text style={[styles.parkedCoords, typography.bodyMedium]}>
              {parkedCar.lat.toFixed(4)}, {parkedCar.lng.toFixed(4)}
            </Text>
            <Text style={[styles.parkedRadius, typography.bodySmall]}>
              150m alert radius
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  locationBanner: {
    backgroundColor: colors.primaryContainer,
    padding: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: 8,
  },
  locationBannerText: {
    color: colors.onPrimaryContainer,
    textAlign: 'center',
  },
  mapContainer: {
    margin: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...colors.elevation2,
  },
  legendContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    ...colors.elevation1,
  },
  legendTitle: {
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    color: colors.onSurfaceVariant,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  listTitle: {
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: spacing.lg,
    fontStyle: 'italic',
  },
  sightingsList: {
    gap: spacing.sm,
  },
  sightingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    ...colors.elevation1,
  },
  sightingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  sightingInfo: {
    flex: 1,
  },
  sightingType: {
    color: colors.onSurface,
  },
  sightingTime: {
    color: colors.onSurfaceVariant,
  },
  sightingCoords: {
    color: colors.outline,
  },
  parkedSection: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.tertiaryContainer,
    borderRadius: 12,
  },
  parkedTitle: {
    color: colors.onTertiaryContainer,
    marginBottom: spacing.xs,
  },
  parkedCoords: {
    color: colors.onTertiaryContainer,
  },
  parkedRadius: {
    color: colors.tertiary,
    marginTop: spacing.xs,
  },
  markerOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationMarker: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(156, 39, 176, 0.4)',
  },
  markerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9C27B0',
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  markerIcon: {
    fontSize: 12,
  },
  markerLabel: {
    marginTop: 8,
    backgroundColor: '#9C27B0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  markerLabelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
})
