import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { MaterialDialog } from '../common/MaterialDialog'
import { WardenSighting } from '../../types/database'
import { wardenColors, wardenLabels } from '../../theme/colors'
import { typography, spacing } from '../../theme/typography'

interface AlertModalProps {
  visible: boolean
  sighting: WardenSighting | null
  distance: number
  onDismiss: () => void
}

export function AlertModal({
  visible,
  sighting,
  distance,
  onDismiss,
}: AlertModalProps) {
  React.useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    }
  }, [visible])

  if (!sighting) return null

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins === 1) return '1 min ago'
    return `${diffMins} mins ago`
  }

  const wardenColor = wardenColors[sighting.warden_type]
  const wardenLabel = wardenLabels[sighting.warden_type]

  return (
    <MaterialDialog
      visible={visible}
      onDismiss={onDismiss}
      title="Warden Nearby!"
      icon="warning"
      iconColor={wardenColor}
      dismissible={false}
      primaryAction={{
        label: 'Dismiss',
        onPress: onDismiss,
        variant: 'filled',
      }}
    >
      <View style={styles.content}>
        <View style={styles.sightingInfo}>
          <View style={[styles.typeIndicator, { backgroundColor: wardenColor }]}>
            <Ionicons
              name={
                sighting.warden_type === 'council'
                  ? 'business'
                  : sighting.warden_type === 'private'
                  ? 'car'
                  : 'shield'
              }
              size={24}
              color="#fff"
            />
          </View>
          <Text style={[styles.typeText, typography.titleMedium]}>
            {wardenLabel}
          </Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="location" size={20} color={wardenColor} />
            <Text style={[styles.detailText, typography.bodyLarge]}>
              <Text style={styles.distanceHighlight}>{distance}m</Text> away
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="compass" size={20} color={wardenColor} />
            <Text style={[styles.detailText, typography.bodyLarge]}>
              Moving {sighting.direction}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="time" size={20} color={wardenColor} />
            <Text style={[styles.detailText, typography.bodyLarge]}>
              {getTimeAgo(sighting.created_at)}
            </Text>
          </View>
        </View>
      </View>
    </MaterialDialog>
  )
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    alignItems: 'center',
  },
  sightingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  typeIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  typeText: {
    color: wardenColors.council,
  },
  details: {
    width: '100%',
    gap: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    color: wardenColors.council,
  },
  distanceHighlight: {
    fontWeight: '700',
    fontSize: 20,
  },
})
