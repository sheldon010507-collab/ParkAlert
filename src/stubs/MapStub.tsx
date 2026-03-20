import React from 'react'
import { View } from 'react-native'

// react-native-maps does not support web.
// This stub prevents import errors when bundling for web.

export default function MapView({ children, style }: any) {
  return <View style={style}>{children}</View>
}

export function Marker(_props: any) { return null }
export function Circle(_props: any) { return null }
export function Callout({ children }: any) { return <>{children}</> }
export function Polyline(_props: any) { return null }
export function Polygon(_props: any) { return null }
