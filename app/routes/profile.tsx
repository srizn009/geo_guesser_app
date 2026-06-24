import { redirect, Form, Link } from 'react-router';
import { requireUserId } from '~/utils/session.server';
import { prisma } from '~/utils/db.server';
import type { Route } from './+types/profile';
import { useState, useRef, useEffect } from 'react';

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullname: true,
      email: true,
      createdAt: true,
      games: {
        where: { status: 'COMPLETED' },
        select: { totalScore: true },
      },
    },
  });

  if (!user) throw redirect('/login');

  const totalScore = user.games.reduce((sum, g) => sum + g.totalScore, 0);
  const gamesPlayed = user.games.length;

  return { user, totalScore, gamesPlayed };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  if (formData.get('intent') === 'logout') {
    const { logout } = await import('~/utils/session.server');
    return logout(request);
  }
  return null;
}

export default function Profile({ loaderData }: Route.ComponentProps) {
  const { user, totalScore, gamesPlayed } = loaderData;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header — same nav structure as dashboard */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <nav className="flex items-center gap-1">
            <Link
              to="/game"
              className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition"
            >
              Dashboard
            </Link>
            <Link
              to="/leaderboard"
              className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition"
            >
              Leaderboard
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Score</p>
              <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">{totalScore} pts</p>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm hover:ring-2 hover:ring-indigo-400 hover:ring-offset-2 dark:hover:ring-offset-gray-800 transition"
                aria-label="User menu"
              >
                {user.fullname.charAt(0).toUpperCase()}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.fullname}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Edit Profile
                  </Link>
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    <Form method="post">
                      <button
                        type="submit"
                        name="intent"
                        value="logout"
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </Form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-4">
        {/* Profile card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Cover gradient */}
          <div className="h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          {/* Avatar + name */}
          <div className="px-6 pb-6">
            <div className="-mt-12 mb-4 flex items-end justify-between">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-white dark:border-gray-800 flex items-center justify-center text-white font-black text-3xl shadow-lg">
                {user.fullname.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 pb-1">Joined {joinedDate}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.fullname}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 text-center">
            <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{totalScore}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Total Score</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 text-center">
            <p className="text-3xl font-black text-green-600 dark:text-green-400">{gamesPlayed}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Games Played</p>
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Basic Information</h3>
          </div>
          <dl className="divide-y divide-gray-100 dark:divide-gray-700">
            {[
              { label: 'Full Name', value: user.fullname },
              { label: 'Email Address', value: user.email },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-6 py-4">
                <dt className="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="text-sm font-semibold text-gray-900 dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </main>
    </div>
  );
}
