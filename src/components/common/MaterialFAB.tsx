import React from 'react'
import { TouchableOpacity, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { colors } from '../../theme/colors'
import { radius, spacing } from '../../theme/typography'

type FABSize = 'small' | 'medium' | 'large'
type FABVariant = 'primary' | 'secondary' | 'tertiary' | 'surface'

interface MaterialFABProps {
  icon: keyof typeof Ionicons.glyphMap
  onPress: () => void
  size?: FABSize
  variant?: FABVariant
  label?: string
  disabled?: boolean
}

export function MaterialFAB({
  icon,
  onPress,
  size = 'medium',
  variant = 'primary',
  label,
  disabled = false,
}: MaterialFABProps) {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 40, iconSize: 20 }
      case 'large':
        return { width: 96, height: 96, iconSize: 32 }
      default:
        return { width: 56, height: 56, iconSize: 24 }
    }
  }

  const getColors = () => {
    switch (variant) {
      case 'secondary':
        return {
          background: colors.secondaryContainer,
          icon: colors.onSecondaryContainer,
        }
      case 'tertiary':
        return {
          background: colors.tertiaryContainer,
          icon: colors.onTertiaryContainer,
        }
      case 'surface':
        return {
          background: colors.surface,
          icon: colors.primary,
        }
      default:
        return {
          background: colors.primaryContainer,
          icon: colors.onPrimaryContainer,
        }
    }
  }

  const sizeStyles = getSize()
  const colorStyles = getColors()

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onPress()
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.fab,
        {
          width: sizeStyles.width,
          height: sizeStyles.height,
          backgroundColor: colorStyles.background,
        },
        disabled && styles.disabled,
      ]}
    >
      <Ionicons
        name={icon}
        size={sizeStyles.iconSize}
        color={colorStyles.icon}
      />
    </TouchableOpacity>
  )
}

// FAB Group for multiple actions
interface FABGroupProps {
  mainAction: {
    icon: keyof typeof Ionicons.glyphMap
    onPress: () => void
    variant?: FABVariant
  }
  secondaryActions?: Array<{
    icon: keyof typeof Ionicons.glyphMap
    onPress: () => void
    label?: string
  }>
}

export function FABGroup({ mainAction, secondaryActions }: FABGroupProps) {
  return (
    <View style={styles.container}>
      {secondaryActions?.map((action, index) => (
        <MaterialFAB
          key={index}
          icon={action.icon}
          onPress={action.onPress}
          size="small"
          variant="surface"
        />
      ))}
      <MaterialFAB
        icon={mainAction.icon}
        onPress={mainAction.onPress}
        variant={mainAction.variant}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    alignItems: 'flex-end',
  },
  fab: {
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...colors.elevation3,
  },
  disabled: {
    opacity: 0.5,
  },
})
