import bcrypt from 'bcryptjs';
import { prisma } from './db.server';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(
  fullname: string,
  email: string,
  password: string,
  faculty: 'BSC_IT' | 'BBA',
  year: 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH'
) {
  const hashedPassword = await hashPassword(password);
  
  return prisma.user.create({
    data: {
      fullname: fullname.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      faculty,
      year,
    },
  });
}

export async function verifyLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.password);
  
  if (!isValid) {
    return null;
  }

  return { id: user.id, email: user.email, fullname: user.fullname };
}
