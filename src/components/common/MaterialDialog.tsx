import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { MaterialButton } from './MaterialButton'
import { colors } from '../../theme/colors'
import { typography, spacing, radius } from '../../theme/typography'

interface MaterialDialogProps {
  visible: boolean
  onDismiss: () => void
  title?: string
  content?: string
  icon?: keyof typeof Ionicons.glyphMap
  iconColor?: string
  primaryAction?: {
    label: string
    onPress: () => void
    variant?: 'filled' | 'tonal'
  }
  secondaryAction?: {
    label: string
    onPress: () => void
  }
  dismissible?: boolean
  children?: React.ReactNode
}

export function MaterialDialog({
  visible,
  onDismiss,
  title,
  content,
  icon,
  iconColor = colors.primary,
  primaryAction,
  secondaryAction,
  dismissible = true,
  children,
}: MaterialDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissible ? onDismiss : undefined}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback
        onPress={dismissible ? onDismiss : undefined}
        disabled={!dismissible}
      >
        <View style={styles.overlay}>
          <BlurView
            intensity={Platform.OS === 'ios' ? 20 : 40}
            tint="dark"
            style={styles.blur}
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.container}>
                {icon && (
                  <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
                    <Ionicons name={icon} size={32} color={iconColor} />
                  </View>
                )}

                {title && (
                  <Text style={[styles.title, typography.headlineSmall]}>
                    {title}
                  </Text>
                )}

                {content && (
                  <Text style={[styles.content, typography.bodyMedium]}>
                    {content}
                  </Text>
                )}

                {children}

                {(primaryAction || secondaryAction) && (
                  <View style={styles.actions}>
                    {secondaryAction && (
                      <MaterialButton
                        title={secondaryAction.label}
                        onPress={secondaryAction.onPress}
                        variant="text"
                        size="medium"
                      />
                    )}
                    {primaryAction && (
                      <MaterialButton
                        title={primaryAction.label}
                        onPress={primaryAction.onPress}
                        variant={primaryAction.variant || 'filled'}
                        size="medium"
                      />
                    )}
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </BlurView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

// Alert Dialog - Simplified version for alerts
interface MaterialAlertProps {
  visible: boolean
  onDismiss: () => void
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  primaryLabel?: string
  onPrimaryAction?: () => void
  secondaryLabel?: string
  onSecondaryAction?: () => void
}

export function MaterialAlert({
  visible,
  onDismiss,
  title,
  message,
  type = 'info',
  primaryLabel = 'OK',
  onPrimaryAction,
  secondaryLabel,
  onSecondaryAction,
}: MaterialAlertProps) {
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: 'checkmark-circle' as const, color: colors.tertiary }
      case 'warning':
        return { icon: 'warning' as const, color: colors.warning }
      case 'error':
        return { icon: 'close-circle' as const, color: colors.error }
      default:
        return { icon: 'information-circle' as const, color: colors.primary }
    }
  }

  const { icon, color } = getIconAndColor()

  return (
    <MaterialDialog
      visible={visible}
      onDismiss={onDismiss}
      title={title}
      content={message}
      icon={icon}
      iconColor={color}
      primaryAction={{
        label: primaryLabel,
        onPress: onPrimaryAction || onDismiss,
        variant: 'filled',
      }}
      secondaryAction={
        secondaryLabel
          ? {
              label: secondaryLabel,
              onPress: onSecondaryAction || onDismiss,
            }
          : undefined
      }
    />
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    ...colors.elevation4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  content: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    gap: spacing.sm,
  },
})
