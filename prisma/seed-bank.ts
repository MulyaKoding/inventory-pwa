/**
 * Seed data ke collection ms_bank
 * Jalankan: npx ts-node prisma/seed-bank.ts
 */

import { PrismaClient } from "../app/generated/prisma/index.js"

const prisma = new PrismaClient()

const DATA_BANK = [
  { Kd_Bank: "ACEH", Nama_Bank: "BPD Aceh" },
  { Kd_Bank: "ACEH_UUS", Nama_Bank: "BPD Aceh UUS" },
  { Kd_Bank: "AGRIS", Nama_Bank: "Bank Agris" },
  { Kd_Bank: "AGRONIAGA", Nama_Bank: "Bank BRI Agroniaga" },
  { Kd_Bank: "ALADIN", Nama_Bank: "Bank Aladin Syariah" },
  { Kd_Bank: "ALLO", Nama_Bank: "Allo Bank Indonesia" },
  { Kd_Bank: "AMAR", Nama_Bank: "Bank Amar Indonesia" },
  { Kd_Bank: "ANDARA", Nama_Bank: "Bank Andara" },
  { Kd_Bank: "ANGLOMAS", Nama_Bank: "Anglomas International Bank" },
  { Kd_Bank: "ANZ", Nama_Bank: "Bank ANZ Indonesia" },
  { Kd_Bank: "ARTA_NIAGA", Nama_Bank: "Bank Arta Niaga Kencana" },
  { Kd_Bank: "ARTHA", Nama_Bank: "Bank Artha Graha International" },
  { Kd_Bank: "ARTOS", Nama_Bank: "Bank Artos Indonesia" },
  { Kd_Bank: "BALI", Nama_Bank: "BPD Bali" },
  { Kd_Bank: "BAML", Nama_Bank: "Bank of America Merill-Lynch" },
  { Kd_Bank: "BANGKOK", Nama_Bank: "Bangkok Bank" },
  { Kd_Bank: "BANTEN", Nama_Bank: "BPD Banten" },
  { Kd_Bank: "BCA", Nama_Bank: "Bank Central Asia (BCA)" },
  { Kd_Bank: "BCA_SYR", Nama_Bank: "Bank Central Asia Syariah" },
  { Kd_Bank: "BENGKULU", Nama_Bank: "BPD Bengkulu" },
  { Kd_Bank: "BISNIS_INTL", Nama_Bank: "Bank Bisnis Internasional" },
  { Kd_Bank: "BJB", Nama_Bank: "Bank BJB" },
  { Kd_Bank: "BJB_SYR", Nama_Bank: "Bank BJB Syariah" },
  { Kd_Bank: "BNC", Nama_Bank: "Bank Neo Commerce" },
  { Kd_Bank: "BNI", Nama_Bank: "Bank Negara Indonesia (BNI)" },
  { Kd_Bank: "BNI_SYR", Nama_Bank: "Bank BNI Syariah" },
  { Kd_Bank: "BNP_PARIBAS", Nama_Bank: "Bank BNP Paribas" },
  { Kd_Bank: "BOC", Nama_Bank: "Bank of China (BOC)" },
  { Kd_Bank: "BRI", Nama_Bank: "Bank Rakyat Indonesia (BRI)" },
  { Kd_Bank: "BRI_SYR", Nama_Bank: "Bank Syariah BRI" },
  { Kd_Bank: "BSI", Nama_Bank: "Bank Syariah Indonesia (BSI)" },
  { Kd_Bank: "BTN", Nama_Bank: "Bank Tabungan Negara (BTN)" },
  { Kd_Bank: "BTN_UUS", Nama_Bank: "Bank Tabungan Negara UUS" },
  { Kd_Bank: "BTPN_SYR", Nama_Bank: "BTPN Syariah" },
  { Kd_Bank: "BUKOPIN", Nama_Bank: "Bank Bukopin" },
  { Kd_Bank: "BUKOPIN_SYR", Nama_Bank: "Bank Syariah Bukopin" },
  { Kd_Bank: "BUMI_ARTA", Nama_Bank: "Bank Bumi Arta" },
  { Kd_Bank: "CAPITAL", Nama_Bank: "Bank Capital Indonesia" },
  { Kd_Bank: "CCB", Nama_Bank: "China Construction Bank Indonesia" },
  { Kd_Bank: "CENTRATAMA", Nama_Bank: "Centratama Nasional Bank" },
  { Kd_Bank: "CHINATRUST", Nama_Bank: "Bank Chinatrust Indonesia" },
  { Kd_Bank: "CIMB", Nama_Bank: "Bank CIMB Niaga" },
  { Kd_Bank: "CIMB_UUS", Nama_Bank: "Bank CIMB Niaga UUS" },
  { Kd_Bank: "CITIBANK", Nama_Bank: "Citibank" },
  { Kd_Bank: "COMMONWEALTH", Nama_Bank: "Bank Commonwealth" },
  { Kd_Bank: "DIY", Nama_Bank: "BPD Daerah Istimewa Yogyakarta" },
  { Kd_Bank: "DIY_UUS", Nama_Bank: "BPD DIY UUS" },
  { Kd_Bank: "DANA", Nama_Bank: "DANA" },
  { Kd_Bank: "DANAMON", Nama_Bank: "Bank Danamon" },
  { Kd_Bank: "DANAMON_UUS", Nama_Bank: "Bank Danamon UUS" },
  { Kd_Bank: "DBS", Nama_Bank: "Bank DBS Indonesia" },
  { Kd_Bank: "DEUTSCHE", Nama_Bank: "Deutsche Bank" },
  { Kd_Bank: "DINAR", Nama_Bank: "Bank Dinar Indonesia" },
  { Kd_Bank: "DKI", Nama_Bank: "Bank DKI" },
  { Kd_Bank: "DKI_UUS", Nama_Bank: "Bank DKI UUS" },
  { Kd_Bank: "EXIMBANK", Nama_Bank: "Indonesia Eximbank" },
  { Kd_Bank: "FAMA", Nama_Bank: "Bank Fama International" },
  { Kd_Bank: "GANESHA", Nama_Bank: "Bank Ganesha" },
  { Kd_Bank: "GOPAY", Nama_Bank: "GoPay" },
  { Kd_Bank: "HANA", Nama_Bank: "Bank Hana" },
  { Kd_Bank: "HIMPUNAN_SAUDARA", Nama_Bank: "Bank Himpunan Saudara 1906" },
  { Kd_Bank: "HSBC", Nama_Bank: "HSBC Indonesia" },
  { Kd_Bank: "HSBC_UUS", Nama_Bank: "HSBC UUS" },
  { Kd_Bank: "IBK", Nama_Bank: "Bank IBK Indonesia" },
  { Kd_Bank: "ICBC", Nama_Bank: "Bank ICBC Indonesia" },
  { Kd_Bank: "INA_PERDANA", Nama_Bank: "Bank Ina Perdania" },
  { Kd_Bank: "INDEX_SELINDO", Nama_Bank: "Bank Index Selindo" },
  { Kd_Bank: "INDIA", Nama_Bank: "Bank of India Indonesia" },
  { Kd_Bank: "JAGO", Nama_Bank: "Bank Jago" },
  { Kd_Bank: "JAMBI", Nama_Bank: "BPD Jambi" },
  { Kd_Bank: "JAMBI_UUS", Nama_Bank: "BPD Jambi UUS" },
  { Kd_Bank: "JASA_JAKARTA", Nama_Bank: "Bank Jasa Jakarta" },
  { Kd_Bank: "JAWA_TENGAH", Nama_Bank: "BPD Jawa Tengah" },
  { Kd_Bank: "JAWA_TENGAH_UUS", Nama_Bank: "BPD Jawa Tengah UUS" },
  { Kd_Bank: "JAWA_TIMUR", Nama_Bank: "BPD Jawa Timur" },
  { Kd_Bank: "JAWA_TIMUR_UUS", Nama_Bank: "BPD Jawa Timur UUS" },
  { Kd_Bank: "JPMORGAN", Nama_Bank: "JP Morgan Chase Bank" },
  { Kd_Bank: "JTRUST", Nama_Bank: "Bank JTrust Indonesia" },
  { Kd_Bank: "KALBAR", Nama_Bank: "BPD Kalimantan Barat" },
  { Kd_Bank: "KALBAR_UUS", Nama_Bank: "BPD Kalimantan Barat UUS" },
  { Kd_Bank: "KALSEL", Nama_Bank: "BPD Kalimantan Selatan" },
  { Kd_Bank: "KALSEL_UUS", Nama_Bank: "BPD Kalimantan Selatan UUS" },
  { Kd_Bank: "KALTENG", Nama_Bank: "BPD Kalimantan Tengah" },
  { Kd_Bank: "KALTIM", Nama_Bank: "BPD Kalimantan Timur" },
  { Kd_Bank: "KALTIM_UUS", Nama_Bank: "BPD Kalimantan Timur UUS" },
  { Kd_Bank: "KESEJAHTERAAN", Nama_Bank: "Bank Kesejahteraan Ekonomi" },
  { Kd_Bank: "LAMPUNG", Nama_Bank: "BPD Lampung" },
  { Kd_Bank: "LINKAJA", Nama_Bank: "LinkAja" },
  { Kd_Bank: "MALUKU", Nama_Bank: "BPD Maluku" },
  { Kd_Bank: "MANDIRI", Nama_Bank: "Bank Mandiri" },
  { Kd_Bank: "MANDIRI_ECASH", Nama_Bank: "Mandiri E-Cash" },
  { Kd_Bank: "MANDIRI_SYR", Nama_Bank: "Bank Syariah Mandiri" },
  { Kd_Bank: "MANDIRI_TASPEN", Nama_Bank: "Mandiri Taspen Pos" },
  { Kd_Bank: "MASPION", Nama_Bank: "Bank Maspion Indonesia" },
  { Kd_Bank: "MAYAPADA", Nama_Bank: "Bank Mayapada International" },
  { Kd_Bank: "MAYBANK", Nama_Bank: "Bank Maybank" },
  { Kd_Bank: "MAYBANK_SYR", Nama_Bank: "Bank Maybank Syariah Indonesia" },
  { Kd_Bank: "MAYORA", Nama_Bank: "Bank Mayora" },
  { Kd_Bank: "MEGA", Nama_Bank: "Bank Mega" },
  { Kd_Bank: "MEGA_SYR", Nama_Bank: "Bank Syariah Mega" },
  { Kd_Bank: "MESTIKA", Nama_Bank: "Bank Mestika Dharma" },
  { Kd_Bank: "MITRA_NIAGA", Nama_Bank: "Bank Mitra Niaga" },
  { Kd_Bank: "MITSUI", Nama_Bank: "Bank Sumitomo Mitsui Indonesia" },
  { Kd_Bank: "MIZUHO", Nama_Bank: "Bank Mizuho Indonesia" },
  { Kd_Bank: "MNC_INTL", Nama_Bank: "Bank MNC Internasional" },
  { Kd_Bank: "MUAMALAT", Nama_Bank: "Bank Muamalat Indonesia" },
  { Kd_Bank: "MULTI_ARTA", Nama_Bank: "Bank Multi Arta Sentosa" },
  { Kd_Bank: "NATIONALNOBU", Nama_Bank: "Bank Nationalnobu" },
  { Kd_Bank: "NUSANTARA", Nama_Bank: "Bank Nusantara Parahyangan" },
  { Kd_Bank: "NTB", Nama_Bank: "BPD Nusa Tenggara Barat" },
  { Kd_Bank: "NTB_UUS", Nama_Bank: "BPD NTB UUS" },
  { Kd_Bank: "NTT", Nama_Bank: "BPD Nusa Tenggara Timur" },
  { Kd_Bank: "OCBC", Nama_Bank: "Bank OCBC NISP" },
  { Kd_Bank: "OCBC_UUS", Nama_Bank: "Bank OCBC NISP UUS" },
  { Kd_Bank: "OKE", Nama_Bank: "Bank Oke Indonesia" },
  { Kd_Bank: "OVO", Nama_Bank: "OVO" },
  { Kd_Bank: "PANIN", Nama_Bank: "Bank Panin" },
  { Kd_Bank: "PANIN_SYR", Nama_Bank: "Bank Panin Syariah" },
  { Kd_Bank: "PAPUA", Nama_Bank: "BPD Papua" },
  { Kd_Bank: "PERMATA", Nama_Bank: "Bank Permata" },
  { Kd_Bank: "PERMATA_UUS", Nama_Bank: "Bank Permata UUS" }
]

async function main() {
  console.log(`🚀 Mulai seed ${DATA_BANK.length} data ke ms_bank...`)

  let inserted = 0
  let skipped = 0

  for (const item of DATA_BANK) {
    try {
      await prisma.msBank.upsert({
        where: { kodeBank: item.Kd_Bank },
        update: { namaBank: item.Nama_Bank },
        create: {
          kodeBank: item.Kd_Bank,
          namaBank: item.Nama_Bank,
          deleteAt: null
        }
      })
      inserted++
      console.log(`  ✅ ${item.Kd_Bank} - ${item.Nama_Bank}`)
    } catch (err) {
      skipped++
      console.warn(`  ⚠️  Skip ${item.Kd_Bank}: ${(err as Error).message}`)
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
