"use client"

import { useEffect, useRef, useCallback, useState } from "react"

// ── Same props as CanvasMap — drop-in replacement ────────────────────────────
export interface MapLibreMapProps {
  center: [number, number]
  marker: [number, number] | null
  markerLabel?: string
  isDark: boolean
  onMapClick: (lat: number, lng: number) => void
  onRequestGeo?: () => void
  isGeoLoading?: boolean
  flyToMarkerTick?: number
  markerSource?: "geo" | "search" | "click" | null
}

// ── SVG icon strings (same as CanvasMap) ─────────────────────────────────────
const IconGPS = (color = "currentColor") => `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="8"/>
  <line x1="12" y1="2" x2="12" y2="6"/>
  <line x1="12" y1="18" x2="12" y2="22"/>
  <line x1="2" y1="12" x2="6" y2="12"/>
  <line x1="18" y1="12" x2="22" y2="12"/>
  <circle cx="12" cy="12" r="3" fill="${color}" stroke="none"/>
</svg>`

const IconSearch = (color = "currentColor") => `
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round">
  <circle cx="11" cy="11" r="7"/>
  <line x1="16.5" y1="16.5" x2="22" y2="22"/>
</svg>`

const IconPin = (color = "currentColor") => `
<svg width="13" height="13" viewBox="0 0 24 24" fill="${color}" stroke="none">
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
</svg>`

const IconMyLocation = (color = "currentColor") => `
<svg width="13" height="13" viewBox="0 0 24 24" fill="${color}" stroke="none">
  <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
</svg>`

const IconZoomIn = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`
const IconZoomOut = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`
const IconClose = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
const IconExternalLink = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`

// ── Marker color palette ──────────────────────────────────────────────────────
const PALETTE = {
  geo: { pin: "#22c55e", dark: "#15803d", shadow: "rgba(21,128,61,.5)" },
  search: { pin: "#f97316", dark: "#c2410c", shadow: "rgba(194,65,12,.5)" },
  click: { pin: "#3b82f6", dark: "#1e3a8a", shadow: "rgba(30,58,138,.45)" }
}

// ── Build marker HTML for MapLibre divIcon ────────────────────────────────────
function buildMarkerHTML(src: "geo" | "search" | "click"): string {
  const pal = PALETTE[src]

  const pinShape =
    src === "search"
      ? `style="
          width:20px;height:20px;
          background:linear-gradient(135deg,${pal.pin},${pal.dark});
          border-radius:3px 12px 3px 12px;
          transform:rotate(45deg);
          box-shadow:0 4px 12px ${pal.shadow};
          display:flex;align-items:center;justify-content:center;
        "`
      : `style="
          width:20px;height:20px;
          background:linear-gradient(135deg,${pal.pin},${pal.dark});
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 4px 12px ${pal.shadow};
        "`

  const inner =
    src === "search"
      ? `<span style="transform:rotate(-45deg);color:#fff;font-weight:900;font-size:11px;font-family:sans-serif;">S</span>`
      : `<span style="
            display:block;width:6px;height:6px;
            background:rgba(255,255,255,.9);border-radius:50%;
            position:absolute;top:50%;left:50%;
            transform:rotate(${src === "geo" ? "45deg" : "45deg"}) translate(-50%,-50%);
          "></span>`

  const ripple =
    src === "geo" || src === "search"
      ? `<span style="
            position:absolute;top:50%;left:50%;
            transform:translate(-50%,-50%);
            width:40px;height:40px;border-radius:50%;
            background:${pal.pin}22;
            animation:mlRipple 1.6s ease-out infinite;
            pointer-events:none;
          "></span>
          <span style="
            position:absolute;top:50%;left:50%;
            transform:translate(-50%,-50%);
            width:60px;height:60px;border-radius:50%;
            background:${pal.pin}11;
            animation:mlRipple 1.6s ease-out 0.4s infinite;
            pointer-events:none;
          "></span>`
      : ""

  return `
    <div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center;">
      ${ripple}
      <div ${pinShape}>
        ${inner}
      </div>
    </div>
  `
}

