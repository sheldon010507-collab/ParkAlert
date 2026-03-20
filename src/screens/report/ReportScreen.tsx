import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as Location from 'expo-location'
import {
  MaterialButton,
  MaterialChip,
  MaterialAlert,
} from '../../components'
import {
  WARDEN_TYPES,
  COUNT_OPTIONS,
  MOVEMENT_TYPES,
} from '../../constants'
import { useAuth } from '../../contexts/AuthContext'
import { createWardenSighting } from '../../services/warden'
import { RootStackParamList } from '../../types/navigation'
import {
  WardenType,
  CountType,
  DirectionType,
  MovementType,
} from '../../types/database'
import { colors } from '../../theme/colors'
import { typography, spacing, radius } from '../../theme/typography'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Report'>

// Material Design Icons for directions
const DIRECTION_ICONS: Record<DirectionType, { icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  N: { icon: 'arrow-up', label: 'N' },
  NE: { icon: 'arrow-up-circle', label: 'NE' },
  E: { icon: 'arrow-forward', label: 'E' },
  SE: { icon: 'arrow-down-circle', label: 'SE' },
  S: { icon: 'arrow-down', label: 'S' },
  SW: { icon: 'arrow-back-circle', label: 'SW' },
  W: { icon: 'arrow-back', label: 'W' },
  NW: { icon: 'arrow-up-circle', label: 'NW' },
}

export function ReportScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { session } = useAuth()
  const [wardenType, setWardenType] = useState<WardenType | null>(null)
  const [count, setCount] = useState<CountType | null>(null)
  const [direction, setDirection] = useState<DirectionType | null>(null)
  const [movement, setMovement] = useState<MovementType | null>(null)
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setError('Location permission denied')
        setLocationLoading(false)
        return
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
      setLocationLoading(false)
    })()
  }, [])

  const handleSubmit = async () => {
    if (!wardenType || !count || !direction || !movement) {
      setError('Please fill in all fields')
      return
    }

    if (!location) {
      setError('Unable to get your location')
      return
    }

    if (!session?.user?.id) {
      setError('You must be logged in')
      return
    }

    setLoading(true)
    const result = await createWardenSighting(
      {
        lat: location.latitude,
        lng: location.longitude,
        warden_type: wardenType,
        count,
        direction,
        movement,
      },
      session.user.id
    )
    setLoading(false)

    if (result) {
      setSuccess(true)
    } else {
      setError('Failed to submit report. Please try again.')
    }
  }

  const isValid = wardenType && count && direction && movement

  const getWardenIcon = (type: string) => {
    switch (type) {
      case 'council':
        return 'business-outline'
      case 'private':
        return 'car-outline'
      case 'police':
        return 'shield-outline'
      default:
        return 'person-outline'
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="warning" size={32} color={colors.primary} />
        </View>
        <Text style={[styles.headerTitle, typography.headlineSmall]}>
          Report Sighting
        </Text>
        <Text style={[styles.headerSubtitle, typography.bodyMedium]}>
          Help the community stay informed
        </Text>
      </View>

      {/* Location Status */}
      <View style={styles.locationCard}>
        {locationLoading ? (
          <View style={styles.locationLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.locationText, typography.bodyMedium]}>
              Getting location...
            </Text>
          </View>
        ) : location ? (
          <View style={styles.locationSuccess}>
            <Ionicons name="location" size={20} color={colors.tertiary} />
            <Text style={[styles.locationText, typography.bodyMedium]}>
              Location captured
            </Text>
          </View>
        ) : (
          <View style={styles.locationError}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={[styles.locationText, typography.bodyMedium]}>
              Location unavailable
            </Text>
          </View>
        )}
      </View>

      {/* Form Sections */}
      <View style={styles.formSection}>
        <Text style={[styles.sectionTitle, typography.titleMedium]}>
          Warden Type
        </Text>
        <View style={styles.chipGroup}>
          {WARDEN_TYPES.map((type) => (
            <MaterialChip
              key={type.value}
              label={type.label}
              selected={wardenType === type.value}
              onPress={() => setWardenType(type.value as WardenType)}
              variant="outlined"
              icon={getWardenIcon(type.value)}
            />
          ))}
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={[styles.sectionTitle, typography.titleMedium]}>
          Count
        </Text>
        <View style={styles.chipGroup}>
          {COUNT_OPTIONS.map((opt) => (
            <MaterialChip
              key={opt.value}
              label={opt.label}
              selected={count === opt.value}
              onPress={() => setCount(opt.value as CountType)}
              variant="outlined"
            />
          ))}
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={[styles.sectionTitle, typography.titleMedium]}>
          Direction
        </Text>
        <View style={styles.directionGrid}>
          {(Object.keys(DIRECTION_ICONS) as DirectionType[]).map((dir) => (
            <TouchableOpacity
              key={dir}
              style={[
                styles.directionButton,
                direction === dir && styles.directionButtonSelected,
              ]}
              onPress={() => setDirection(dir)}
            >
              <Ionicons
                name={DIRECTION_ICONS[dir].icon}
                size={24}
                color={
                  direction === dir
                    ? colors.onPrimaryContainer
                    : colors.onSurfaceVariant
                }
              />
              <Text
                style={[
                  styles.directionLabel,
                  direction === dir && styles.directionLabelSelected,
                ]}
              >
                {DIRECTION_ICONS[dir].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={[styles.sectionTitle, typography.titleMedium]}>
          Movement
        </Text>
        <View style={styles.chipGroup}>
          {MOVEMENT_TYPES.map((type) => (
            <MaterialChip
              key={type.value}
              label={type.label}
              selected={movement === type.value}
              onPress={() => setMovement(type.value as MovementType)}
              variant="outlined"
            />
          ))}
        </View>
      </View>

      {/* Submit Button */}
      <MaterialButton
        title="Submit Report"
        onPress={handleSubmit}
        variant="filled"
        size="large"
        loading={loading}
        disabled={!isValid || !location}
        fullWidth
        icon="send"
      />

      {/* Alerts */}
      <MaterialAlert
        visible={!!error}
        onDismiss={() => setError(null)}
        title="Error"
        message={error || ''}
        type="error"
      />

      <MaterialAlert
        visible={success}
        onDismiss={() => navigation.goBack()}
        title="Success!"
        message="Warden sighting reported successfully!"
        type="success"
        primaryLabel="OK"
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    color: colors.onBackground,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  locationCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...colors.elevation1,
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  locationSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  locationError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  locationText: {
    color: colors.onSurface,
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  directionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  directionButton: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  directionButtonSelected: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  directionLabel: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
  directionLabelSelected: {
    color: colors.onPrimaryContainer,
    fontWeight: '500',
  },
})
