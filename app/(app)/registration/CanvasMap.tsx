"use client"

import { useEffect, useRef, useCallback, useState } from "react"

export interface CanvasMapProps {
  center: [number, number]
  marker: [number, number] | null
  markerLabel?: string // nama lokasi lengkap dari reverse geocode
  isDark: boolean
  onMapClick: (lat: number, lng: number) => void
  onRequestGeo?: () => void
  isGeoLoading?: boolean
  /** "geo" → hijau+ripple | "search" → oranye+ripple | "click" → biru */
  markerSource?: "geo" | "search" | "click" | null
}

// ── tile math ─────────────────────────────────────────────────────────────────
const lon2tile = (lon: number, z: number) => ((lon + 180) / 360) * 2 ** z
const lat2tile = (lat: number, z: number) =>
  ((1 -
    Math.log(
      Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
    ) /
      Math.PI) /
    2) *
  2 ** z
const tile2lon = (x: number, z: number) => (x / 2 ** z) * 360 - 180
const tile2lat = (y: number, z: number) => {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** z
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
}

const TILE_SIZE = 256
const MIN_ZOOM = 3
const MAX_ZOOM = 19
const tileCache = new Map<string, HTMLImageElement>()

interface FlyState {
  fLat: number
  fLon: number
  fZ: number
  tLat: number
  tLon: number
  tZ: number
  t0: number
  dur: number
}
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2

