import 'react-native-gesture-handler'
import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthProvider } from './src/contexts/AuthContext'
import { ParkingProvider } from './src/contexts/ParkingContext'
import { NetworkProvider } from './src/contexts/NetworkContext'
import AppNavigator from './src/navigation/AppNavigator'
import './src/utils/logger'

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NetworkProvider>
          <AuthProvider>
            <ParkingProvider>
              <AppNavigator />
              <StatusBar style="auto" />
            </ParkingProvider>
          </AuthProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
