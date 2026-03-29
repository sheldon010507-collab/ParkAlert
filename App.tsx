import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from './src/contexts/AuthContext'
import { NetworkProvider } from './src/contexts/NetworkContext'
import { AppNavigator } from './src/navigation/AppNavigator'
import { ErrorBoundary } from './src/components/error'
import { OfflineBanner } from './src/components/common/OfflineBanner'

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <NetworkProvider>
          <AuthProvider>
            <OfflineBanner />
            <StatusBar style="auto" />
            <AppNavigator />
          </AuthProvider>
        </NetworkProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  )
}
