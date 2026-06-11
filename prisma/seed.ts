import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Sample Nepal locations with their coordinates
  const locations = [
    {
      name: 'Boudhanath Stupa',
      description: 'One of the largest Buddhist stupas in the world, located in Kathmandu',
      latitude: 27.7215,
      longitude: 85.3616,
      imageUrl: '/locations/boudha/bo1.jpg',
      difficulty: Difficulty.EASY,
    },
    {
      name: 'Pashupatinath Temple',
      description: 'Sacred Hindu temple complex on the banks of Bagmati River',
      latitude: 27.7104,
      longitude: 85.3486,
      imageUrl: '/locations/pashupatinath/p1.jpg',
      difficulty: Difficulty.EASY,
    },
    {
      name: 'Pokhara',
      description: 'Beautiful lakeside city with stunning mountain views',
      latitude: 28.204,
      longitude: 83.963,
      imageUrl: '/locations/pokhara/po1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    {
      name: 'Mount Everest Region',
      description: 'Home to the highest peak in the world',
      latitude: 27.9881,
      longitude: 86.9250,
      imageUrl: '/locations/everest/e1.jpg',
      difficulty: Difficulty.HARD,
    },
    {
      name: 'Lumbini',
      description: 'Birthplace of Lord Buddha, UNESCO World Heritage Site',
      latitude: 27.469554,
      longitude: 83.275788,
      imageUrl: '/locations/Lumbini/1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    {
      name: 'Patan Durbar Square',
      description: 'Ancient royal palace complex with traditional Newari architecture',
      latitude: 27.6734,
      longitude: 85.3248,
      imageUrl: '/locations/patan/1.jpg',
      difficulty: Difficulty.EASY,
    },
    {
      name: 'Janakpur',
      description: 'Historical city famous for Janaki Mandir',
      latitude: 26.7286,
      longitude: 85.9250,
      imageUrl: '/locations/Janakpur/j1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    {
      name: 'Basantapur (Kathmandu Durbar Square)',
      description: 'Historic palace complex in the heart of Kathmandu',
      latitude: 27.7042,
      longitude: 85.3072,
      imageUrl: '/locations/basantpur/bd1.jpg',
      difficulty: Difficulty.EASY,
    },
    {
      name: 'Changu Narayan Temple',
      description: 'Ancient Hindu temple dedicated to Lord Vishnu',
      latitude: 27.7289,
      longitude: 85.4211,
      imageUrl: '/locations/Changunarayan/ch1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    {
      name: 'Manakamana Temple',
      description: 'Sacred temple accessible by cable car',
      latitude: 27.8943323,
      longitude: 84.5693859,
      imageUrl: '/locations/Manakamna/m1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    {
      name: 'Halesi Mahadev',
      description: 'Sacred cave temple in eastern Nepal',
      latitude: 27.1917,
      longitude: 86.6228,
      imageUrl: '/locations/halesi/h1.jpg',
      difficulty: Difficulty.HARD,
    },
    {
      name: 'Pathibhara Temple',
      description: 'Holy pilgrimage site in the eastern hills',
      latitude: 27.6058315,
      longitude: 87.7677222,
      imageUrl: '/locations/Pathibhara/pt1.jpg',
      difficulty: Difficulty.HARD,
    },
    {
      name: 'World Peace Pagoda, Pokhara',
      description: 'Buddhist monument overlooking Phewa Lake',
      latitude: 28.200735,
      longitude: 83.944809,
      imageUrl: '/locations/peacepegoda/1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    {
      name: 'Bhaktapur (Bhat)',
      description: 'Ancient Newari city with rich cultural heritage',
      latitude: 27.671,
      longitude: 85.4298,
      imageUrl: '/locations/bhat/b1.jpg',
      difficulty: Difficulty.EASY,
    },
  ];

  // Clear existing locations first
  await prisma.location.deleteMany({});
  console.log('🗑️  Cleared existing locations');

  // Create locations
  const createdLocations = await prisma.location.createMany({
    data: locations,
  });

  console.log(`✅ Seeded ${createdLocations.count} locations`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
