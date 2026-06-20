import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Sample Nepal locations with their coordinates
  const locations = [
    {
      name: 'Boudhanath Stupa',
      description: 'One of the largest Buddhist stupas in the world, UNESCO World Heritage Site in Kathmandu',
      latitude: 27.7215,
      longitude: 85.3616,
      imageUrl: '/locations/boudha/bo1.jpg',
      difficulty: Difficulty.EASY,
    },
    {
      name: 'Pashupatinath Temple',
      description: 'Sacred Hindu temple complex on the banks of Bagmati River, UNESCO World Heritage Site',
      latitude: 27.7104,
      longitude: 85.3486,
      imageUrl: '/locations/pashupatinath/p1.jpg',
      difficulty: Difficulty.EASY,
    },
    {
      name: 'Patan Durbar Square',
      description: 'Ancient royal palace complex with traditional Newari architecture, UNESCO World Heritage Site',
      latitude: 27.6734,
      longitude: 85.3248,
      imageUrl: '/locations/patan/1.jpg',
      difficulty: Difficulty.EASY,
    },
    {
      name: 'Basantapur (Kathmandu Durbar Square)',
      description: 'Historic palace complex in the heart of Kathmandu, UNESCO World Heritage Site',
      latitude: 27.7042,
      longitude: 85.3072,
      imageUrl: '/locations/basantpur/bd1.jpg',
      difficulty: Difficulty.EASY,
    },
    {
      name: 'Bhaktapur Durbar Square',
      description: 'Well-preserved medieval city square, UNESCO World Heritage Site',
      latitude: 27.671,
      longitude: 85.4298,
      imageUrl: '/locations/bhat/b1.jpg',
      difficulty: Difficulty.EASY,
    },
    {
      name: 'Swayambhunath Stupa (Monkey Temple)',
      description: 'Ancient Buddhist stupa overlooking Kathmandu Valley, UNESCO World Heritage Site',
      latitude: 27.7149,
      longitude: 85.2905,
      imageUrl: '/locations/swayambhu/sw1.jpg',
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
      name: 'Sagarmatha National Park',
      description: 'Home to Mount Everest and Himalayan landscapes, UNESCO World Heritage Site',
      latitude: 27.942569,
      longitude: 86.7505936,
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
      name: 'Janakpur',
      description: 'Historical city famous for Janaki Mandir',
      latitude: 26.7286,
      longitude: 85.9250,
      imageUrl: '/locations/Janakpur/j1.jpg',
      difficulty: Difficulty.MEDIUM,
    },

    {
      name: 'Changu Narayan Temple',
      description: 'Ancient Hindu temple dedicated to Lord Vishnu',
      latitude: 27.7163471,
      longitude: 85.4278969,
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
      description: 'Holy pilgrimage site in the eastern hills',
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
      name: 'Chitwan National Park',
      description: 'UNESCO World Heritage Site famous for one-horned rhinos and Bengal tigers',
      latitude: 27.5341,
      longitude: 84.4525,
      imageUrl: '/locations/chitwan/1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    // national parks 
    {
      name: 'Bardiya National Park',
      description: "Nepal's largest and most undisturbed Terai park, known for wild tigers and the Karnali River",
      latitude: 28.383,
      longitude: 81.5,
      imageUrl: '/locations/bardiya/1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    {
      name: 'Banke National Park',
      description: "Nepal's tenth national park, a key tiger corridor linking Bardiya National Park to forests in India",
      latitude: 28.1911,
      longitude: 81.9128,
      imageUrl: '/locations/banke/1.jpg',
      difficulty: Difficulty.HARD,
    },
    {
      name: 'Parsa National Park',
      description: 'Terai lowland park in the Sivalik Hills, home to wild elephants and four-horned antelope',
      latitude: 27.31889,
      longitude: 84.9125,
      imageUrl: '/locations/parsa/1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    {
      name: 'Shuklaphanta National Park',
      description: 'Open grasslands and wetlands in far-western Nepal, famous for the largest swamp deer herds in the world',
      latitude: 28.8402,
      longitude: 80.229,
      imageUrl: '/locations/shuklaphanta/1.jpg',
      difficulty: Difficulty.HARD,
    },
    {
      name: 'Langtang National Park',
      description: "Nepal's first Himalayan national park, with dramatic peaks just north of Kathmandu Valley",
      latitude: 28.1738,
      longitude: 85.5531,
      imageUrl: '/locations/langtang/1.jpg',
      difficulty: Difficulty.HARD,
    },
    {
      name: 'Makalu Barun National Park',
      description: "Remote park spanning from tropical forest to the world's fifth-highest peak, Mount Makalu",
      latitude: 27.75694,
      longitude: 87.11361,
      imageUrl: '/locations/makalu-barun/1.jpg',
      difficulty: Difficulty.HARD,
    },
    {
      name: 'Shey Phoksundo National Park',
      description: "Nepal's largest and only trans-Himalayan national park, home to the stunning turquoise Phoksundo Lake",
      latitude: 29.3581,
      longitude: 82.8456,
      imageUrl: '/locations/shey-phoksundo/1.jpg',
      difficulty: Difficulty.HARD,
    },
    {
      name: 'Rara National Park',
      description: "Nepal's smallest national park, centered around Rara Lake, the country's largest lake",
      latitude: 29.5,
      longitude: 82.067,
      imageUrl: '/locations/rara/1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    {
      name: 'Khaptad National Park',
      description: 'Tranquil mid-hill plateau park in far-western Nepal known for meadows and the Khaptad Baba ashram',
      latitude: 29.27,
      longitude: 80.99,
      imageUrl: '/locations/khaptad/1.jpg',
      difficulty: Difficulty.EASY,
    },
    {
      name: 'Shivapuri Nagarjun National Park',
      description: "Forested watershed on Kathmandu Valley's northern edge, a popular hiking and birdwatching spot",
      latitude: 27.795,
      longitude: 85.39,
      imageUrl: '/locations/shivapuri-nagarjun/1.jpg',
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
