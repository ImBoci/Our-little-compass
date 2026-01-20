const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const foods = [
    {
      name: 'Pizza Margherita',
      description: 'Classic Italian pizza with tomato sauce, mozzarella, and basil',
      category: 'Italian',
      image_url: null
    },
    {
      name: 'Sushi Rolls',
      description: 'Fresh salmon and avocado rolls with soy sauce',
      category: 'Japanese',
      image_url: null
    },
    {
      name: 'Tacos',
      description: 'Soft corn tortillas with seasoned meat, cheese, and salsa',
      category: 'Mexican',
      image_url: null
    },
    {
      name: 'Pad Thai',
      description: 'Stir-fried rice noodles with shrimp, peanuts, and lime',
      category: 'Thai',
      image_url: null
    },
    {
      name: 'Burger',
      description: 'Juicy beef patty with lettuce, tomato, and cheese',
      category: 'American',
      image_url: null
    }
  ]

  for (const food of foods) {
    await prisma.food.create({
      data: food
    })
  }

  console.log('Sample foods added successfully!')
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