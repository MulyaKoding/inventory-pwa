const { PrismaClient } = require("../app/generated/prisma")

const prisma = new PrismaClient()

const data = [
  { kdSatuanBarang: "SB21", deskripsiSatuan: "Ampul" },
  { kdSatuanBarang: "SB01", deskripsiSatuan: "Botol" },
  { kdSatuanBarang: "SB02", deskripsiSatuan: "Box" },
  { kdSatuanBarang: "SB03", deskripsiSatuan: "Buah" },
  { kdSatuanBarang: "SB04", deskripsiSatuan: "Bungkus" },
  { kdSatuanBarang: "SB20", deskripsiSatuan: "Bungkus" },
  { kdSatuanBarang: "SB22", deskripsiSatuan: "Can" },
  { kdSatuanBarang: "SB05", deskripsiSatuan: "Can" },
  { kdSatuanBarang: "SB06", deskripsiSatuan: "Cc" },
  { kdSatuanBarang: "SB07", deskripsiSatuan: "Dus" },
  { kdSatuanBarang: "SB08", deskripsiSatuan: "Flc ( Flacon )" },
  { kdSatuanBarang: "SB09", deskripsiSatuan: "Fls ( Flas )" },
  { kdSatuanBarang: "SB18", deskripsiSatuan: "Gln" },
  { kdSatuanBarang: "SB10", deskripsiSatuan: "Gr ( Gram )" },
  { kdSatuanBarang: "SB32", deskripsiSatuan: "gram" },
  { kdSatuanBarang: "SB25", deskripsiSatuan: "Kaleng" },
  { kdSatuanBarang: "SB11", deskripsiSatuan: "Kg ( Kilo Gram )" },
  { kdSatuanBarang: "SB12", deskripsiSatuan: "Kit" },
  { kdSatuanBarang: "SB99", deskripsiSatuan: "Lain-Lain" },
  { kdSatuanBarang: "SB13", deskripsiSatuan: "Lt ( Liter )" },
  { kdSatuanBarang: "SB27", deskripsiSatuan: "Lusin" },
  { kdSatuanBarang: "SB31", deskripsiSatuan: "mL (mililiter)" },
  { kdSatuanBarang: "SB26", deskripsiSatuan: "pcs" },
  { kdSatuanBarang: "SB14", deskripsiSatuan: "Pot" },
  { kdSatuanBarang: "SB15", deskripsiSatuan: "Rol" },
  { kdSatuanBarang: "SB24", deskripsiSatuan: "Sachet" },
  { kdSatuanBarang: "SB28", deskripsiSatuan: "Strip" },
  { kdSatuanBarang: "SB29", deskripsiSatuan: "Tablet" },
  { kdSatuanBarang: "SB16", deskripsiSatuan: "Tabung" },
  { kdSatuanBarang: "SB17", deskripsiSatuan: "Tube" },
  { kdSatuanBarang: "SB30", deskripsiSatuan: "Unit" },
  { kdSatuanBarang: "SB23", deskripsiSatuan: "Vial" },
  { kdSatuanBarang: "SB19", deskripsiSatuan: "Zak" }
]

async function main() {
  console.log("Seeding ms_satuan_barang...")
  let inserted = 0

  for (const item of data) {
    await prisma.msSatuanBarang.upsert({
      where: { kdSatuanBarang: item.kdSatuanBarang },
      update: { deskripsiSatuan: item.deskripsiSatuan },
      create: { ...item, deleteAt: null }
    })
  }

  console.log(`\nSelesai: ${inserted} record berhasil dimasukkan`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
