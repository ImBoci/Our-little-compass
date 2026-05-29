const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
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

  // 4. Seed sample foods (linked to the couple)
  const foods = [
    {
      name: 'Pizza Margherita',
      description: 'Classic Italian pizza with tomato sauce, mozzarella, and basil',
      category: 'Italian',
      image_url: null,
      coupleId: couple.id,
    },
    {
      name: 'Sushi Rolls',
      description: 'Fresh salmon and avocado rolls with soy sauce',
      category: 'Japanese',
      image_url: null,
      coupleId: couple.id,
    },
    {
      name: 'Tacos',
      description: 'Soft corn tortillas with seasoned meat, cheese, and salsa',
      category: 'Mexican',
      image_url: null,
      coupleId: couple.id,
    },
    {
      name: 'Pad Thai',
      description: 'Stir-fried rice noodles with shrimp, peanuts, and lime',
      category: 'Thai',
      image_url: null,
      coupleId: couple.id,
    },
    {
      name: 'Burger',
      description: 'Juicy beef patty with lettuce, tomato, and cheese',
      category: 'American',
      image_url: null,
      coupleId: couple.id,
    },
  ]

  for (const food of foods) {
    await prisma.food.create({ data: food })
  }

  console.log('✅ Sample foods added:', foods.length, 'items')
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