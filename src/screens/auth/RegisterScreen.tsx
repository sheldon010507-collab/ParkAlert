import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { MaterialButton } from '../../components/common/MaterialButton'
import { MaterialAlert } from '../../components/common/MaterialDialog'
import { useAuth } from '../../contexts/AuthContext'
import { colors } from '../../theme/colors'
import { typography, spacing, radius } from '../../theme/typography'

interface PasswordStrength {
  score: number
  label: string
  color: string
}

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { score, label: 'Weak', color: colors.error }
  if (score <= 4) return { score, label: 'Medium', color: colors.warning }
  return { score, label: 'Strong', color: colors.tertiary }
}

export function RegisterScreen() {
  const navigation = useNavigation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { signUp } = useAuth()

  const passwordStrength = getPasswordStrength(password)

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (passwordStrength.score <= 2) {
      setError('Password is too weak. Add uppercase, numbers, or symbols')
      return
    }

    setLoading(true)
    const { error: signUpError } = await signUp(email, password)
    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
    } else {
      setSuccess(true)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="car" size={64} color={colors.primary} />
          </View>
          <Text style={[styles.title, typography.displaySmall]}>ParkAlert</Text>
          <Text style={[styles.subtitle, typography.bodyLarge]}>Join the community</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.onSurfaceVariant} style={styles.inputIcon} />
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
            <Ionicons name="lock-closed-outline" size={20} color={colors.onSurfaceVariant} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password (min 8 characters)"
              placeholderTextColor={colors.onSurfaceVariant}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="newPassword"
            />
            <MaterialButton title="" onPress={() => setShowPassword(!showPassword)} variant="text" size="small" icon={showPassword ? 'eye-off-outline' : 'eye-outline'} />
          </View>

          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                <View style={[styles.strengthFill, { width: `${(passwordStrength.score / 6) * 100}%`, backgroundColor: passwordStrength.color }]} />
              </View>
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>{passwordStrength.label}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.onSurfaceVariant} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={colors.onSurfaceVariant}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              textContentType="password"
            />
            <MaterialButton title="" onPress={() => setShowConfirmPassword(!showConfirmPassword)} variant="text" size="small" icon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} />
          </View>

          <MaterialButton title="Create Account" onPress={handleRegister} variant="filled" size="large" loading={loading} fullWidth icon="person-add" />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, typography.bodyMedium]}>Already have an account?</Text>
          <MaterialButton title="Sign In" onPress={() => navigation.navigate('Login' as never)} variant="text" size="medium" />
        </View>
      </ScrollView>

      <MaterialAlert visible={!!error} onDismiss={() => setError(null)} title="Registration Failed" message={error || ''} type="error" />
      <MaterialAlert visible={success} onDismiss={() => setSuccess(false)} title="Account Created!" message="Please check your email for verification." type="success" />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  logoSection: { alignItems: 'center', marginBottom: spacing.xl },
  logoContainer: { width: 120, height: 120, borderRadius: radius.xl, backgroundColor: colors.primaryContainer, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  title: { color: colors.onBackground, marginBottom: spacing.xs },
  subtitle: { color: colors.onSurfaceVariant, textAlign: 'center' },
  formSection: { width: '100%', gap: spacing.md },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.outline, paddingHorizontal: spacing.md, height: 56 },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, fontSize: 16, color: colors.onSurface },
  strengthContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  strengthBar: { flex: 1, height: 4, backgroundColor: colors.outlineVariant, borderRadius: 2 },
  strengthFill: { height: '100%', borderRadius: 2 },
  strengthText: { fontSize: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl, gap: spacing.sm },
  footerText: { color: colors.onSurfaceVariant },
})
