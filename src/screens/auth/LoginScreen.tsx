import React from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { MaterialButton } from '../../components/common/MaterialButton'
import { MaterialAlert } from '../../components/common/MaterialDialog'
import { useAuth } from '../../contexts/AuthContext'
import { colors } from '../../theme/colors'
import { typography, spacing, radius } from '../../theme/typography'

export function LoginScreen() {
  const navigation = useNavigation()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const { signIn } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    const { error: signInError } = await signIn(email, password)
    setLoading(false)

    if (signInError) {
      setError(signInError.message)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="car" size={64} color={colors.primary} />
          </View>
          <Text style={[styles.title, typography.displaySmall]}>ParkAlert</Text>
          <Text style={[styles.subtitle, typography.bodyLarge]}>
            Community-powered parking protection
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={colors.onSurfaceVariant}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.onSurfaceVariant}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.onSurfaceVariant}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, styles.inputWithIcon]}
              placeholder="Password"
              placeholderTextColor={colors.onSurfaceVariant}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="password"
            />
            <MaterialButton
              title=""
              onPress={() => setShowPassword(!showPassword)}
              variant="text"
              size="small"
              icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            />
          </View>

          <MaterialButton
            title="Sign In"
            onPress={handleLogin}
            variant="filled"
            size="large"
            loading={loading}
            fullWidth
            icon="log-in-outline"
          />
        </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, typography.bodyMedium]}>
          Don't have an account?
        </Text>
        <MaterialButton
          title="Create Account"
          onPress={() => navigation.navigate('Register' as never)}
          variant="text"
          size="medium"
        />
      </View>
      </ScrollView>

      {/* Error Alert */}
      <MaterialAlert
        visible={!!error}
        onDismiss={() => setError(null)}
        title="Sign In Failed"
        message={error || ''}
        type="error"
        primaryLabel="OK"
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.onBackground,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  formSection: {
    width: '100%',
    gap: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.onSurface,
  },
  inputWithIcon: {
    marginRight: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  footerText: {
    color: colors.onSurfaceVariant,
  },
})
