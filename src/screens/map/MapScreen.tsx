import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ActivityIndicator, Text, Platform } from 'react-native'
import MapView, { Circle, Marker, Callout } from 'react-native-maps'
import * as Location from 'expo-location'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useWardenSightings } from '../../hooks/useWardenSightings'
import { useAlerts } from '../../hooks/useAlerts'
import { WardenMarker } from '../../components/map/WardenMarker'
import { AlertModal } from '../../components/alerts/AlertModal'
import { MaterialFAB } from '../../components/common/MaterialFAB'
import { WebInteractiveMap } from '../../components/common/WebInteractiveMap'
import { useAuth } from '../../contexts/AuthContext'
import { getParkedCar, setParkedCar, removeParkedCar } from '../../services/warden'
import { colors } from '../../theme/colors'
import { typography, spacing } from '../../theme/typography'

const GLASGOW_CENTER = {
  latitude: 55.8609,
  longitude: -4.2514,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
}

export function MapScreen() {
  const navigation = useNavigation()
  const { session } = useAuth()
  const { sightings, loading } = useWardenSightings()
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [parkedCar, setParkedCarState] = useState<{
    lat: number
    lng: number
    radius_m: number
  } | null>(null)
  const [mapRegion, setMapRegion] = useState(GLASGOW_CENTER)
  const { activeAlert, dismissAlert } = useAlerts(sightings, { parkedCar })

  // Debug log
  useEffect(() => {
    console.log('MapScreen state:', {
      sightingsCount: sightings.length,
      hasLocation: !!location,
      hasParkedCar: !!parkedCar,
      hasActiveAlert: !!activeAlert,
    })
  }, [sightings.length, location, parkedCar, activeAlert])

  const isWebPlatform = Platform.OS === 'web'

useEffect(() => {
    ;(async () => {
      if (isWebPlatform) {
        // Use browser geolocation API for web
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }
              setLocation(userLocation)
            },
            (error) => {
              console.log('Geolocation error:', error.message)
            },
            { enableHighAccuracy: true }
          )
        }
      } else {
        // Use expo-location for native
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          return
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        })

        const userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }

        setLocation(userLocation)
        setMapRegion({
          ...userLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        })
      }
    })()
  }, [isWebPlatform])

  useEffect(() => {
    if (session?.user?.id) {
      getParkedCar(session.user.id).then((car) => {
        if (car) {
          setParkedCarState(car)
        }
      })
    }
  }, [session?.user?.id])

  const handleMarkParking = async () => {
    if (!location || !session?.user?.id) return

    const car = await setParkedCar(
      { lat: location.latitude, lng: location.longitude },
      session.user.id
    )
    if (car) {
      setParkedCarState(car)
    }
  }

  const handleRemoveParking = async () => {
    if (!session?.user?.id) return

    await removeParkedCar(session.user.id)
    setParkedCarState(null)
  }

const handleAddSighting = async (data: {
    lat: number
    lng: number
    warden_type: string
    direction: string
    movement: string
  }) => {
    if (!session?.user?.id) {
      console.log('No session, cannot create sighting')
      return
    }

    const { createWardenSighting } = await import('../../services/warden')
    const result = await createWardenSighting(
      {
        lat: data.lat,
        lng: data.lng,
        warden_type: data.warden_type as any,
        direction: data.direction as any,
        movement: data.movement as any,
        count: 'one',
      },
      session.user.id
    )
    console.log('createWardenSighting result:', result)
  }

if (isWebPlatform) {
    return (
      <View style={styles.container}>
        <WebInteractiveMap
          onAddSighting={handleAddSighting}
          sightings={sightings}
          userLocation={location}
          parkedCar={parkedCar}
          onMarkCar={handleMarkParking}
          onRemoveCar={handleRemoveParking}
        />
        <AlertModal
          visible={!!activeAlert}
          sighting={activeAlert?.sighting || null}
          distance={activeAlert?.distance || 0}
          onDismiss={dismissAlert}
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {loading && !location ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, typography.bodyMedium]}>
            Loading map...
          </Text>
        </View>
      ) : null}

      <MapView
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
        showsUserLocation
        showsMyLocationButton
        showsCompass
      >
        {sightings.map((sighting) => (
          <WardenMarker key={sighting.id} sighting={sighting} />
        ))}

        {parkedCar && (
          <>
            <Circle
              center={{ latitude: parkedCar.lat, longitude: parkedCar.lng }}
              radius={parkedCar.radius_m}
              strokeColor={colors.tertiary}
              fillColor={`${colors.tertiary}33`}
            />
            <Marker
              coordinate={{ latitude: parkedCar.lat, longitude: parkedCar.lng }}
            >
              <View style={styles.parkedMarker}>
                <Ionicons name="car" size={24} color={colors.tertiary} />
              </View>
              <Callout>
                <View style={styles.calloutContent}>
                  <Text style={[styles.calloutTitle, typography.titleSmall]}>
                    Your Parked Car
                  </Text>
                  <Text style={[styles.calloutText, typography.bodySmall]}>
                    Alert radius: 150m
                  </Text>
                </View>
              </Callout>
            </Marker>
          </>
        )}
      </MapView>

      <View style={styles.fabContainer}>
        <MaterialFAB
          icon="add"
          onPress={() => navigation.navigate('Report' as never)}
          variant="primary"
          size="large"
        />
        {parkedCar ? (
          <MaterialFAB
            icon="close-circle"
            onPress={handleRemoveParking}
            variant="secondary"
          />
        ) : (
          <MaterialFAB
            icon="location"
            onPress={handleMarkParking}
            variant="tertiary"
          />
        )}
      </View>

      <AlertModal
        visible={!!activeAlert}
        sighting={activeAlert?.sighting || null}
        distance={activeAlert?.distance || 0}
        onDismiss={dismissAlert}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    zIndex: 10,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.onSurfaceVariant,
  },
  fabContainer: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.xl,
    gap: spacing.md,
    alignItems: 'flex-end',
  },
  parkedMarker: {
    backgroundColor: colors.tertiaryContainer,
    padding: spacing.sm,
    borderRadius: 24,
  },
  calloutContent: {
    padding: spacing.sm,
    minWidth: 120,
  },
  calloutTitle: {
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  calloutText: {
    color: colors.onSurfaceVariant,
  },
})
