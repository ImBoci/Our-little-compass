import { prisma } from './src/lib/prisma'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

async function main() {
  console.log("Connecting to database to seed data...");
  // 1. Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const user1 = await prisma.user.upsert({
    where: { email: 'dani@example.com' },
    update: {},
    create: {
      name: 'Dani',
      email: 'dani@example.com',
      password: hashedPassword,
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'viki@example.com' },
    update: {},
    create: {
      name: 'Viki',
      email: 'viki@example.com',
      password: hashedPassword,
    },
  })

  console.log('✅ Users created:', user1.email, user2.email)

  // 2. Create a sample couple and link both users
  const couple = await prisma.couple.create({
    data: {
      name: 'Dani & Viki',
      inviteCode: 'ABC123',
      anniversary: new Date('2023-05-01'),
      users: {
        connect: [{ id: user1.id }, { id: user2.id }],
      },
    },
  })

  console.log('✅ Couple created:', couple.name, '| Invite code:', couple.inviteCode)

  // 3. Add pets
  await prisma.pet.createMany({
    data: [
      { name: 'Boci', type: 'The wise one 🐱', startDate: new Date('2022-01-15'), coupleId: couple.id },
      { name: 'Pipi', type: 'The chaotic one 😺', startDate: new Date('2023-03-20'), coupleId: couple.id },
    ],
  })

  console.log('✅ Pets added: Boci, Pipi')

  // 4. Seed sample foods and activities from backups
  const foodsPath = path.join(process.cwd(), 'backup_foods.json')
  const activitiesPath = path.join(process.cwd(), 'backup_activities.json')

  let foodsCount = 0;
  if (fs.existsSync(foodsPath)) {
    const backupFoods = JSON.parse(fs.readFileSync(foodsPath, 'utf-8'))
    const foodData = backupFoods.map((f: any) => ({
      name: f.name,
      description: f.description,
      category: f.category,
      image_url: f.image_url,
      coupleId: couple.id,
    }))
    await prisma.food.createMany({ data: foodData })
    foodsCount = foodData.length
  } else {
    console.warn("⚠️ backup_foods.json not found")
  }

  let activitiesCount = 0;
  if (fs.existsSync(activitiesPath)) {
    const backupActivities = JSON.parse(fs.readFileSync(activitiesPath, 'utf-8'))
    const activityData = backupActivities.map((a: any) => ({
      name: a.name,
      location: a.location,
      type: a.type,
      description: a.description,
      coupleId: couple.id,
    }))
    await prisma.activity.createMany({ data: activityData })
    activitiesCount = activityData.length
  } else {
    console.warn("⚠️ backup_activities.json not found")
  }

  console.log(`✅ Restored from backups: ${foodsCount} foods, ${activitiesCount} activities`)
  console.log('\n🎉 Seed complete! Login with dani@example.com / password123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
