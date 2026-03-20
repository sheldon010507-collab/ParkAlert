import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../types/navigation'

type Props = NativeStackScreenProps<RootStackParamList, 'Parked'>

export function ParkedScreen({ navigation }: Props) {
  const handleConfirm = () => {
    // TODO: Save parking location
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mark Your Parking Spot</Text>
      <Text style={styles.description}>
        This will set a 150m alert radius around your current location. You'll
        be notified when a warden is spotted nearby.
      </Text>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Confirm Parking Location</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  confirmButton: {
    height: 50,
    backgroundColor: '#34C759',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: '#FF3B30',
    fontSize: 16,
  },
})
