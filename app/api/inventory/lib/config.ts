export type JenisTransaksi =
  | "penerimaan"
  | "pengeluaran"
  | "penyesuaian"
  | "retur-penerimaan"
  | "retur-pengeluaran"

interface JenisConfig {
  prefix: string
  arah: "masuk" | "keluar" | null
}

export const JENIS_CONFIG: Record<JenisTransaksi, JenisConfig> = {
  penerimaan: { prefix: "RCV", arah: "masuk" },
  pengeluaran: { prefix: "OUT", arah: "keluar" },
  penyesuaian: { prefix: "ADJ", arah: null },
  "retur-penerimaan": { prefix: "RTP", arah: "keluar" },
  "retur-pengeluaran": { prefix: "RTK", arah: "masuk" }
}
