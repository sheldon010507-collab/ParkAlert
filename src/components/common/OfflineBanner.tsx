import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNetwork } from '../../contexts/NetworkContext'
import { colors } from '../../theme/colors'
import { typography, spacing } from '../../theme/typography'

export function OfflineBanner() {
  const { isOnline } = useNetwork()

  if (isOnline) return null

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline" size={16} color={colors.onError} />
      <Text style={styles.text}>You are offline. Some features may be limited.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  text: {
    ...typography.labelSmall,
    color: colors.onError,
  },
})
