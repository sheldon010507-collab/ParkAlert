import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface WebMapPlaceholderProps {
  center?: { lat: number; lng: number }
}

export function WebMapPlaceholder({ center }: WebMapPlaceholderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.title}>Map View</Text>
        <Text style={styles.message}>
          Maps are only available on mobile devices
        </Text>
        <Text style={styles.hint}>
          Use Expo Go on your phone to see the full map experience
        </Text>
        {center && (
          <Text style={styles.coords}>
            📍 {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: 320,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  hint: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
  },
  coords: {
    marginTop: 16,
    fontSize: 12,
    color: '#999',
  },
})
