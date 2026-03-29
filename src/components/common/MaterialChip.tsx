import React from 'react'
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../theme/colors'
import { typography, spacing, radius } from '../../theme/typography'

type ChipVariant = 'filled' | 'outlined'

interface MaterialChipProps {
  label: string
  selected?: boolean
  onPress: () => void
  variant?: ChipVariant
  icon?: keyof typeof Ionicons.glyphMap
  disabled?: boolean
  accessibilityLabel?: string
}

export function MaterialChip({
  label,
  selected = false,
  onPress,
  variant = 'outlined',
  icon,
  disabled = false,
  accessibilityLabel,
}: MaterialChipProps) {
  const getBackgroundColor = () => {
    if (disabled) return colors.surfaceVariant
    if (selected) return colors.primary
    return variant === 'filled' ? colors.surfaceVariant : 'transparent'
  }

  const getTextColor = () => {
    if (disabled) return colors.onSurfaceVariant
    if (selected) return colors.onPrimary
    return colors.onSurface
  }

  const getBorderColor = () => {
    if (disabled) return colors.outlineVariant
    if (selected) return colors.primary
    return colors.outline
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.chip,
        { backgroundColor: getBackgroundColor(), borderColor: getBorderColor() },
        variant === 'outlined' && styles.outlined,
      ]}
      accessible={true}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={selected ? 'Selected' : 'Not selected'}
      accessibilityRole="checkbox"
      accessibilityState={{ selected, disabled }}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={16}
          color={getTextColor()}
          style={styles.icon}
        />
      )}
      <Text style={[styles.label, { color: getTextColor() }]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    minHeight: 32,
  },
  outlined: {
    borderWidth: 1,
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    ...typography.labelMedium,
  },
})
