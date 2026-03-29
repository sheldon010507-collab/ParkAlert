import React, { useState, useEffect, createContext, useContext } from 'react'
import { AppState, AppStateStatus, Platform } from 'react-native'

interface NetworkState {
  isOnline: boolean
  isReachable: boolean
}

interface NetworkContextType {
  isOnline: boolean
  isReachable: boolean
  checkConnection: () => Promise<boolean>
}

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  isReachable: true,
  checkConnection: async () => true,
})

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<NetworkState>({ isOnline: true, isReachable: true })

  const checkConnection = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      const online = navigator.onLine
      setState({ isOnline: online, isReachable: online })
      return online
    }
    return true
  }

  useEffect(() => {
    checkConnection()

    if (Platform.OS === 'web') {
      const handleOnline = () => setState({ isOnline: true, isReachable: true })
      const handleOffline = () => setState({ isOnline: false, isReachable: false })

      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  return (
    <NetworkContext.Provider value={{ ...state, checkConnection }}>
      {children}
    </NetworkContext.Provider>
  )
}

export const useNetwork = () => useContext(NetworkContext)
