import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { Product } from '../entities/Product';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';

async function main(): Promise<void> {
  await AppDataSource.initialize();

  const productRepo = AppDataSource.getRepository(Product);
  const userRepo = AppDataSource.getRepository(User);

  const products: Array<Partial<Product>> = [
    { slug: 'eco-glass-bottle-500ml', name: 'Eco Glass Bottle 500ml', priceCents: 1499, imageUrl: 'https://cdn.pixabay.com/photo/2025/08/09/18/23/knight-9765068_1280.jpg', shortDescription: 'Durable glass bottle with bamboo lid.' },
    { slug: 'eco-glass-bottle-750ml', name: 'Eco Glass Bottle 750ml', priceCents: 1799, imageUrl: 'https://cdn.pixabay.com/photo/2025/08/09/18/23/knight-9765068_1280.jpg', shortDescription: 'Hydrate more with the 750ml size.' },
    { slug: 'stainless-steel-bottle-500ml', name: 'Stainless Steel Bottle 500ml', priceCents: 1999, imageUrl: 'https://cdn.pixabay.com/photo/2025/08/09/18/23/knight-9765068_1280.jpg', shortDescription: 'Insulated to keep drinks cold.' },
    { slug: 'stainless-steel-bottle-1l', name: 'Stainless Steel Bottle 1L', priceCents: 2499, imageUrl: 'https://cdn.pixabay.com/photo/2025/08/09/18/23/knight-9765068_1280.jpg', shortDescription: 'Large insulated bottle for long days.' },
    { slug: 'bamboo-thermos-450ml', name: 'Bamboo Thermos 450ml', priceCents: 2299, imageUrl: 'https://cdn.pixabay.com/photo/2025/08/09/18/23/knight-9765068_1280.jpg', shortDescription: 'Sustainable bamboo exterior thermos.' },
    { slug: 'travel-mug-350ml', name: 'Travel Mug 350ml', priceCents: 1299, imageUrl: 'https://cdn.pixabay.com/photo/2025/08/09/18/23/knight-9765068_1280.jpg', shortDescription: 'Leak-proof mug for your commute.' },
    { slug: 'kids-bottle-300ml', name: 'Kids Bottle 300ml', priceCents: 999, imageUrl: 'https://cdn.pixabay.com/photo/2025/08/09/18/23/knight-9765068_1280.jpg', shortDescription: 'Lightweight and durable for kids.' },
    { slug: 'fruit-infuser-bottle', name: 'Fruit Infuser Bottle', priceCents: 1599, imageUrl: 'https://cdn.pixabay.com/photo/2025/08/09/18/23/knight-9765068_1280.jpg', shortDescription: 'Infuse water with fresh fruit flavors.' },
    { slug: 'collapsible-bottle-600ml', name: 'Collapsible Bottle 600ml', priceCents: 1399, imageUrl: 'https://cdn.pixabay.com/photo/2025/08/09/18/23/knight-9765068_1280.jpg', shortDescription: 'Space-saving design for travel.' },
    { slug: 'sport-bottle-800ml', name: 'Sport Bottle 800ml', priceCents: 1699, imageUrl: 'https://cdn.pixabay.com/photo/2025/08/09/18/23/knight-9765068_1280.jpg', shortDescription: 'Wide mouth and easy-grip body.' },
    { slug: 'glass-carafe-1l', name: 'Glass Carafe 1L', priceCents: 1899, imageUrl: 'https://cdn.pixabay.com/photo/2025/08/09/18/23/knight-9765068_1280.jpg', shortDescription: 'Elegant carafe for home or office.' },
    { slug: 'thermo-flask-2l', name: 'Thermo Flask 2L', priceCents: 2999, imageUrl: 'https://cdn.pixabay.com/photo/2025/08/09/18/23/knight-9765068_1280.jpg', shortDescription: 'Heavy-duty flask for adventures.' }
  ];

  for (const p of products) {
    const existing = await productRepo.findOne({ where: { slug: p.slug! } });
    if (existing) {
      existing.name = p.name!;
      existing.priceCents = p.priceCents!;
      existing.imageUrl = p.imageUrl!;
      existing.shortDescription = p.shortDescription!;
      await productRepo.save(existing);
    } else {
      await productRepo.save(productRepo.create(p));
    }
  }

  const email = 'test@example.com';
  const passwordHash = await bcrypt.hash('Passw0rd!', 10);
  const existingUser = await userRepo.findOne({ where: { email } });
  if (!existingUser) {
    await userRepo.save(userRepo.create({ email, passwordHash }));
  }

  console.log('Seed completed');
  await AppDataSource.destroy();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await AppDataSource.destroy();
  } catch {}
  process.exit(1);
});
