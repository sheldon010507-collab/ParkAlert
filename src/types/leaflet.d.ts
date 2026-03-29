// Leaflet type definitions for TypeScript
declare global {
  interface Window {
    L: LeafletNamespace
  }
}

interface LeafletNamespace {
  map: (element: HTMLElement | string, options?: LeafletMapOptions) => LeafletMap
  tileLayer: (url: string, options?: LeafletTileLayerOptions) => LeafletTileLayer
  marker: (latlng: LeafletLatLng, options?: LeafletMarkerOptions) => LeafletMarker
  circle: (latlng: LeafletLatLng, options?: LeafletCircleOptions) => LeafletCircle
  divIcon: (options: LeafletDivIconOptions) => LeafletIcon
  latLng: (lat: number, lng: number) => LeafletLatLng
}

interface LeafletMapOptions {
  center?: [number, number]
  zoom?: number
}

interface LeafletTileLayerOptions {
  attribution?: string
}

interface LeafletMarkerOptions {
  icon?: LeafletIcon
  draggable?: boolean
  zIndexOffset?: number
}

interface LeafletCircleOptions {
  radius: number
  color?: string
  fillColor?: string
  fillOpacity?: number
  weight?: number
  dashArray?: string
}

interface LeafletDivIconOptions {
  className?: string
  html?: string
  iconSize?: [number, number]
  iconAnchor?: [number, number]
}

interface LeafletLatLng {
  lat: number
  lng: number
}

interface LeafletMap {
  setView: (center: [number, number], zoom: number) => LeafletMap
  on: (event: string, handler: (e: LeafletEvent) => void) => LeafletMap
  off: (event: string, handler?: (e: LeafletEvent) => void) => LeafletMap
  remove: () => void
  removeLayer: (layer: LeafletLayer) => LeafletMap
  addLayer: (layer: LeafletLayer) => LeafletMap
}

interface LeafletLayer {
  addTo: (map: LeafletMap) => LeafletLayer
  bindPopup: (content: string) => LeafletLayer
  on: (event: string, handler: (e: LeafletEvent) => void) => LeafletLayer
  closePopup: () => LeafletLayer
}

interface LeafletTileLayer extends LeafletLayer {}

interface LeafletMarker extends LeafletLayer {
  getLatLng: () => LeafletLatLng
  setLatLng: (latlng: LeafletLatLng) => LeafletMarker
}

interface LeafletCircle extends LeafletLayer {}

interface LeafletIcon {}

interface LeafletEvent {
  latlng: LeafletLatLng
  target: LeafletLayer
}

export type {
  LeafletNamespace,
  LeafletMap,
  LeafletMarker,
  LeafletCircle,
  LeafletIcon,
  LeafletEvent,
  LeafletLatLng,
}
