import React from 'react'
import { View, StyleProp, ViewStyle } from 'react-native'

// react-native-maps does not support web.
// This stub prevents import errors when bundling for web.

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
  center?: { latitude: number; longitude: number }
  radius?: number
  strokeColor?: string
  fillColor?: string
}

export function Circle(_props: CircleProps) { return null }

interface CalloutProps {
  children?: React.ReactNode
}

export function Callout({ children }: CalloutProps) { return <>{children}</> }

interface PolylineProps {
  coordinates?: Array<{ latitude: number; longitude: number }>
  strokeColor?: string
  strokeWidth?: number
}

export function Polyline(_props: PolylineProps) { return null }

interface PolygonProps {
  coordinates?: Array<{ latitude: number; longitude: number }>
  strokeColor?: string
  fillColor?: string
  strokeWidth?: number
}

export function Polygon(_props: PolygonProps) { return null }
