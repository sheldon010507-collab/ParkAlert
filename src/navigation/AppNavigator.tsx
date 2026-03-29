import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '../contexts/AuthContext'
import { LoginScreen } from '../screens/auth/LoginScreen'
import { RegisterScreen } from '../screens/auth/RegisterScreen'
import { MapScreen } from '../screens/map/MapScreen'
import { ReportScreen } from '../screens/report/ReportScreen'
import { ParkedScreen } from '../screens/parked/ParkedScreen'
import { RootStackParamList } from '../types/navigation'

const Stack = createNativeStackNavigator<RootStackParamList>()

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  )
}

function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Report"
        component={ReportScreen}
        options={{ title: 'Report Sighting' }}
      />
      <Stack.Screen
        name="Parked"
        component={ParkedScreen}
        options={{ title: 'Mark Parking', presentation: 'modal' }}
      />
    </Stack.Navigator>
  )
}

export function AppNavigator() {
  const { session, loading } = useAuth()

  if (loading) {
    return null
  }

  return (
    <NavigationContainer>
      {session ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  )
}
