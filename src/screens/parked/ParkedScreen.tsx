import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as Location from 'expo-location'
import { MaterialButton } from '../../components/common/MaterialButton'
import { MaterialAlert } from '../../components/common/MaterialDialog'
import { useAuth } from '../../contexts/AuthContext'
import { setParkedCar, getParkedCar, removeParkedCar } from '../../services/warden'
import { RootStackParamList } from '../../types/navigation'
import { colors } from '../../theme/colors'
import { typography, spacing, radius } from '../../theme/typography'
import { ALERT_RADIUS_METERS } from '../../constants'

type Props = NativeStackScreenProps<RootStackParamList, 'Parked'>

export function ParkedScreen({ navigation }: Props) {
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [existingParkedCar, setExistingParkedCar] = useState<{ lat: number; lng: number; radius_m: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setError('Location permission denied. Please enable location access.')
        setLoading(false)
        return
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude })
      if (session?.user?.id) {
        const car = await getParkedCar(session.user.id)
        if (car) setExistingParkedCar(car)
      }
    } catch (err) {
      setError('Failed to get your location.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!location || !session?.user?.id) return
    setSaving(true)
    try {
      const result = await setParkedCar({ lat: location.latitude, lng: location.longitude }, session.user.id)
      if (result) setSuccess(true)
      else setError('Failed to save parking location.')
    } catch (err) {
      setError('An error occurred.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    if (!session?.user?.id) return
    setSaving(true)
    try {
      await removeParkedCar(session.user.id)
      navigation.goBack()
    } catch (err) {
      setError('Failed to remove parking location.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="car" size={48} color={colors.primary} />
        </View>
        <Text style={styles.title}>Mark Your Parking</Text>
        <Text style={styles.subtitle}>Set your parked car location to receive alerts.</Text>
      </View>

      {location && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={24} color={colors.tertiary} />
            <Text style={styles.cardTitle}>Current Location</Text>
          </View>
          <Text style={styles.cardText}>Lat: {location.latitude.toFixed(6)}</Text>
          <Text style={styles.cardText}>Lng: {location.longitude.toFixed(6)}</Text>
          <View style={styles.radiusInfo}>
            <Ionicons name="alert-circle" size={20} color={colors.primary} />
            <Text style={styles.radiusText}>Alert radius: {ALERT_RADIUS_METERS}m</Text>
          </View>
        </View>
      )}

      {existingParkedCar && !success && (
        <View style={[styles.card, styles.existingCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="checkmark-circle" size={24} color={colors.tertiary} />
            <Text style={styles.cardTitle}>Existing Parking</Text>
          </View>
          <Text style={styles.cardText}>You already have a parked car location.</Text>
          <MaterialButton title="Remove" onPress={handleRemove} variant="outlined" loading={saving} icon="trash-outline" />
        </View>
      )}

      <View style={styles.actions}>
        <MaterialButton title="Confirm Location" onPress={handleConfirm} variant="filled" size="large" fullWidth icon="checkmark-circle" loading={saving} disabled={!location} />
      </View>

      <MaterialAlert visible={!!error} onDismiss={() => setError(null)} title="Error" message={error || ''} type="error" />
      <MaterialAlert visible={success} onDismiss={() => { setSuccess(false); navigation.goBack() }} title="Saved!" message={`Alerts active within ${ALERT_RADIUS_METERS}m.`} type="success" />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { color: colors.onSurfaceVariant, marginTop: spacing.md },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryContainer, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  title: { color: colors.onBackground, fontSize: 24, fontWeight: 'bold', marginBottom: spacing.sm },
  subtitle: { color: colors.onSurfaceVariant, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg },
  existingCard: { borderWidth: 1, borderColor: colors.tertiary },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  cardTitle: { color: colors.onSurface, fontWeight: '600' },
  cardText: { color: colors.onSurfaceVariant, marginBottom: 4 },
  radiusInfo: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm },
  radiusText: { color: colors.primary },
  actions: { marginTop: spacing.md },
})
