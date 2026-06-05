/**
 * Seed data ke collection ms_jenisbarang
 * Jalankan: npx ts-node prisma/seed-jenisbarang.ts
 */

import { PrismaClient } from "../app/generated/prisma"

const prisma = new PrismaClient()

const DATA_JENIS_BARANG = [
  { Kd_Barang: "KB0100", JenisBarang: "Aerosol Foam" },
  { Kd_Barang: "KB0101", JenisBarang: "Aerosol Metered Dose" },
  { Kd_Barang: "KB0102", JenisBarang: "Aerosol Spray" },
  { Kd_Barang: "KB0103", JenisBarang: "Oral Spray" },
  { Kd_Barang: "KB0104", JenisBarang: "Buscal Spray" },
  { Kd_Barang: "KB0105", JenisBarang: "Transdermal Spray" },
  { Kd_Barang: "KB0106", JenisBarang: "Topical Spray" },
  { Kd_Barang: "KB0107", JenisBarang: "Serbuk Spray" },
  { Kd_Barang: "KB0108", JenisBarang: "Eliksir" },
  { Kd_Barang: "KB0109", JenisBarang: "Emulsi" },
  { Kd_Barang: "KB0110", JenisBarang: "Enema" },
  { Kd_Barang: "KB0111", JenisBarang: "Gas" },
  { Kd_Barang: "KB0035", JenisBarang: "Gel" },
  { Kd_Barang: "KB0112", JenisBarang: "Gel Mata" },
  { Kd_Barang: "KB0113", JenisBarang: "Granul Effervescent" },
  { Kd_Barang: "KB0114", JenisBarang: "Granula" },
  { Kd_Barang: "KB0115", JenisBarang: "Intra Uterine Device (IUD)" },
  { Kd_Barang: "KB0116", JenisBarang: "Implant" },
  { Kd_Barang: "KB0031", JenisBarang: "Kapsul Kecil" },
  { Kd_Barang: "KB0117", JenisBarang: "Kapsul" },
  { Kd_Barang: "KB0118", JenisBarang: "Kapsul Lunak" },
  { Kd_Barang: "KB0119", JenisBarang: "Kapsul Pelepasan Lambat" },
  { Kd_Barang: "KB0120", JenisBarang: "Kaplet" },
  { Kd_Barang: "KB0121", JenisBarang: "Kaplet Salut Selaput" },
  { Kd_Barang: "KB0122", JenisBarang: "Kaplet Salut Enterik" },
  { Kd_Barang: "KB0123", JenisBarang: "Kaplet Salut Gula" },
  { Kd_Barang: "KB0124", JenisBarang: "Kaplet Pelepasan Lambat" },
  { Kd_Barang: "KB0125", JenisBarang: "Kaplet Pelepasan Cepat" },
  { Kd_Barang: "KB0126", JenisBarang: "Kaplet Kunyah" },
  { Kd_Barang: "KB0127", JenisBarang: "Kaplet Kunyah Salut Selaput" },
  { Kd_Barang: "KB0011", JenisBarang: "Krim" },
  { Kd_Barang: "KB0128", JenisBarang: "Krim Lemak" },
  { Kd_Barang: "KB0129", JenisBarang: "Larutan" },
  { Kd_Barang: "KB0130", JenisBarang: "Larutan Inhalasi" },
  { Kd_Barang: "KB0131", JenisBarang: "Larutan Injeksi" },
  { Kd_Barang: "KB0008", JenisBarang: "Infus" },
  { Kd_Barang: "KB0132", JenisBarang: "Obat Kumur" },
  { Kd_Barang: "KB0133", JenisBarang: "Ovula" },
  { Kd_Barang: "KB0134", JenisBarang: "Pasta" },
  { Kd_Barang: "KB0135", JenisBarang: "Pil" },
  { Kd_Barang: "KB0136", JenisBarang: "Patch" },
  { Kd_Barang: "KB0137", JenisBarang: "Pessary" },
  { Kd_Barang: "KB0012", JenisBarang: "Salep" },
  { Kd_Barang: "KB0138", JenisBarang: "Salep Mata" },
  { Kd_Barang: "KB0139", JenisBarang: "Sampo" },
  { Kd_Barang: "KB0140", JenisBarang: "Semprot Hidung" },
  { Kd_Barang: "KB0141", JenisBarang: "Serbuk Aerosol" },
  { Kd_Barang: "KB0142", JenisBarang: "Serbuk Oral" },
  { Kd_Barang: "KB0143", JenisBarang: "Serbuk Inhaler" },
  { Kd_Barang: "KB0144", JenisBarang: "Serbuk Injeksi" },
  { Kd_Barang: "KB0145", JenisBarang: "Serbuk Injeksi Liofilisasi" },
  { Kd_Barang: "KB0146", JenisBarang: "Serbuk Infus" },
  { Kd_Barang: "KB0147", JenisBarang: "Serbuk Obat Luar / Serbuk Tabur" },
  { Kd_Barang: "KB0148", JenisBarang: "Serbuk Steril" },
  { Kd_Barang: "KB0149", JenisBarang: "Serbuk Effervescent" },
  { Kd_Barang: "KB0006", JenisBarang: "Sirup" },
  { Kd_Barang: "KB0150", JenisBarang: "Sirup Kering" },
  { Kd_Barang: "KB0151", JenisBarang: "Sirup Kering Pelepasan Lambat" },
  { Kd_Barang: "KB0152", JenisBarang: "Subdermal Implants" },
  { Kd_Barang: "KB0153", JenisBarang: "Supositoria" },
  { Kd_Barang: "KB0033", JenisBarang: "Suspension" },
  { Kd_Barang: "KB0154", JenisBarang: "Suspensi" },
  { Kd_Barang: "KB0155", JenisBarang: "Suspensi Injeksi" },
  { Kd_Barang: "KB0156", JenisBarang: "Suspensi / Cairan Obat Luar" },
  { Kd_Barang: "KB0157", JenisBarang: "Cairan Steril" },
  { Kd_Barang: "KB0158", JenisBarang: "Cairan Mata" },
  { Kd_Barang: "KB0159", JenisBarang: "Cairan Diagnostik" },
  { Kd_Barang: "KB0002", JenisBarang: "Tablet" },
  { Kd_Barang: "KB0160", JenisBarang: "Tablet Effervescent" },
  { Kd_Barang: "KB0161", JenisBarang: "Tablet Hisap" },
  { Kd_Barang: "KB0162", JenisBarang: "Tablet Kunyah" },
  { Kd_Barang: "KB0163", JenisBarang: "Tablet Pelepasan Cepat" },
  { Kd_Barang: "KB0164", JenisBarang: "Tablet Pelepasan Lambat" },
  { Kd_Barang: "KB0165", JenisBarang: "Tablet Disintegrasi Oral" },
  { Kd_Barang: "KB0166", JenisBarang: "Tablet Dispersibel" },
  { Kd_Barang: "KB0167", JenisBarang: "Tablet Cepat Larut" },
  { Kd_Barang: "KB0168", JenisBarang: "Tablet Salut Gula" },
  { Kd_Barang: "KB0169", JenisBarang: "Tablet Salut Enterik" },
  { Kd_Barang: "KB0170", JenisBarang: "Tablet Salut Selaput" },
  { Kd_Barang: "KB0171", JenisBarang: "Tablet Sublingual" },
  { Kd_Barang: "KB0172", JenisBarang: "Tablet Sublingual Pelepasan Lambat" },
  { Kd_Barang: "KB0173", JenisBarang: "Tablet Vaginal" },
  { Kd_Barang: "KB0174", JenisBarang: "Tablet Lapis" },
  { Kd_Barang: "KB0175", JenisBarang: "Tablet Lapis Lepas Lambat" },
  { Kd_Barang: "KB0176", JenisBarang: "Chewing Gum" },
  { Kd_Barang: "KB0177", JenisBarang: "Tetes Mata" },
  { Kd_Barang: "KB0178", JenisBarang: "Tetes Hidung" },
  { Kd_Barang: "KB0179", JenisBarang: "Tetes Telinga" },
  { Kd_Barang: "KB0180", JenisBarang: "Tetes Oral (Oral Drops)" },
  { Kd_Barang: "KB0181", JenisBarang: "Tetes Mata dan Telinga" },
  { Kd_Barang: "KB0182", JenisBarang: "Transdermal" },
  { Kd_Barang: "KB0183", JenisBarang: "Transdermal Urethral" },
  { Kd_Barang: "KB0184", JenisBarang: "Tulle/Plester Obat" },
  { Kd_Barang: "KB0185", JenisBarang: "Vagina Cream" },
  { Kd_Barang: "KB0186", JenisBarang: "Vagina Gel" },
  { Kd_Barang: "KB0187", JenisBarang: "Vagina Douche" },
  { Kd_Barang: "KB0188", JenisBarang: "Vagina Ring" },
  { Kd_Barang: "KB0189", JenisBarang: "Vagina Tissue" },
  { Kd_Barang: "KB0190", JenisBarang: "Suspensi Inhalasi" },
  { Kd_Barang: "KB0191", JenisBarang: "Obat Topikal" },
  { Kd_Barang: "KB0192", JenisBarang: "Obat Kosmetik" },
  { Kd_Barang: "KB0001", JenisBarang: "Obat-obatan / TABLET" },
  { Kd_Barang: "KB0003", JenisBarang: "LIQUID" },
  { Kd_Barang: "KB0004", JenisBarang: "LOTION" },
  { Kd_Barang: "KB0005", JenisBarang: "SOL" },
  { Kd_Barang: "KB0007", JenisBarang: "DROP" },
  { Kd_Barang: "KB0009", JenisBarang: "INJEKSI" },
  { Kd_Barang: "KB0010", JenisBarang: "BEDAK" },
  { Kd_Barang: "KB0013", JenisBarang: "SUPP" },
  { Kd_Barang: "KB0014", JenisBarang: "ANMAAK" },
  { Kd_Barang: "KB0015", JenisBarang: "LAIN - LAIN ANMAAK" },
  { Kd_Barang: "KB0016", JenisBarang: "GAS" },
  { Kd_Barang: "KB0017", JenisBarang: "LAIN - LAIN REAGEN" },
  { Kd_Barang: "KB0018", JenisBarang: "REAGEN" },
  { Kd_Barang: "KB0019", JenisBarang: "SUPLEMEN" },
  { Kd_Barang: "KB0020", JenisBarang: "ALKES" },
  { Kd_Barang: "KB0021", JenisBarang: "ALKED" },
  { Kd_Barang: "KB0022", JenisBarang: "BKKBN" },
  { Kd_Barang: "KB0023", JenisBarang: "INPRES" },
  { Kd_Barang: "KB0030", JenisBarang: "OPRS" },
  { Kd_Barang: "KB0032", JenisBarang: "OKSIGEN" },
  { Kd_Barang: "KB0034", JenisBarang: "BHP (Barang Habis Pakai)" },
  { Kd_Barang: "KB0036", JenisBarang: "Serbuk" },
  { Kd_Barang: "KB0099", JenisBarang: "LAIN-LAIN" }
]

async function main() {
  console.log(
    `🚀 Mulai seed ${DATA_JENIS_BARANG.length} data ke ms_jenisbarang...`
  )

  let inserted = 0
  let skipped = 0

  for (const item of DATA_JENIS_BARANG) {
    try {
      await prisma.msJenisBarang.upsert({
        where: { kdBarang: item.Kd_Barang },
        update: { jenisBarang: item.JenisBarang },
        create: {
          kdBarang: item.Kd_Barang,
          jenisBarang: item.JenisBarang,
          deleteAt: null
        }
      })
      inserted++
      console.log(`  ✅ ${item.Kd_Barang} - ${item.JenisBarang}`)
    } catch (err) {
      skipped++
      console.warn(`  ⚠️  Skip ${item.Kd_Barang}: ${(err as Error).message}`)
    }
  }

  console.log(
    `\n✨ Selesai! Inserted/updated: ${inserted}, Skipped: ${skipped}`
  )
}

main()
  .catch((e) => {
    console.error("❌ Error seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
