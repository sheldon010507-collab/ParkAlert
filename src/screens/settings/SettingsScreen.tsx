import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { MaterialButton } from '../../components/common/MaterialButton'
import { MaterialAlert } from '../../components/common/MaterialDialog'
import { useAuth } from '../../contexts/AuthContext'
import { colors } from '../../theme/colors'
import { typography, spacing, radius } from '../../theme/typography'

export function SettingsScreen() {
  const navigation = useNavigation()
  const { signOut, session } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await signOut()
      // Navigation will happen automatically due to auth state change
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.')
    } finally {
      setLoading(false)
      setShowLogoutConfirm(false)
    }
  }

  const SettingItem = ({
    icon,
    title,
    subtitle,
    children,
  }: {
    icon: keyof typeof Ionicons.glyphMap
    title: string
    subtitle?: string
    children?: React.ReactNode
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, typography.bodyLarge]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, typography.bodySmall]}>
            {subtitle}
          </Text>
        )}
      </View>
      {children}
    </View>
  )

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Info */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, typography.titleMedium]}>
          Account
        </Text>
        <View style={styles.card}>
          <View style={styles.userInfo}>
            <Ionicons name="person-circle" size={48} color={colors.primary} />
            <View style={styles.userText}>
              <Text style={[styles.userEmail, typography.bodyLarge]}>
                {session?.user?.email || 'Unknown'}
              </Text>
              <Text style={[styles.userStatus, typography.bodySmall]}>
                Authenticated
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, typography.titleMedium]}>
          Notifications
        </Text>
        <View style={styles.card}>
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            subtitle="Receive alerts when wardens are nearby"
          >
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.outline, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </SettingItem>
        </View>
      </View>

      {/* Alert Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, typography.titleMedium]}>
          Alert Settings
        </Text>
        <View style={styles.card}>
          <SettingItem
            icon="volume-high"
            title="Sound Alerts"
            subtitle="Play sound when alert triggered"
          >
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: colors.outline, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </SettingItem>
          <View style={styles.divider} />
          <SettingItem
            icon="phone-portrait"
            title="Vibration"
            subtitle="Vibrate on alert"
          >
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: colors.outline, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </SettingItem>
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, typography.titleMedium]}>
          About
        </Text>
        <View style={styles.card}>
          <SettingItem
            icon="information-circle"
            title="Version"
            subtitle="1.0.0"
          />
          <View style={styles.divider} />
          <SettingItem
            icon="document-text"
            title="Privacy Policy"
          />
          <View style={styles.divider} />
          <SettingItem
            icon="help-circle"
            title="Help & Support"
          />
        </View>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <MaterialButton
          title="Sign Out"
          onPress={() => setShowLogoutConfirm(true)}
          variant="outlined"
          size="large"
          fullWidth
          icon="log-out-outline"
          loading={loading}
        />
      </View>

      {/* Logout Confirmation */}
      <MaterialAlert
        visible={showLogoutConfirm}
        onDismiss={() => setShowLogoutConfirm(false)}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        type="warning"
        primaryLabel="Sign Out"
        onPrimaryAction={handleLogout}
        secondaryLabel="Cancel"
        onSecondaryAction={() => setShowLogoutConfirm(false)}
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.primary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...colors.elevation1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  settingIcon: {
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: colors.onSurface,
  },
  settingSubtitle: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginLeft: spacing.md + 24 + spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  userText: {
    marginLeft: spacing.md,
  },
  userEmail: {
    color: colors.onSurface,
  },
  userStatus: {
    color: colors.tertiary,
  },
})
