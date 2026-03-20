import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Marker } from 'react-native-maps'
import { WardenSighting } from '../../types/database'

interface WardenMarkerProps {
  sighting: WardenSighting
  onPress?: () => void
}

const WARDEN_COLORS = {
  council: '#FF3B30',
  private: '#FF9500',
  police: '#007AFF',
}

const WARDEN_LABELS = {
  council: 'C',
  private: 'P',
  police: 'X',
}

export function WardenMarker({ sighting, onPress }: WardenMarkerProps) {
  const color = WARDEN_COLORS[sighting.warden_type]
  const label = WARDEN_LABELS[sighting.warden_type]

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    return `${Math.floor(diffHours / 24)}d ago`
  }

  return (
    <Marker
      coordinate={{
        latitude: sighting.lat,
        longitude: sighting.lng,
      }}
      onPress={onPress}
    >
      <View style={[styles.marker, { backgroundColor: color }]}>
        <Text style={styles.markerText}>{label}</Text>
      </View>
      <View style={styles.callout}>
        <Text style={styles.calloutText}>
          {getTimeAgo(sighting.created_at)}
        </Text>
      </View>
    </Marker>
  )
}

const styles = StyleSheet.create({
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  callout: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  calloutText: {
    color: '#fff',
    fontSize: 10,
  },
})