// ── SVG icons as strings (rendered into HTML overlay) ────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
export default function CanvasMap({
  center,
  marker,
  markerLabel = "",
  isDark,
  onMapClick,
  onRequestGeo,
  isGeoLoading = false,
  markerSource = null
}: CanvasMapProps) {
  const cvs = useRef<HTMLCanvasElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const zR = useRef(15)
  const cR = useRef<[number, number]>(center)
  const prevC = useRef<[number, number]>(center)
  const dragging = useRef(false)
  const moved = useRef(false)
  const lm = useRef({ x: 0, y: 0 })
  const markerR = useRef(marker)
  const darkR = useRef(isDark)
  const srcR = useRef(markerSource)
  const geoLdR = useRef(isGeoLoading)
  const labelR = useRef(markerLabel)
  const pending = useRef(new Set<string>())
  const raf = useRef<number | null>(null)
  const flyR = useRef<FlyState | null>(null)
  const pulseT = useRef(0)
  const pulseRAF = useRef<number | null>(null)
  const srRef = useRef<() => void>(() => {})
  const rfRef = useRef<() => void>(() => {})
  const tStart = useRef<{ x: number; y: number; dist: number } | null>(null)

  // React state — only for overlay UI re-renders
  const [zoom, setZoom] = useState(15)
  const [showCard, setShowCard] = useState(false)
  const [cardInfo, setCardInfo] = useState<{
    label: string
    lat: number
    lng: number
    source: string
  } | null>(null)
  const [geoActive, setGeoActive] = useState(false)

  // ── sync props → refs ──────────────────────────────────────────────────────
  useEffect(() => {
    const [pLat, pLon] = prevC.current
    const [nLat, nLon] = center
    if (pLat !== nLat || pLon !== nLon) {
      flyR.current = {
        fLat: cR.current[0],
        fLon: cR.current[1],
        fZ: zR.current,
        tLat: nLat,
        tLon: nLon,
        tZ: Math.max(zR.current, 15),
        t0: performance.now(),
        dur: 700
      }
      prevC.current = center
    }
    srRef.current()
  }, [center])

  useEffect(() => {
    markerR.current = marker
    srRef.current()
  }, [marker])
  useEffect(() => {
    darkR.current = isDark
    srRef.current()
  }, [isDark])
  useEffect(() => {
    srcR.current = markerSource
  }, [markerSource])
  useEffect(() => {
    geoLdR.current = isGeoLoading
    srRef.current()
  }, [isGeoLoading])
  useEffect(() => {
    labelR.current = markerLabel
  }, [markerLabel])

  // When marker + source changes, update info card
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

  // ── pulse loop ─────────────────────────────────────────────────────────────
  const stopPulse = useCallback(() => {
    if (pulseRAF.current) {
      cancelAnimationFrame(pulseRAF.current)
      pulseRAF.current = null
    }
  }, [])
  const startPulse = useCallback(() => {
    if (pulseRAF.current) return
    const tick = () => {
      pulseT.current = (pulseT.current + 0.016) % 1
      srRef.current()
      pulseRAF.current = requestAnimationFrame(tick)
    }
    pulseRAF.current = requestAnimationFrame(tick)
  }, [])
  useEffect(() => {
    if (markerSource === "geo" || markerSource === "search") startPulse()
    else stopPulse()
    return stopPulse
  }, [markerSource, startPulse, stopPulse])

  useEffect(() => {
    if (!isGeoLoading) return
    const id = setInterval(() => srRef.current(), 40)
    return () => clearInterval(id)
  }, [isGeoLoading])

  // ── zoom helper ────────────────────────────────────────────────────────────
  const zoomAt = useCallback((delta: number, px?: number, py?: number) => {
    const el = wrap.current
    if (!el) return
    const W = el.clientWidth,
      H = el.clientHeight
    const oZ = zR.current
    const nZ = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, oZ + delta))
    if (nZ === oZ) return
    if (px !== undefined && py !== undefined) {
      const [lat, lon] = cR.current
      cR.current = [
        tile2lat(
          lat2tile(lat, oZ) + ((py - H / 2) / TILE_SIZE) * (1 - 2 ** delta),
          nZ
        ),
        tile2lon(
          lon2tile(lon, oZ) + ((px - W / 2) / TILE_SIZE) * (1 - 2 ** delta),
          nZ
        )
      ]
    }
    zR.current = nZ
    setZoom(nZ)
    srRef.current()
  }, [])

  // ── main render (canvas only — tiles + marker + ripple) ───────────────────
  const renderFrame = useCallback(() => {
    const canvas = cvs.current,
      container = wrap.current
    if (!canvas || !container) return
    const W = container.clientWidth,
      H = container.clientHeight
    if (!W || !H) return
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W
      canvas.height = H
    }
    const ctx = canvas.getContext("2d")!

    // fly
    if (flyR.current) {
      const f = flyR.current
      const t = Math.min(1, (performance.now() - f.t0) / f.dur)
      const e = ease(t)
      cR.current = [
        f.fLat + (f.tLat - f.fLat) * e,
        f.fLon + (f.tLon - f.fLon) * e
      ]
      zR.current = f.fZ + (f.tZ - f.fZ) * e
      if (t < 1) setTimeout(() => srRef.current(), 16)
      else {
        flyR.current = null
        setZoom(Math.round(zR.current))
      }
    }

    const dark = darkR.current
    const zoom = zR.current
    const [lat, lon] = cR.current

    ctx.fillStyle = dark ? "#1a1a2e" : "#e8e8e8"
    ctx.fillRect(0, 0, W, H)

    const cx = lon2tile(lon, zoom),
      cy = lat2tile(lat, zoom)
    const ox = W / 2 - (cx % 1) * TILE_SIZE,
      oy = H / 2 - (cy % 1) * TILE_SIZE
    const maxT = 2 ** Math.floor(zoom)
    const sTX = Math.floor(cx) - Math.ceil(W / 2 / TILE_SIZE) - 1
    const eTX = Math.floor(cx) + Math.ceil(W / 2 / TILE_SIZE) + 2
    const sTY = Math.floor(cy) - Math.ceil(H / 2 / TILE_SIZE) - 1
    const eTY = Math.floor(cy) + Math.ceil(H / 2 / TILE_SIZE) + 2

    for (let tx = sTX; tx <= eTX; tx++) {
      for (let ty = sTY; ty <= eTY; ty++) {
        if (ty < 0 || ty >= maxT) continue
        const wtx = ((tx % maxT) + maxT) % maxT
        const px = ox + (tx - Math.floor(cx)) * TILE_SIZE
        const py = oy + (ty - Math.floor(cy)) * TILE_SIZE
        const key = `${Math.floor(zoom)}/${wtx}/${ty}`
        let img = tileCache.get(key)
        if (!img) {
          if (!pending.current.has(key)) {
            pending.current.add(key)
            const im = new Image()
            im.crossOrigin = "anonymous"
            im.src = `https://${["a", "b", "c"][Math.abs(wtx + ty) % 3]}.tile.openstreetmap.org/${Math.floor(zoom)}/${wtx}/${ty}.png`
            im.onload = () => {
              tileCache.set(key, im)
              pending.current.delete(key)
              srRef.current()
            }
            im.onerror = () => pending.current.delete(key)
          }
          ctx.fillStyle = dark ? "#16213e" : "#d8d8d8"
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE)
          continue
        }
        if (dark) {
          ctx.save()
          ctx.filter = "brightness(.62) saturate(.65)"
          ctx.drawImage(img, px, py, TILE_SIZE, TILE_SIZE)
          ctx.filter = "none"
          ctx.restore()
        } else {
          ctx.drawImage(img, px, py, TILE_SIZE, TILE_SIZE)
        }
      }
    }

    // ── marker on canvas ─────────────────────────────────────────────────────
    const m = markerR.current
    const src = srcR.current
    if (m) {
      const mx = W / 2 + (lon2tile(m[1], zoom) - cx) * TILE_SIZE
      const my = H / 2 + (lat2tile(m[0], zoom) - cy) * TILE_SIZE
      const pt = pulseT.current

      const colors = {
        geo: {
          pin: "#22c55e",
          dark: "#15803d",
          ring: "rgba(34,197,94,",
          shadow: "rgba(21,128,61,.5)"
        },
        search: {
          pin: "#f97316",
          dark: "#c2410c",
          ring: "rgba(249,115,22,",
          shadow: "rgba(194,65,12,.5)"
        },
        click: {
          pin: "#3b82f6",
          dark: "#1e3a8a",
          ring: "rgba(59,130,246,",
          shadow: "rgba(30,58,138,.45)"
        }
      }
      const pal = colors[src ?? "click"]

      // ripple rings
      if (src === "geo") {
        ;[
          { ph: 0, maxR: 38, a: 0.38 },
          { ph: 0.38, maxR: 56, a: 0.2 },
          { ph: 0.72, maxR: 68, a: 0.1 }
        ].forEach(({ ph, maxR, a }) => {
          const t = (pt + ph) % 1
          ctx.beginPath()
          ctx.arc(mx, my, t * maxR, 0, Math.PI * 2)
          ctx.strokeStyle = pal.ring + a * (1 - t) + ")"
          ctx.lineWidth = 2
          ctx.stroke()
        })
        ctx.beginPath()
        ctx.arc(mx, my, 22, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(34,197,94,.08)"
        ctx.fill()
        ctx.strokeStyle = "rgba(34,197,94,.28)"
        ctx.lineWidth = 1.5
        ctx.stroke()
      } else if (src === "search") {
        ;[
          { ph: 0, maxR: 32, a: 0.42 },
          { ph: 0.5, maxR: 48, a: 0.2 }
        ].forEach(({ ph, maxR, a }) => {
          const t = (pt + ph) % 1
          const rr = t * maxR
          ctx.save()
          ctx.translate(mx, my)
          ctx.rotate(Math.PI / 4)
          ctx.beginPath()
          ctx.rect(-rr / 1.4, -rr / 1.4, rr * 1.414, rr * 1.414)
          ctx.restore()
          ctx.strokeStyle = pal.ring + a * (1 - t) + ")"
          ctx.lineWidth = 2
          ctx.stroke()
        })
      }

      // shadow
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(mx, my + 3, 9, 4.5, 0, 0, Math.PI * 2)
      ctx.fillStyle = pal.shadow
      ctx.filter = "blur(3px)"
      ctx.fill()
      ctx.filter = "none"
      ctx.restore()

      // pin
      ctx.save()
      ctx.translate(mx, my - 24)
      const g = ctx.createLinearGradient(-11, -11, 11, 11)
      g.addColorStop(0, pal.pin)
      g.addColorStop(1, pal.dark)

      if (src === "search") {
        ctx.rotate(Math.PI / 4)
        ctx.beginPath()
        ctx.roundRect(-10, -10, 20, 20, [3, 12, 3, 12])
        ctx.fillStyle = g
        ctx.shadowColor = pal.shadow
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.save()
        ctx.rotate(-Math.PI / 4)
        ctx.fillStyle = "#fff"
        ctx.shadowBlur = 0
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("S", 0, 0)
        ctx.restore()
      } else if (src === "geo") {
        ctx.beginPath()
        ctx.roundRect(-10, -10, 20, 20, [50, 50, 50, 0])
        ctx.fillStyle = g
        ctx.shadowColor = pal.shadow
        ctx.shadowBlur = 12
        ctx.fill()
        const ir = 3.5 + Math.sin(pt * Math.PI * 2) * 1.2
        ctx.beginPath()
        ctx.arc(0, 0, ir, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255,255,255,.9)"
        ctx.shadowBlur = 0
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.roundRect(-10, -10, 20, 20, [50, 50, 50, 0])
        ctx.fillStyle = g
        ctx.shadowColor = pal.shadow
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.beginPath()
        ctx.arc(0, 0, 4, 0, Math.PI * 2)
        ctx.fillStyle = "#fff"
        ctx.shadowBlur = 0
        ctx.fill()
      }
      ctx.restore()
    }

    // attribution
    ctx.fillStyle = "rgba(255,255,255,.78)"
    ctx.fillRect(W - 206, H - 18, 206, 18)
    ctx.fillStyle = "#444"
    ctx.font = "9px sans-serif"
    ctx.textAlign = "right"
    ctx.textBaseline = "alphabetic"
    ctx.fillText("© OpenStreetMap contributors", W - 4, H - 5)
  }, [zoomAt])

  useEffect(() => {
    rfRef.current = renderFrame
  }, [renderFrame])
  const scheduleRender = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => rfRef.current())
  }, [])
  useEffect(() => {
    srRef.current = scheduleRender
  }, [scheduleRender])

  // ── mouse events ───────────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    moved.current = false
    lm.current = { x: e.clientX, y: e.clientY }
  }, [])
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - lm.current.x,
      dy = e.clientY - lm.current.y
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved.current = true
    lm.current = { x: e.clientX, y: e.clientY }
    const [lat, lon] = cR.current,
      z = zR.current
    cR.current = [
      tile2lat(lat2tile(lat, z) - dy / TILE_SIZE, z),
      tile2lon(lon2tile(lon, z) - dx / TILE_SIZE, z)
    ]
    srRef.current()
  }, [])
  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging.current) return
      dragging.current = false
      if (moved.current) return
      const canvas = cvs.current,
        container = wrap.current
      if (!canvas || !container) return
      const rect = canvas.getBoundingClientRect()
      const px = e.clientX - rect.left,
        py = e.clientY - rect.top
      const W = container.clientWidth,
        H = container.clientHeight
      const [lat, lon] = cR.current,
        z = zR.current
      onMapClick(
        tile2lat(lat2tile(lat, z) + (py - H / 2) / TILE_SIZE, z),
        tile2lon(lon2tile(lon, z) + (px - W / 2) / TILE_SIZE, z)
      )
    },
    [onMapClick]
  )
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const canvas = cvs.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      zoomAt(e.deltaY < 0 ? 1 : -1, e.clientX - rect.left, e.clientY - rect.top)
    },
    [zoomAt]
  )

  // ── touch events ───────────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      dragging.current = true
      moved.current = false
      lm.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      tStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        dist: 0
      }
    } else if (e.touches.length === 2) {
      dragging.current = false
      const dx = e.touches[0].clientX - e.touches[1].clientX,
        dy = e.touches[0].clientY - e.touches[1].clientY
      tStart.current = { x: 0, y: 0, dist: Math.sqrt(dx * dx + dy * dy) }
    }
  }, [])
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      if (e.touches.length === 1 && dragging.current) {
        const dx = e.touches[0].clientX - lm.current.x,
          dy = e.touches[0].clientY - lm.current.y
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved.current = true
        lm.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        const [lat, lon] = cR.current,
          z = zR.current
        cR.current = [
          tile2lat(lat2tile(lat, z) - dy / TILE_SIZE, z),
          tile2lon(lon2tile(lon, z) - dx / TILE_SIZE, z)
        ]
        srRef.current()
      } else if (e.touches.length === 2 && tStart.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX,
          dy = e.touches[0].clientY - e.touches[1].clientY
        const nd = Math.sqrt(dx * dx + dy * dy),
          r = nd / (tStart.current.dist || nd)
        if (r > 1.15) {
          zoomAt(1)
          tStart.current.dist = nd
        } else if (r < 0.87) {
          zoomAt(-1)
          tStart.current.dist = nd
        }
      }
    },
    [zoomAt]
  )
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!tStart.current || e.changedTouches.length !== 1) return
      const dx = Math.abs(e.changedTouches[0].clientX - tStart.current.x)
      const dy = Math.abs(e.changedTouches[0].clientY - tStart.current.y)
      dragging.current = false
      if (dx < 8 && dy < 8 && !moved.current) {
        const canvas = cvs.current,
          container = wrap.current
        if (!canvas || !container) return
        const rect = canvas.getBoundingClientRect()
        const px = e.changedTouches[0].clientX - rect.left,
          py = e.changedTouches[0].clientY - rect.top
        const W = container.clientWidth,
          H = container.clientHeight
        const [lat, lon] = cR.current,
          z = zR.current
        onMapClick(
          tile2lat(lat2tile(lat, z) + (py - H / 2) / TILE_SIZE, z),
          tile2lon(lon2tile(lon, z) + (px - W / 2) / TILE_SIZE, z)
        )
      }
    },
    [onMapClick]
  )

  // ── setup ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = cvs.current,
      container = wrap.current
    if (!canvas || !container) return
    canvas.addEventListener("wheel", handleWheel, { passive: false })
    const ro = new ResizeObserver(() => srRef.current())
    ro.observe(container)
    srRef.current()
    setTimeout(() => srRef.current(), 50)
    setTimeout(() => srRef.current(), 200)
    return () => {
      canvas.removeEventListener("wheel", handleWheel)
      ro.disconnect()
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [handleWheel])

  // ── styling helpers ────────────────────────────────────────────────────────
  const dark = isDark
  const glass = dark ? "rgba(13,13,13,0.92)" : "rgba(255,255,255,0.96)"
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)"
  const shadow = dark
    ? "0 4px 24px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.4)"
    : "0 4px 24px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)"
  const textPrimary = dark ? "#f0f0f0" : "#111"
  const textSecondary = dark ? "#999" : "#666"

  // Source badge config
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

  // short label: first meaningful part of address
  const shortLabel = (s: string) => {
    if (!s) return ""
    const parts = s
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
    return parts.slice(0, 3).join(", ")
  }

  return (
    <div
      ref={wrap}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: "inherit"
      }}
    >
      {/* ── Canvas (tiles + marker + ripple) ── */}
      <canvas
        ref={cvs}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          userSelect: "none",
          WebkitUserSelect: "none" as any,
          cursor: "crosshair"
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          dragging.current = false
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* ════════════════════════════════════════════════════════
          HTML OVERLAY — all controls on top of canvas
      ════════════════════════════════════════════════════════ */}

      {/* ── Zoom controls (top-right) ── */}
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
        {/* Zoom level badge */}
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
          onClick={() => zoomAt(1)}
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
          onClick={() => zoomAt(-1)}
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

      {/* ── GPS / My Location button (bottom-right) ── */}
      <button
        onClick={() => {
          if (markerR.current) {
            // Langsung set fly ke posisi marker
            flyR.current = {
              fLat: cR.current[0],
              fLon: cR.current[1],
              fZ: zR.current,
              tLat: markerR.current[0],
              tLon: markerR.current[1],
              tZ: Math.max(zR.current, 15),
              t0: performance.now(),
              dur: 700
            }
            srRef.current()
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
          /* Spinner SVG */
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

      {/* ── Location info card (Google Maps style) ─────────────────────────── */}
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
            @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
          `}</style>

          {/* Color accent bar */}
          <div
            style={{
              height: 3,
              background: `linear-gradient(90deg,${meta.color},${meta.color}88)`
            }}
          />

          <div style={{ padding: "10px 12px 10px 12px" }}>
            {/* Header row: source badge + close */}
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

            {/* Coords row */}
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

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 6 }}>
              {/* Buka Google Maps */}
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

              {/* Salin koordinat */}
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `${cardInfo.lat.toFixed(6)},${cardInfo.lng.toFixed(6)}`
                  )
                  const btn = document.getElementById("copy-coords-btn")
                  if (btn) {
                    btn.textContent = "✓ Disalin"
                    setTimeout(() => {
                      btn.textContent = "Salin"
                    }, 1500)
                  }
                }}
                id="copy-coords-btn"
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

      {/* ── Crosshair hint when no marker (center of map) ── */}
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
