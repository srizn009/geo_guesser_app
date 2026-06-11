import { prisma } from '~/utils/db.server';
import type { Route } from './+types/api.random-location';

export async function action({ request }: Route.ActionArgs) {
  const body = await request.json();
  const { excludeIds = [] } = body;

  const totalCount = await prisma.location.count();

  if (totalCount === 0) {
    return Response.json({ location: null, error: 'no-locations' }, { status: 404 });
  }

  const availableLocations = await prisma.location.findMany({
    where: { id: { notIn: excludeIds } },
  });

  if (availableLocations.length === 0) {
    const skip = Math.floor(Math.random() * totalCount);
    const location = await prisma.location.findMany({ take: 1, skip });
    return Response.json({ location: location[0] || null });
  }

  const randomIndex = Math.floor(Math.random() * availableLocations.length);
  return Response.json({ location: availableLocations[randomIndex] });
}
