import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../theme/colors'
import { typography, spacing } from '../../theme/typography'
import { ALERT_RADIUS_METERS } from '../../constants'
import type { WardenSighting } from '../../types/database'

declare global { interface Window { L: any } }

interface WebInteractiveMapProps {
  sightings: WardenSighting[]
  userLocation?: { latitude: number; longitude: number } | null
  parkedCar?: { lat: number; lng: number; radius_m: number } | null
  onAddSighting: (data: { lat: number; lng: number; warden_type: string; direction: string; movement: string }) => void
  onMarkCar?: (lat: number, lng: number) => void
  onRemoveCar?: () => void
}

const WARDEN_TYPES = [
  { value: 'council', label: 'Council', color: '#EA4335' },
  { value: 'private', label: 'Private', color: '#FBBC05' },
  { value: 'police', label: 'Police', color: '#1A73E8' },
]

const MOVEMENT_TYPES = [
  { value: 'walking', label: 'Walking' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'driving', label: 'Driving' },
]

export function WebInteractiveMap({ sightings, userLocation, parkedCar, onAddSighting, onMarkCar, onRemoveCar }: WebInteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const carMarkerRef = useRef<any>(null)
  const carCircleRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [selectedType, setSelectedType] = useState('council')
  const [selectedMovement, setSelectedMovement] = useState('walking')
  const [isAdding, setIsAdding] = useState(false)
  const [tempMarker, setTempMarker] = useState<any>(null)
  const [placementData, setPlacementData] = useState<{ lat: number; lng: number; direction: string } | null>(null)

  const center = userLocation || { latitude: 55.8609, longitude: -4.2514 }

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    const init = () => {
      if (!mapRef.current || !window.L) return
      const map = window.L.map(mapRef.current, { center: [center.latitude, center.longitude], zoom: 15 })
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map)
      mapInstanceRef.current = map
      setIsReady(true)
    }

    if (window.L) init()
    else {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = init
      document.head.appendChild(script)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setView([userLocation.latitude, userLocation.longitude], 16)
    }
  }, [userLocation])

  useEffect(() => {
    if (!mapInstanceRef.current || !isReady) return
    const map = mapInstanceRef.current

    markersRef.current.forEach((marker, key) => {
      if (key === 'user') { map.removeLayer(marker); markersRef.current.delete(key) }
    })

    if (userLocation) {
      const userIcon = window.L.divIcon({
        className: 'user-marker',
        html: `<div style="width:24px;height:24px;background:#9C27B0;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(156,39,176,0.5);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })
      const marker = window.L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon, zIndexOffset: 1000 }).addTo(map)
      marker.bindPopup(parkedCar ? '<b>You are here</b><br><small>Car marked nearby</small>' : '<b>You are here</b>')
      markersRef.current.set('user', marker)
    }
  }, [isReady, userLocation, parkedCar])

  useEffect(() => {
    if (!mapInstanceRef.current || !isReady) return
    const map = mapInstanceRef.current

    markersRef.current.forEach((marker, key) => {
      if (key !== 'user' && key !== 'temp') { map.removeLayer(marker); markersRef.current.delete(key) }
    })

    sightings.forEach((sighting) => {
      const typeInfo = WARDEN_TYPES.find(t => t.value === sighting.warden_type) || WARDEN_TYPES[0]
      const icon = window.L.divIcon({
        className: 'sighting-marker',
        html: `<div style="width:16px;height:16px;background:${typeInfo.color};border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })
      const marker = window.L.marker([sighting.lat, sighting.lng], { icon }).addTo(map)
        .bindPopup(`<b>${typeInfo.label}</b><br>Direction: ${sighting.direction}<br>Movement: ${sighting.movement}`)
      markersRef.current.set(sighting.id, marker)
    })
  }, [isReady, sightings])

  useEffect(() => {
    if (!mapInstanceRef.current || !isReady) return
    const map = mapInstanceRef.current

    if (carMarkerRef.current) { map.removeLayer(carMarkerRef.current); carMarkerRef.current = null }
    if (carCircleRef.current) { map.removeLayer(carCircleRef.current); carCircleRef.current = null }

    if (parkedCar) {
      const carIcon = window.L.divIcon({
        className: 'car-marker',
        html: `<div style="width:28px;height:28px;background:#34C759;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(52,199,89,0.5);display:flex;align-items:center;justify-content:center;font-size:16px;">🚗</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })
      carMarkerRef.current = window.L.marker([parkedCar.lat, parkedCar.lng], { icon: carIcon, zIndexOffset: 900 }).addTo(map)
        .bindPopup(`<b>My Car</b><br>Alert radius: ${ALERT_RADIUS_METERS}m`)
      carCircleRef.current = window.L.circle([parkedCar.lat, parkedCar.lng], {
        radius: ALERT_RADIUS_METERS,
        color: '#34C759',
        fillColor: '#34C759',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map)
    }
  }, [isReady, parkedCar])

  useEffect(() => {
    if (!mapInstanceRef.current || !isReady) return
    const map = mapInstanceRef.current

    const handleClick = (e: any) => {
      if (!isAdding) return
      const { lat, lng } = e.latlng
      if (tempMarker) map.removeLayer(tempMarker)
      const icon = window.L.divIcon({
        className: 'temp-marker',
        html: `<div style="width:24px;height:24px;background:#FF3B30;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })
      const marker = window.L.marker([lat, lng], { icon, draggable: true, zIndexOffset: 2000 }).addTo(map)
      setTempMarker(marker)
      setPlacementData({ lat, lng, direction: 'N' })
    }

    map.on('click', handleClick)
    return () => { map.off('click', handleClick) }
  }, [isReady, isAdding, tempMarker])

  const handleStartAdding = () => { setIsAdding(true); setPlacementData(null) }
  const handleCancel = () => {
    setIsAdding(false)
    if (tempMarker && mapInstanceRef.current) mapInstanceRef.current.removeLayer(tempMarker)
    setTempMarker(null)
    setPlacementData(null)
  }
  const handleConfirm = () => {
    if (placementData) {
      onAddSighting({ lat: placementData.lat, lng: placementData.lng, warden_type: selectedType, direction: placementData.direction, movement: selectedMovement })
      handleCancel()
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.typeRow}>
        <View style={styles.rowSection}>
          <Text style={styles.rowLabel}>Type</Text>
          <View style
