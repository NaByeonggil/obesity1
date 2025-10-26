import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Adding medication data...')

  // Check existing medications
  const existingMeds = await prisma.medications.findMany()
  console.log(`Found ${existingMeds.length} existing medications`)

  // Additional medications to add
  const newMedications = [
    { id: 'med_007', name: '타이레놀 500mg', description: '해열 진통제', price: 6000 },
    { id: 'med_008', name: '게보린', description: '두통 및 발열 완화제', price: 5500 },
    { id: 'med_009', name: '부루펜', description: '소염 진통제', price: 7000 },
    { id: 'med_010', name: '베아제정', description: '소화효소제', price: 12000 },
    { id: 'med_011', name: '훼스탈플러스', description: '소화제', price: 9000 },
    { id: 'med_012', name: '가스터정', description: '위산 분비 억제제', price: 8500 },
    { id: 'med_013', name: '오메프라졸', description: '위염 및 역류성 식도염 치료제', price: 15000 },
    { id: 'med_014', name: '지르텍', description: '알레르기 비염 치료제', price: 11000 },
    { id: 'med_015', name: '알레그라', description: '알레르기성 비염 및 두드러기', price: 13000 },
    { id: 'med_016', name: '에어탈', description: '진통 소염제', price: 8000 },
    { id: 'med_017', name: '비타민C 1000mg', description: '면역력 강화 비타민', price: 18000 },
    { id: 'med_018', name: '종합비타민', description: '멀티비타민 미네랄 복합제', price: 25000 },
    { id: 'med_019', name: '오메가3', description: '심혈관 건강 보조제', price: 30000 },
    { id: 'med_020', name: '프로바이오틱스', description: '장 건강 유산균', price: 35000 },
  ]

  let added = 0
  let skipped = 0

  for (const med of newMedications) {
    try {
      const exists = await prisma.medications.findUnique({ where: { id: med.id } })
      if (exists) {
        console.log(`⏭️  Skipping ${med.name} - already exists`)
        skipped++
      } else {
        await prisma.medications.create({ data: med })
        console.log(`✅ Added ${med.name}`)
        added++
      }
    } catch (error) {
      console.error(`❌ Failed to add ${med.name}:`, error)
    }
  }

  console.log(`\n✨ Medication data added successfully!`)
  console.log(`   - Added: ${added} medications`)
  console.log(`   - Skipped: ${skipped} medications (already exist)`)
  console.log(`   - Total: ${existingMeds.length + added} medications in database`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
