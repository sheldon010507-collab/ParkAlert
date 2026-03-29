// Web platform stub - react-native-maps does not support web
// This file is used by Metro when bundling for web (via .web.tsx extension)
import React from 'react'
import { View, StyleProp, ViewStyle } from 'react-native'

interface MapViewProps {
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

export default function MapView({ children, style }: MapViewProps) {
  return <View style={style}>{children}</View>
}

interface MarkerProps {
  children?: React.ReactNode
}

export function Marker(_props: MarkerProps) { return null }

interface CircleProps {
  center: { latitude: number; longitude: number }
  radius: number
  strokeColor?: string
  fillColor?: string
}

export function Circle(_props: CircleProps) { return null }

interface CalloutProps {
  children?: React.ReactNode
}

export function Callout({ children }: CalloutProps) { return children ?? null }
