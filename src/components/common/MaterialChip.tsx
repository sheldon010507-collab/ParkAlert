import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../theme/colors'
import { typography, spacing, radius } from '../../theme/typography'

type ChipVariant = 'filled' | 'outlined'
type ChipSize = 'small' | 'medium'

interface MaterialChipProps {
  label: string
  selected?: boolean
  onPress?: () => void
  variant?: ChipVariant
  size?: ChipSize
  disabled?: boolean
  icon?: keyof typeof Ionicons.glyphMap
  avatar?: string
}

export function MaterialChip({
  label,
  selected = false,
  onPress,
  variant = 'outlined',
  size = 'medium',
  disabled = false,
  icon,
  avatar,
}: MaterialChipProps) {
  const getBackgroundColor = () => {
    if (disabled) return colors.surfaceVariant
    if (selected) {
      return variant === 'filled' ? colors.primaryContainer : colors.primaryContainer
    }
    return variant === 'filled' ? colors.surfaceVariant : 'transparent'
  }

  const getTextColor = () => {
    if (disabled) return colors.onSurfaceVariant
    if (selected) return colors.onPrimaryContainer
    return colors.onSurface
  }

  const getBorderStyle = () => {
    if (variant === 'outlined') {
      return {
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.outline,
      }
    }
    return {}
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
          minHeight: 28,
        }
      default:
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          minHeight: 36,
        }
    }
  }

  const getTextStyle = () => {
    return size === 'small' ? typography.labelMedium : typography.labelLarge
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.chip,
        getSizeStyles(),
        { backgroundColor: getBackgroundColor() },
        getBorderStyle(),
        { borderRadius: radius.full },
      ]}
    >
      {avatar && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatar}</Text>
        </View>
      )}
      {icon && !avatar && (
        <Ionicons
          name={icon}
          size={size === 'small' ? 14 : 16}
          color={getTextColor()}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, { color: getTextColor() }, getTextStyle()]}>
        {label}
      </Text>
      {selected && (
        <Ionicons
          name="checkmark"
          size={size === 'small' ? 14 : 16}
          color={getTextColor()}
          style={styles.checkIcon}
        />
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  icon: {
    marginRight: spacing.xs,
  },
  checkIcon: {
    marginLeft: spacing.xs,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  avatarText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
})

// Chip Group for multiple chips
interface ChipGroupProps {
  options: Array<{ value: string; label: string; icon?: keyof typeof Ionicons.glyphMap }>
  selectedValue: string | null
  onSelect: (value: string) => void
  variant?: ChipVariant
  size?: ChipSize
}

export function ChipGroup({
  options,
  selectedValue,
  onSelect,
  variant = 'outlined',
  size = 'medium',
}: ChipGroupProps) {
  return (
    <View style={groupStyles.container}>
      {options.map((option) => (
        <MaterialChip
          key={option.value}
          label={option.label}
          selected={selectedValue === option.value}
          onPress={() => onSelect(option.value)}
          variant={variant}
          size={size}
          icon={option.icon}
        />
      ))}
    </View>
  )
}

const groupStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
})
