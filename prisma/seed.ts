import 'dotenv/config';
import { PrismaClient, Difficulty } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Sample Nepal locations with their coordinates
  // Coordinates are tuned for best outdoor Google Street View panorama position
  const locations = [
    {
      name: 'Boudhanath Stupa',
      description: 'One of the largest Buddhist stupas in the world, UNESCO World Heritage Site in Kathmandu',
      // On the outer kora (circumambulation road) northeast of the stupa
      latitude: 27.7221,
      longitude: 85.3619,
      imageUrl: '/locations/boudha/bo1.jpg',
      difficulty: Difficulty.EASY,
    },
    {
      name: 'Pashupatinath Temple',
      description: 'Sacred Hindu temple complex on the banks of Bagmati River, UNESCO World Heritage Site',
      // On the road facing the main temple entrance
      latitude: 27.7108,
      longitude: 85.3492,
      imageUrl: '/locations/pashupatinath/p1.jpg',
      difficulty: Difficulty.EASY,
    },
    {
      name: 'Patan Durbar Square',
      description: 'Ancient royal palace complex with traditional Newari architecture, UNESCO World Heritage Site',
      // Centre of the square near Krishna Mandir
      latitude: 27.6731,
      longitude: 85.3252,
      imageUrl: '/locations/patan/1.jpg',
      difficulty: Difficulty.EASY,
    },
    {
      name: 'Basantapur (Kathmandu Durbar Square)',
      description: 'Historic palace complex in the heart of Kathmandu, UNESCO World Heritage Site',
      // Main plaza in front of Taleju Temple
      latitude: 27.7041,
      longitude: 85.3073,
      imageUrl: '/locations/basantpur/bd1.jpg',
      difficulty: Difficulty.EASY,
    },
    {
      name: 'Bhaktapur Durbar Square',
      description: 'Well-preserved medieval city square, UNESCO World Heritage Site',
      // In front of the 55-Window Palace
      latitude: 27.6724,
      longitude: 85.4288,
      imageUrl: '/locations/bhat/b1.jpg',
      difficulty: Difficulty.EASY,
    },
    {
      name: 'Swayambhunath Stupa (Monkey Temple)',
      description: 'Ancient Buddhist stupa overlooking Kathmandu Valley, UNESCO World Heritage Site',
      // At the hilltop plaza around the main stupa
      latitude: 27.7152,
      longitude: 85.2906,
      imageUrl: '/locations/swayambhu/sw1.jpg',
      difficulty: Difficulty.EASY,
    },
    {
      name: 'Pokhara',
      description: 'Beautiful lakeside city with stunning mountain views',
      // Lakeside (Baidam) road along Phewa Lake
      latitude: 28.2091,
      longitude: 83.9582,
      imageUrl: '/locations/pokhara/po1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    {
      name: 'Sagarmatha National Park',
      description: 'Home to Mount Everest and Himalayan landscapes, UNESCO World Heritage Site',
      // Namche Bazaar — main town in the Khumbu, Google trekker imagery available
      latitude: 27.8050,
      longitude: 86.7141,
      imageUrl: '/locations/everest/e1.jpg',
      difficulty: Difficulty.HARD,
    },
    {
      name: 'Lumbini',
      description: 'Birthplace of Lord Buddha, UNESCO World Heritage Site',
      // Sacred Garden path near the Maya Devi Temple
      latitude: 27.4835,
      longitude: 83.2761,
      imageUrl: '/locations/Lumbini/1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    {
      name: 'Janakpur',
      description: 'Historical city famous for Janaki Mandir',
      // Road directly in front of Janaki Mandir
      latitude: 26.7305,
      longitude: 85.9274,
      imageUrl: '/locations/Janakpur/j1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    {
      name: 'Changu Narayan Temple',
      description: 'Ancient Hindu temple dedicated to Lord Vishnu',
      // Village approach road leading to the temple
      latitude: 27.7165,
      longitude: 85.4281,
      imageUrl: '/locations/Changunarayan/ch1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    {
      name: 'Manakamana Temple',
      description: 'Sacred temple accessible by cable car',
      // Upper cable car station area near the temple
      latitude: 27.8946,
      longitude: 84.5697,
      imageUrl: '/locations/Manakamna/m1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    {
      name: 'Halesi Mahadev',
      description: 'Holy pilgrimage site in the eastern hills',
      // Approach road to the cave temple complex
      latitude: 27.1919,
      longitude: 86.6231,
      imageUrl: '/locations/halesi/h1.jpg',
      difficulty: Difficulty.HARD,
    },
    {
      name: 'Pathibhara Temple',
      description: 'High-altitude pilgrimage temple in the eastern Taplejung hills',
      // Trail near the temple at ~3,794 m — minimal outdoor Street View; falls back to image
      latitude: 27.4324,
      longitude: 87.7792,
      imageUrl: '/locations/Pathibhara/pt1.jpg',
      difficulty: Difficulty.HARD,
    },
    {
      name: 'World Peace Pagoda, Pokhara',
      description: 'Buddhist monument overlooking Phewa Lake',
      // Hilltop path around the pagoda with lake views
      latitude: 28.2004,
      longitude: 83.9451,
      imageUrl: '/locations/peacepegoda/1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    {
      name: 'Chitwan National Park',
      description: 'UNESCO World Heritage Site famous for one-horned rhinos and Bengal tigers',
      // Sauraha main road — tourist hub at the park entrance
      latitude: 27.5291,
      longitude: 84.4007,
      imageUrl: '/locations/chitwan/1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    // national parks
    {
      name: 'Bardiya National Park',
      description: "Nepal's largest and most undisturbed Terai park, known for wild tigers and the Karnali River",
      // Thakurdwara village — main park entry point
      latitude: 28.3376,
      longitude: 81.5252,
      imageUrl: '/locations/bardiya/1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    {
      name: 'Banke National Park',
      description: "Nepal's tenth national park, a key tiger corridor linking Bardiya National Park to forests in India",
      // Kohalpur area — nearest road with potential coverage
      latitude: 28.2038,
      longitude: 81.7220,
      imageUrl: '/locations/banke/1.jpg',
      difficulty: Difficulty.HARD,
    },
    {
      name: 'Parsa National Park',
      description: 'Terai lowland park in the Sivalik Hills, home to wild elephants and four-horned antelope',
      // Bara district road near park boundary
      latitude: 27.3650,
      longitude: 84.9120,
      imageUrl: '/locations/parsa/1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    {
      name: 'Shuklaphanta National Park',
      description: 'Open grasslands and wetlands in far-western Nepal, famous for the largest swamp deer herds in the world',
      // Mahendranagar approach road — nearest town with coverage
      latitude: 28.9688,
      longitude: 80.1828,
      imageUrl: '/locations/shuklaphanta/1.jpg',
      difficulty: Difficulty.HARD,
    },
    {
      name: 'Langtang National Park',
      description: "Nepal's first Himalayan national park, with dramatic peaks just north of Kathmandu Valley",
      // Syabrubesi — trekking start village, Google trekker imagery available
      latitude: 28.1624,
      longitude: 85.3423,
      imageUrl: '/locations/langtang/1.jpg',
      difficulty: Difficulty.HARD,
    },
    {
      name: 'Makalu Barun National Park',
      description: "Remote park spanning from tropical forest to the world's fifth-highest peak, Mount Makalu",
      // Tumlingtar — gateway town with road coverage
      latitude: 27.3149,
      longitude: 87.1933,
      imageUrl: '/locations/makalu-barun/1.jpg',
      difficulty: Difficulty.HARD,
    },
    {
      name: 'Shey Phoksundo National Park',
      description: "Nepal's largest and only trans-Himalayan national park, home to the stunning turquoise Phoksundo Lake",
      // Dunai — district headquarters, nearest road-level coverage
      latitude: 28.9414,
      longitude: 82.8940,
      imageUrl: '/locations/shey-phoksundo/1.jpg',
      difficulty: Difficulty.HARD,
    },
    {
      name: 'Rara National Park',
      description: "Nepal's smallest national park, centered around Rara Lake, the country's largest lake",
      // Mugu district road near Gamgadhi — closest accessible town
      latitude: 29.5188,
      longitude: 82.0783,
      imageUrl: '/locations/rara/1.jpg',
      difficulty: Difficulty.MEDIUM,
    },
    {
      name: 'Khaptad National Park',
      description: 'Tranquil mid-hill plateau park in far-western Nepal known for meadows and the Khaptad Baba ashram',
      // Silgadhi — nearest town in Doti district
      latitude: 29.2612,
      longitude: 81.0000,
      imageUrl: '/locations/khaptad/1.jpg',
      difficulty: Difficulty.HARD,
    },
    {
      name: 'Shivapuri Nagarjun National Park',
      description: "Forested watershed on Kathmandu Valley's northern edge, a popular hiking and birdwatching spot",
      // Budhanilkantha area — main park entry road with Street View coverage
      latitude: 27.7950,
      longitude: 85.3649,
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
