import { createCookieSessionStorage, redirect } from 'react-router';

const sessionSecret = process.env.SESSION_SECRET || 'default-secret-change-in-production';

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: '__session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
  },
});

export { getSession, commitSession, destroySession };

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await getSession();
  session.set('userId', userId);
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

export async function getUserSession(request: Request) {
  return getSession(request.headers.get('Cookie'));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get('userId');
  if (!userId || typeof userId !== 'string') return null;
  return userId;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = '/login'
) {
  const userId = await getUserId(request);
  if (!userId) {
    throw redirect(redirectTo);
  }
  return userId;
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect('/login', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
}
