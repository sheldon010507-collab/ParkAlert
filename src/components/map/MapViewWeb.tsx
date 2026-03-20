// Web platform stub - react-native-maps does not support web
// This file is used by Metro when bundling for web (via .web.tsx extension)
import React from 'react'
import { View } from 'react-native'

export default function MapView({ children, style }: any) {
  return <View style={style}>{children}</View>
}

export function Marker(_props: any) { return null }
export function Circle(_props: any) { return null }
export function Callout({ children }: any) { return children }
