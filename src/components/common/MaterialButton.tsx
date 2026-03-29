import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Platform, AccessibilityInfo } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../theme/colors'
import { typography, spacing, radius } from '../../theme/typography'

type ButtonVariant = 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal'
type ButtonSize = 'small' | 'medium' | 'large'

interface MaterialButtonProps {
  title: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  icon?: keyof typeof Ionicons.glyphMap
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  accessibilityLabel?: string
  accessibilityHint?: string
  testID?: string
}

export function MaterialButton({
  title,
  onPress,
  variant = 'filled',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: MaterialButtonProps) {
  const getBackgroundColor = () => {
    if (disabled) return colors.surfaceVariant
    switch (variant) {
      case 'filled': return colors.primary
      case 'outlined':
      case 'text': return 'transparent'
      case 'elevated': return colors.surface
      case 'tonal': return colors.secondaryContainer
      default: return colors.primary
    }
  }

  const getTextColor = () => {
    if (disabled) return colors.onSurfaceVariant
    switch (variant) {
      case 'filled': return colors.onPrimary
      case 'outlined':
      case 'text':
      case 'elevated': return colors.primary
      case 'tonal': return colors.onSecondaryContainer
      default: return colors.onPrimary
    }
  }

  const getBorderStyle = () => {
    if (variant === 'outlined') {
      return { borderWidth: 1, borderColor: disabled ? colors.outlineVariant : colors.outline }
    }
    return {}
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small': return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 40 }
      case 'large': return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 56 }
      default: return { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg, minHeight: 48 }
    }
  }

  const getElevation = () => {
    if (disabled) return {}
    if (variant === 'elevated') return colors.elevation2
    if (variant === 'filled') return colors.elevation1
    return {}
  }

  const handlePress = () => {
    if (!disabled && !loading) {
      if (Platform.OS !== 'web') {
        AccessibilityInfo.announceForAccessibility(`${title} pressed`)
      }
      onPress()
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.button, getSizeStyles(), { backgroundColor: getBackgroundColor() }, getBorderStyle(), getElevation(), fullWidth && styles.fullWidth]}
      accessible={true}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={18} color={getTextColor()} style={styles.iconLeft} />
          )}
          <Text style={[styles.text, { color: getTextColor() }, typography.labelLarge]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={18} color={getTextColor()} style={styles.iconRight} />
          )}
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    ...Platform.select({ ios: { overflow: 'hidden' } }),
  },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  text: { textAlign: 'center' },
  iconLeft: { marginRight: spacing.sm },
  iconRight: { marginLeft: spacing.sm },
  fullWidth: { width: '100%' },
})
