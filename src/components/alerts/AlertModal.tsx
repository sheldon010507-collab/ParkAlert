import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import * as Haptics from 'expo-haptics'
import { colors, spacing, typography, borderRadius } from '../../constants'

interface AlertModalProps {
  visible: boolean
  distance: number
  onDismiss: () => void
  onExtend: (minutes: number) => void
}

const { width } = Dimensions.get('window')

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  distance,
  onDismiss,
  onExtend,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const soundRef = useRef<Audio.Sound | null>(null)

  useEffect(() => {
    if (visible) {
      playAlertSound()
      startAnimations()
    } else {
      stopAlertSound()
      scaleAnim.setValue(0)
      pulseAnim.setValue(1)
    }

    return () => {
      stopAlertSound()
    }
  }, [visible])

  const playAlertSound = async () => {
    try {
      if (Platform.OS === 'web') {
        const audio = new window.Audio('/alert-sound.mp3')
        audio.loop = true
        audio.play()
        return
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)

      const { sound } = await Audio.Sound.createAsync(
        require('../../../assets/alert-sound.mp3'),
        { shouldPlay: true, isLooping: true }
      )
      soundRef.current = sound
    } catch (error) {
      console.error('Error playing alert sound:', error)
    }
  }

  const stopAlertSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync()
        await soundRef.current.unloadAsync()
        soundRef.current = null
      }
    } catch (error) {
      console.error('Error stopping alert sound:', error)
    }
  }

  const startAnimations = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Ionicons name="warning" size={64} color={colors.error} />
          </Animated.View>

          <Text style={styles.title}>Parking Alert!</Text>
          <Text style={styles.message}>
            You are now {formatDistance(distance)} away from your parked car.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </TouchableOpacity>

            <View style={styles.extendContainer}>
              <Text style={styles.extendTitle}>Remind me again in:</Text>
              {[30, 45, 60].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={styles.extendButton}
                  onPress={() => onExtend(minutes)}
                >
                  <Text style={styles.extendButtonText}>{minutes} min</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: width - spacing.xl * 2,
    width: '100%',
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.sizes.lg,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    width: '100%',
  },
  dismissButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  dismissButtonText: {
    color: colors.background,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
  extendContainer: {
    alignItems: 'center',
  },
  extendTitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  extendButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginVertical: spacing.xs,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  extendButtonText: {
    color: colors.text,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
})
