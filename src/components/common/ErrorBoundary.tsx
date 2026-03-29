import React from 'react'
import { View, Text, StyleSheet, Platform } from 'react-native'
import { MaterialButton } from './MaterialButton'
import { colors } from '../../theme/colors'
import { typography, spacing } from '../../theme/typography'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error in development
    if (__DEV__) {
      console.error('ErrorBoundary caught:', error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={[styles.emoji]}>😵</Text>
            <Text style={[styles.title, typography.headlineSmall]}>
              Something went wrong
            </Text>
            <Text style={[styles.message, typography.bodyMedium]}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            <MaterialButton
              title="Try Again"
              onPress={this.handleReset}
              variant="filled"
              size="large"
            />
          </View>
        </View>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.onBackground,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
})
