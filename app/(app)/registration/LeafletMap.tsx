"use client"

import { useEffect, useRef, useState } from "react"

interface LeafletMapProps {
  center: [number, number]
  marker: [number, number] | null
  isDark: boolean
  onMapClick: (lat: number, lng: number) => void
}

export default function LeafletMap({
  center,
  marker,
  isDark,
  onMapClick
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [ready, setReady] = useState(false)

  const onMapClickRef = useRef(onMapClick)
  useEffect(() => {
    onMapClickRef.current = onMapClick
  }, [onMapClick])

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return
    if (mapRef.current) return

    const el = containerRef.current as any
    if (el._leaflet_id) el._leaflet_id = null

    let destroyed = false

    import("leaflet").then((L) => {
      if (destroyed || !containerRef.current) return
      if (mapRef.current) return

      const el2 = containerRef.current as any
      if (el2._leaflet_id) el2._leaflet_id = null

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
      })

      const blueIcon = L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;background:#1e3a8a;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 12px rgba(30,58,138,0.5);"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30]
      })

      const map = L.map(containerRef.current!, {
        center,
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: true
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map)

      map.on("click", (e: any) => {
        onMapClickRef.current(e.latlng.lat, e.latlng.lng)
      })

      if (marker) {
        markerRef.current = L.marker(marker, { icon: blueIcon }).addTo(map)
      }

      mapRef.current = map
      ;(mapRef.current as any)._blueIcon = blueIcon

      // ── invalidateSize berkali-kali untuk memastikan ukuran benar ──
      // Panggil di beberapa titik karena MUI Modal punya animasi
      const invalidate = () => {
        if (mapRef.current) mapRef.current.invalidateSize(true)
      }
      setTimeout(invalidate, 50)
      setTimeout(invalidate, 150)
      setTimeout(invalidate, 350)
      setTimeout(invalidate, 600)

      // ── ResizeObserver: pantau perubahan ukuran container secara real-time ──
      if (typeof ResizeObserver !== "undefined" && containerRef.current) {
        const ro = new ResizeObserver(() => {
          if (mapRef.current) mapRef.current.invalidateSize(true)
        })
        ro.observe(containerRef.current)
        ;(mapRef.current as any)._resizeObserver = ro
      }

      setReady(true)
    })

    return () => {
      destroyed = true
      if (mapRef.current) {
        const ro = (mapRef.current as any)._resizeObserver
        if (ro) ro.disconnect()
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
        setReady(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Sync center ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.flyTo(center, Math.max(mapRef.current.getZoom(), 15), {
      duration: 1.2
    })
  }, [center])

  // ── Sync marker ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !ready) return
    import("leaflet").then((L) => {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
      if (marker) {
        const icon = (mapRef.current as any)._blueIcon
        markerRef.current = L.marker(marker, { icon }).addTo(mapRef.current)
      }
    })
  }, [marker, ready])

  return (
    <>
      <style>{`
        .leaflet-container {
          font-family: 'Nunito', sans-serif !important;
        }
        .leaflet-control-attribution { font-size: 9px !important; }
        .leaflet-tile-pane { filter: ${isDark ? "brightness(0.75) saturate(0.8)" : "none"}; }
        .leaflet-control-zoom a {
          color: ${isDark ? "#F5F5F0" : "#0f172a"} !important;
          background: ${isDark ? "#111" : "#fff"} !important;
          border-color: ${isDark ? "#1f1f1f" : "#e2e8f0"} !important;
        }
      `}</style>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "320px",
          display: "block"
        }}
      />
    </>
  )
}
