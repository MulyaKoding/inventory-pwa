"use client"

import { useState, useEffect } from "react"
import { Box } from "@mui/material"

interface Provinsi {
  Kd_Provinsi: string
  NamaProvinsi: string
}
interface Kota {
  Kd_Kota: string
  NamaKota: string
}
interface Kecamatan {
  Kd_Kecamatan: string
  NamaKecamatan: string
}
interface Kelurahan {
  Kd_Kelurahan: string
  NamaKelurahan: string
  KodePos?: string
}

export interface LocationValue {
  provinsiKd: string
  provinsiNama: string
  kotaKd: string
  kotaNama: string
  kecamatanKd: string
  kecamatanNama: string
  kelurahanKd: string
  kelurahanNama: string
  kodePos: string
}

interface LocationSelectorProps {
  value: LocationValue
  onChange: (val: LocationValue) => void
  errors?: Partial<Record<keyof LocationValue, string>>
  isDark: boolean
  p: { border: string; textPrimary: string; textMuted: string }
}

// Semua fetch via proxy internal /api/wilayah (server-side) → bypass CORS
const api = (params: Record<string, string>) =>
  `/api/wilayah?${new URLSearchParams(params).toString()}`

function toTitle(s: string) {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function LocationSelector({
  value,
  onChange,
  errors = {},
  isDark,
  p
}: LocationSelectorProps) {
  const [provinsiList, setProvinsiList] = useState<Provinsi[]>([])
  const [kotaList, setKotaList] = useState<Kota[]>([])
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([])
  const [kelurahanList, setKelurahanList] = useState<Kelurahan[]>([])
  const [loadingProv, setLoadingProv] = useState(false)
  const [loadingKota, setLoadingKota] = useState(false)
  const [loadingKec, setLoadingKec] = useState(false)
  const [loadingKel, setLoadingKel] = useState(false)
  const [errProv, setErrProv] = useState("")

  const fetchProvinsi = () => {
    setLoadingProv(true)
    setErrProv("")
    fetch(api({ type: "provinsi" }))
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setProvinsiList(d.data ?? [])
      })
      .catch((e) => setErrProv(e.message || "Gagal memuat"))
      .finally(() => setLoadingProv(false))
  }
  useEffect(() => {
    fetchProvinsi()
  }, [])

  useEffect(() => {
    if (!value.provinsiKd) {
      setKotaList([])
      setKecamatanList([])
      setKelurahanList([])
      return
    }
    setLoadingKota(true)
    setKotaList([])
    setKecamatanList([])
    setKelurahanList([])
    fetch(api({ type: "kota", provinsi: value.provinsiKd }))
      .then((r) => r.json())
      .then((d) => setKotaList(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingKota(false))
  }, [value.provinsiKd])

  useEffect(() => {
    if (!value.kotaKd) {
      setKecamatanList([])
      setKelurahanList([])
      return
    }
    setLoadingKec(true)
    setKecamatanList([])
    setKelurahanList([])
    fetch(api({ type: "kecamatan", kota: value.kotaKd }))
      .then((r) => r.json())
      .then((d) => setKecamatanList(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingKec(false))
  }, [value.kotaKd])

  useEffect(() => {
    if (!value.kecamatanKd) {
      setKelurahanList([])
      return
    }
    setLoadingKel(true)
    setKelurahanList([])
    fetch(api({ type: "kelurahan", kecamatan: value.kecamatanKd }))
      .then((r) => r.json())
      .then((d) => setKelurahanList(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingKel(false))
  }, [value.kecamatanKd])

  const handleProvinsi = (kd: string) => {
    const nama =
      provinsiList.find((x) => x.Kd_Provinsi === kd)?.NamaProvinsi ?? ""
    onChange({
      ...value,
      provinsiKd: kd,
      provinsiNama: toTitle(nama),
      kotaKd: "",
      kotaNama: "",
      kecamatanKd: "",
      kecamatanNama: "",
      kelurahanKd: "",
      kelurahanNama: "",
      kodePos: ""
    })
  }
  const handleKota = (kd: string) => {
    const nama = kotaList.find((x) => x.Kd_Kota === kd)?.NamaKota ?? ""
    onChange({
      ...value,
      kotaKd: kd,
      kotaNama: toTitle(nama),
      kecamatanKd: "",
      kecamatanNama: "",
      kelurahanKd: "",
      kelurahanNama: "",
      kodePos: ""
    })
  }
  const handleKecamatan = (kd: string) => {
    const nama =
      kecamatanList.find((x) => x.Kd_Kecamatan === kd)?.NamaKecamatan ?? ""
    onChange({
      ...value,
      kecamatanKd: kd,
      kecamatanNama: toTitle(nama),
      kelurahanKd: "",
      kelurahanNama: "",
      kodePos: ""
    })
  }
  const handleKelurahan = (kd: string) => {
    const item = kelurahanList.find((x) => x.Kd_Kelurahan === kd)
    onChange({
      ...value,
      kelurahanKd: kd,
      kelurahanNama: toTitle(item?.NamaKelurahan ?? ""),
      kodePos: item?.KodePos ?? value.kodePos
    })
  }

  const sel = (hasError: boolean, disabled: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "10px 12px",
    borderRadius: 6,
    border: `1px solid ${hasError ? "#ef4444" : disabled ? (isDark ? "#1a1a1a" : "#f0f0f0") : p.border}`,
    background: disabled
      ? isDark
        ? "#0d0d0d"
        : "#f8fafc"
      : isDark
        ? "#111"
        : "#fff",
    color: disabled ? p.textMuted : p.textPrimary,
    fontFamily: "'Nunito', sans-serif",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box" as const,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: "border-color 0.2s, opacity 0.2s"
  })

  const Spinner = () => (
    <span
      style={{
        width: 10,
        height: 10,
        border: "1.5px solid #1e3a8a",
        borderTopColor: "transparent",
        borderRadius: "50%",
        display: "inline-block",
        animation: "lspin 0.7s linear infinite",
        flexShrink: 0
      }}
    />
  )

  const Lbl = ({ text, loading }: { text: string; loading: boolean }) => (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 700,
        color: "#64748b",
        marginBottom: 6,
        fontFamily: "'Nunito', sans-serif"
      }}
    >
      {text}
      {loading && <Spinner />}
    </label>
  )

  const Err = ({ msg }: { msg?: string }) =>
    msg ? (
      <p
        style={{
          fontSize: 11,
          color: "#ef4444",
          marginTop: 4,
          marginBottom: 0,
          fontFamily: "'Nunito', sans-serif"
        }}
      >
        {msg}
      </p>
    ) : null

  return (
    <>
      <style>{`@keyframes lspin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {errProv && (
        <Box
          sx={{
            mb: 2,
            px: 2,
            py: 1.25,
            bgcolor: isDark ? "#2e1010" : "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "#ef4444",
              fontFamily: "'Nunito', sans-serif"
            }}
          >
            ⚠ Gagal memuat data wilayah
          </span>
          <button
            onClick={fetchProvinsi}
            style={{
              fontSize: 11,
              color: "#ef4444",
              background: "none",
              border: "1px solid #ef4444",
              borderRadius: 4,
              padding: "2px 8px",
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700
            }}
          >
            Coba Lagi
          </button>
        </Box>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: { xs: 2, sm: 2.5 }
        }}
      >
        <div>
          <Lbl text="PROVINSI *" loading={loadingProv} />
          <select
            value={value.provinsiKd}
            onChange={(e) => handleProvinsi(e.target.value)}
            disabled={loadingProv || !!errProv}
            style={sel(!!errors.provinsiKd, loadingProv || !!errProv)}
          >
            <option value="">
              {loadingProv ? "Memuat..." : "Pilih provinsi"}
            </option>
            {provinsiList.map((x) => (
              <option key={x.Kd_Provinsi} value={x.Kd_Provinsi}>
                {toTitle(x.NamaProvinsi)}
              </option>
            ))}
          </select>
          <Err msg={errors.provinsiKd} />
        </div>
        <div>
          <Lbl text="KOTA / KABUPATEN *" loading={loadingKota} />
          <select
            value={value.kotaKd}
            onChange={(e) => handleKota(e.target.value)}
            disabled={!value.provinsiKd || loadingKota}
            style={sel(!!errors.kotaKd, !value.provinsiKd || loadingKota)}
          >
            <option value="">
              {!value.provinsiKd
                ? "Pilih provinsi dulu"
                : loadingKota
                  ? "Memuat..."
                  : "Pilih kota / kabupaten"}
            </option>
            {kotaList.map((x) => (
              <option key={x.Kd_Kota} value={x.Kd_Kota}>
                {toTitle(x.NamaKota)}
              </option>
            ))}
          </select>
          <Err msg={errors.kotaKd} />
        </div>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: { xs: 2, sm: 2.5 },
          mt: { xs: 2, sm: 2.5 }
        }}
      >
        <div>
          <Lbl text="KECAMATAN *" loading={loadingKec} />
          <select
            value={value.kecamatanKd}
            onChange={(e) => handleKecamatan(e.target.value)}
            disabled={!value.kotaKd || loadingKec}
            style={sel(!!errors.kecamatanKd, !value.kotaKd || loadingKec)}
          >
            <option value="">
              {!value.kotaKd
                ? "Pilih kota dulu"
                : loadingKec
                  ? "Memuat..."
                  : "Pilih kecamatan"}
            </option>
            {kecamatanList.map((x) => (
              <option key={x.Kd_Kecamatan} value={x.Kd_Kecamatan}>
                {toTitle(x.NamaKecamatan)}
              </option>
            ))}
          </select>
          <Err msg={errors.kecamatanKd} />
        </div>
        <div>
          <Lbl text="KELURAHAN / DESA *" loading={loadingKel} />
          <select
            value={value.kelurahanKd}
            onChange={(e) => handleKelurahan(e.target.value)}
            disabled={!value.kecamatanKd || loadingKel}
            style={sel(!!errors.kelurahanKd, !value.kecamatanKd || loadingKel)}
          >
            <option value="">
              {!value.kecamatanKd
                ? "Pilih kecamatan dulu"
                : loadingKel
                  ? "Memuat..."
                  : "Pilih kelurahan / desa"}
            </option>
            {kelurahanList.map((x) => (
              <option key={x.Kd_Kelurahan} value={x.Kd_Kelurahan}>
                {toTitle(x.NamaKelurahan)}
              </option>
            ))}
          </select>
          <Err msg={errors.kelurahanKd} />
        </div>
      </Box>

      <Box sx={{ mt: { xs: 2, sm: 2.5 }, maxWidth: { xs: "100%", sm: 200 } }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 700,
            color: "#64748b",
            marginBottom: 6,
            fontFamily: "'Nunito', sans-serif"
          }}
        >
          KODE POS
        </label>
        <input
          type="text"
          placeholder="Isi kode pos"
          maxLength={5}
          value={value.kodePos}
          onChange={(e) =>
            onChange({ ...value, kodePos: e.target.value.replace(/\D/g, "") })
          }
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 6,
            border: `1px solid ${p.border}`,
            background: isDark ? "#111" : "#fff",
            color: p.textPrimary,
            fontFamily: "'Nunito', sans-serif",
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box" as const
          }}
        />
      </Box>
    </>
  )
}