// ─────────────────────────────────────────────────────────────────────────────
export default function MapLibreMap({
  center,
  marker,
  markerLabel = "",
  isDark,
  onMapClick,
  onRequestGeo,
  isGeoLoading = false,
  markerSource = null,
  flyToMarkerTick = 0
}: MapLibreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const initedRef = useRef(false)
  const onClickRef = useRef(onMapClick)
  const isDarkRef = useRef(isDark)

  const [zoom, setZoom] = useState(15)
  const [showCard, setShowCard] = useState(false)
  const [cardInfo, setCardInfo] = useState<{
    label: string
    lat: number
    lng: number
    source: string
  } | null>(null)
  const [geoActive, setGeoActive] = useState(false)

  useEffect(() => {
    onClickRef.current = onMapClick
  }, [onMapClick])

  // ── Init MapLibre ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (initedRef.current) return
    initedRef.current = true

    const el = containerRef.current!

    // Inject global CSS: ripple animation + MapLibre link
    if (!document.getElementById("maplibre-css")) {
      const link = document.createElement("link")
      link.id = "maplibre-css"
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css"
      document.head.appendChild(link)
    }
    if (!document.getElementById("ml-ripple-style")) {
      const style = document.createElement("style")
      style.id = "ml-ripple-style"
      style.textContent = `
        @keyframes mlRipple {
          0%   { transform: translate(-50%,-50%) scale(0.4); opacity: 0.7; }
          100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
        }
        .maplibregl-ctrl-attrib { font-size: 9px !important; }
        .maplibregl-ctrl-attrib-inner a { color: #64748b !important; }
        .maplibregl-canvas { cursor: crosshair !important; }
      `
      document.head.appendChild(style)
    }

    import("maplibre-gl").then((maplibregl) => {
      if (mapRef.current) return

      const map = new maplibregl.Map({
        container: el,
        style: isDarkRef.current
          ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          : "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
        center: [center[1], center[0]], // MapLibre: [lng, lat]
        zoom: 15,
        attributionControl: false
      })

      // Remove default nav controls (we add our own)
      map.dragRotate.disable()
      map.touchZoomRotate.disableRotation()

      map.on("click", (e: any) => {
        onClickRef.current(e.lngLat.lat, e.lngLat.lng)
      })

      map.on("zoom", () => {
        setZoom(Math.round(map.getZoom()))
      })

      // Resize observer
      const ro = new ResizeObserver(() => map.resize())
      ro.observe(el)
      ;(map as any)._ro = ro

      mapRef.current = map
    })

    return () => {
      if (mapRef.current) {
        ;(mapRef.current as any)._ro?.disconnect()
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
      initedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fly to center ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.flyTo({
      center: [center[1], center[0]],
      zoom: Math.max(mapRef.current.getZoom(), 15),
      duration: 700,
      essential: true
    })
  }, [center])

  // ── Fly to marker on tick ──────────────────────────────────────────────────
  useEffect(() => {
    if (!flyToMarkerTick || !marker || !mapRef.current) return
    mapRef.current.flyTo({
      center: [marker[1], marker[0]],
      zoom: Math.max(mapRef.current.getZoom(), 15),
      duration: 700,
      essential: true
    })
  }, [flyToMarkerTick])

  // ── Dark mode: swap map style ──────────────────────────────────────────────
  useEffect(() => {
    isDarkRef.current = isDark
    if (!mapRef.current) return
    mapRef.current.setStyle(
      isDark
        ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
    )
  }, [isDark])

  // ── Update marker ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return

    // Remove old marker
    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }

    if (!marker) return

    const src = markerSource ?? "click"

    import("maplibre-gl").then((maplibregl) => {
      const el = document.createElement("div")
      el.innerHTML = buildMarkerHTML(src)
      el.style.cursor = "pointer"

      const m = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([marker[1], marker[0]])
        .addTo(mapRef.current)

      markerRef.current = m
    })
  }, [marker, markerSource])

  // ── Info card ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (marker && markerSource) {
      setCardInfo({
        label: markerLabel,
        lat: marker[0],
        lng: marker[1],
        source: markerSource
      })
      setShowCard(true)
      setGeoActive(markerSource === "geo")
    } else {
      setShowCard(false)
      setGeoActive(false)
    }
  }, [marker, markerSource, markerLabel])

  // ── Zoom helpers ───────────────────────────────────────────────────────────
  const zoomIn = useCallback(() => {
    if (!mapRef.current) return
    mapRef.current.zoomIn({ duration: 200 })
  }, [])

  const zoomOut = useCallback(() => {
    if (!mapRef.current) return
    mapRef.current.zoomOut({ duration: 200 })
  }, [])

  // ── Styling helpers (same palette as CanvasMap) ────────────────────────────
  const dark = isDark
  const glass = dark ? "rgba(13,13,13,0.92)" : "rgba(255,255,255,0.96)"
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)"
  const shadow = dark
    ? "0 4px 24px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.4)"
    : "0 4px 24px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)"
  const textPrimary = dark ? "#f0f0f0" : "#111"
  const textSecondary = dark ? "#999" : "#666"

  const sourceMeta = {
    geo: {
      label: "Lokasi GPS",
      color: "#22c55e",
      bg: dark ? "rgba(20,83,45,.6)" : "rgba(220,252,231,.8)",
      icon: IconMyLocation("#22c55e")
    },
    search: {
      label: "Hasil Pencarian",
      color: "#f97316",
      bg: dark ? "rgba(67,20,7,.6)" : "rgba(255,247,237,.8)",
      icon: IconSearch("#f97316")
    },
    click: {
      label: "Dipilih Manual",
      color: "#3b82f6",
      bg: dark ? "rgba(15,23,42,.6)" : "rgba(239,246,255,.8)",
      icon: IconPin("#3b82f6")
    }
  }
  const meta = cardInfo
    ? sourceMeta[cardInfo.source as keyof typeof sourceMeta]
    : null

  const shortLabel = (s: string) => {
    if (!s) return ""
    return s
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
      .slice(0, 3)
      .join(", ")
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: "inherit"
      }}
    >
      {/* MapLibre container */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* ── Zoom controls (bottom-right, above GPS btn) ── */}
      <div
        style={{
          position: "absolute",
          right: 12,
          bottom: showCard ? 172 : 68,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          transition: "bottom 0.3s ease",
          zIndex: 10
        }}
      >
        {/* Zoom badge */}
        <div
          style={{
            background: glass,
            border: `1px solid ${border}`,
            borderRadius: 8,
            boxShadow: shadow,
            padding: "3px 0",
            textAlign: "center",
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "'Nunito',sans-serif",
            color: textSecondary,
            width: 36,
            marginBottom: 2
          }}
        >
          {Math.round(zoom)}x
        </div>

        {/* Zoom In */}
        <button
          onClick={zoomIn}
          title="Perbesar"
          style={{
            width: 36,
            height: 36,
            background: glass,
            border: `1px solid ${border}`,
            borderRadius: 8,
            boxShadow: shadow,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: textPrimary,
            transition: "all 0.15s",
            padding: 0
          }}
          dangerouslySetInnerHTML={{ __html: IconZoomIn }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = dark
              ? "rgba(40,40,40,.98)"
              : "rgba(245,245,245,.98)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.background = glass)}
        />

        {/* Zoom Out */}
        <button
          onClick={zoomOut}
          title="Perkecil"
          style={{
            width: 36,
            height: 36,
            background: glass,
            border: `1px solid ${border}`,
            borderRadius: 8,
            boxShadow: shadow,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: textPrimary,
            transition: "all 0.15s",
            padding: 0
          }}
          dangerouslySetInnerHTML={{ __html: IconZoomOut }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = dark
              ? "rgba(40,40,40,.98)"
              : "rgba(245,245,245,.98)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.background = glass)}
        />
      </div>

      {/* ── GPS button (bottom-right) ── */}
      <button
        onClick={() => {
          if (marker && mapRef.current) {
            mapRef.current.flyTo({
              center: [marker[1], marker[0]],
              zoom: Math.max(mapRef.current.getZoom(), 15),
              duration: 700
            })
          }
          onRequestGeo?.()
        }}
        title="Gunakan Lokasi Saya"
        style={{
          position: "absolute",
          right: 12,
          bottom: 20,
          width: 36,
          height: 36,
          background: isGeoLoading
            ? dark
              ? "rgba(20,78,40,.96)"
              : "rgba(220,252,231,.98)"
            : geoActive
              ? dark
                ? "rgba(20,78,40,.88)"
                : "rgba(240,253,244,.98)"
              : glass,
          border: `1.5px solid ${isGeoLoading || geoActive ? "#22c55e" : border}`,
          borderRadius: 8,
          boxShadow: shadow,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
          padding: 0,
          zIndex: 10,
          outline: "none"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {isGeoLoading ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            style={{ animation: "spin 0.8s linear infinite" }}
          >
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <span
            dangerouslySetInnerHTML={{
              __html: IconGPS(
                isGeoLoading || geoActive
                  ? "#22c55e"
                  : dark
                    ? "#9ca3af"
                    : "#555"
              )
            }}
          />
        )}
      </button>

      {/* ── Location info card ── */}
      {showCard && cardInfo && meta && (
        <div
          style={{
            position: "absolute",
            left: 10,
            right: 54,
            bottom: 10,
            background: glass,
            border: `1px solid ${border}`,
            borderRadius: 12,
            boxShadow: shadow,
            overflow: "hidden",
            zIndex: 20,
            animation: "slideUp 0.25s ease",
            fontFamily: "'Nunito',sans-serif"
          }}
        >
          <style>{`
            @keyframes slideUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
          `}</style>

          {/* Accent bar */}
          <div
            style={{
              height: 3,
              background: `linear-gradient(90deg,${meta.color},${meta.color}88)`
            }}
          />

          <div style={{ padding: "10px 12px" }}>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  background: meta.bg,
                  borderRadius: 20,
                  padding: "2px 8px 2px 6px",
                  border: `1px solid ${meta.color}44`
                }}
              >
                <span dangerouslySetInnerHTML={{ __html: meta.icon }} />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: meta.color,
                    letterSpacing: "0.02em"
                  }}
                >
                  {meta.label}
                </span>
              </div>
              <button
                onClick={() => setShowCard(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: textSecondary,
                  padding: 2,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 4,
                  lineHeight: 1
                }}
                dangerouslySetInnerHTML={{ __html: IconClose }}
              />
            </div>

            {/* Location name */}
            <div
              style={
                {
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: textPrimary,
                  lineHeight: 1.4,
                  marginBottom: 5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                } as React.CSSProperties
              }
            >
              {shortLabel(cardInfo.label) || "Lokasi dipilih"}
            </div>

            {/* Coordinates */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8
              }}
            >
              <span
                style={{
                  background: dark
                    ? "rgba(255,255,255,.05)"
                    : "rgba(0,0,0,.04)",
                  border: `1px solid ${border}`,
                  borderRadius: 5,
                  padding: "2px 7px",
                  fontSize: 10,
                  fontFamily: "monospace",
                  color: textSecondary
                }}
              >
                {cardInfo.lat.toFixed(5)}, {cardInfo.lng.toFixed(5)}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 6 }}>
              <a
                href={`https://www.google.com/maps?q=${cardInfo.lat},${cardInfo.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  padding: "6px 0",
                  background: `linear-gradient(135deg,${meta.color},${meta.color}cc)`,
                  color: "#fff",
                  borderRadius: 7,
                  border: "none",
                  fontSize: 11,
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: `0 2px 8px ${meta.color}44`,
                  transition: "opacity 0.15s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = ".88")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: IconExternalLink.replace(
                      'stroke="currentColor"',
                      'stroke="#fff"'
                    )
                  }}
                />
                Buka Google Maps
              </a>

              <button
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `${cardInfo.lat.toFixed(6)},${cardInfo.lng.toFixed(6)}`
                  )
                  const btn = document.getElementById("ml-copy-btn")
                  if (btn) {
                    btn.textContent = "✓ Disalin"
                    setTimeout(() => {
                      btn.textContent = "Salin"
                    }, 1500)
                  }
                }}
                id="ml-copy-btn"
                style={{
                  padding: "6px 10px",
                  background: dark
                    ? "rgba(255,255,255,.07)"
                    : "rgba(0,0,0,.05)",
                  color: textSecondary,
                  border: `1px solid ${border}`,
                  borderRadius: 7,
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "'Nunito',sans-serif",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s"
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = dark
                    ? "rgba(255,255,255,.12)"
                    : "rgba(0,0,0,.09)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = dark
                    ? "rgba(255,255,255,.07)"
                    : "rgba(0,0,0,.05)")
                }
              >
                Salin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Crosshair when no marker ── */}
      {!marker && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            pointerEvents: "none",
            opacity: 0.35,
            zIndex: 5
          }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle
              cx="14"
              cy="14"
              r="6"
              stroke={dark ? "#fff" : "#333"}
              strokeWidth="1.5"
            />
            <line
              x1="14"
              y1="2"
              x2="14"
              y2="8"
              stroke={dark ? "#fff" : "#333"}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="14"
              y1="20"
              x2="14"
              y2="26"
              stroke={dark ? "#fff" : "#333"}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="2"
              y1="14"
              x2="8"
              y2="14"
              stroke={dark ? "#fff" : "#333"}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="20"
              y1="14"
              x2="26"
              y2="14"
              stroke={dark ? "#fff" : "#333"}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </div>
  )
}
