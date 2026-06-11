import { requireUserId } from '~/utils/session.server';
import { prisma } from '~/utils/db.server';
import { Form, Link } from 'react-router';
import type { Route } from './+types/leaderboard';
import { useState, useRef, useEffect } from 'react';

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  
  // Get current user
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullname: true,
      email: true,
    },
  });

  // Get all users with their total scores
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullname: true,
      faculty: true,
      year: true,
      games: {
        where: { status: 'COMPLETED' },
        select: {
          totalScore: true,
        },
      },
    },
  });

  // Calculate total scores and sort
  const leaderboard = users
    .map((user) => ({
      id: user.id,
      fullname: user.fullname,
      faculty: user.faculty,
      year: user.year,
      totalScore: user.games.reduce((sum, game) => sum + game.totalScore, 0),
      gamesPlayed: user.games.length,
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  // Find current user's rank
  const currentUserRank = leaderboard.findIndex((user) => user.id === userId) + 1;
  const currentUserData = leaderboard.find((user) => user.id === userId);

  return { currentUser, leaderboard, currentUserRank, currentUserData };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'logout') {
    const { logout } = await import('~/utils/session.server');
    return logout(request);
  }

  return null;
}

export default function Leaderboard({ loaderData }: Route.ComponentProps) {
  const { currentUser, leaderboard, currentUserRank, currentUserData } = loaderData;
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

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  const getFacultyBadgeColor = (faculty: string) => {
    return faculty === 'BSC_IT'
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: nav */}
          <nav className="flex items-center gap-1">
            <Link
              to="/game"
              className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition"
            >
              Dashboard
            </Link>
            <Link
              to="/leaderboard"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
            >
              Leaderboard
            </Link>
          </nav>

          {/* Right: rank + avatar dropdown */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Your Rank</p>
              <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">#{currentUserRank}</p>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm hover:ring-2 hover:ring-indigo-400 hover:ring-offset-2 dark:hover:ring-offset-gray-800 transition"
                aria-label="User menu"
              >
                {currentUser?.fullname.charAt(0).toUpperCase()}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{currentUser?.fullname}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Your Stats Card */}
        {currentUserData && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80 mb-1">Your Ranking</p>
                <div className="flex items-center space-x-3">
                  <span className="text-4xl font-bold">
                    {getRankEmoji(currentUserRank)} #{currentUserRank}
                  </span>
                  <div className="border-l border-white/30 pl-3">
                    <p className="text-2xl font-bold">{currentUserData.totalScore} pts</p>
                    <p className="text-sm text-white/80">{currentUserData.gamesPlayed} games played</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="text-sm font-medium">{currentUser?.fullname}</p>
                  <p className="text-xs text-white/80">
                    {currentUserData.faculty === 'BSC_IT' ? 'BSC IT' : 'BBA'} • {currentUserData.year === 'FIRST' ? '1st' : currentUserData.year === 'SECOND' ? '2nd' : currentUserData.year === 'THIRD' ? '3rd' : '4th'} Year
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Top Players
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Compete with {leaderboard.length} players across Nepal
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Faculty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Games
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {leaderboard.map((user, index) => {
                  const rank = index + 1;
                  const isCurrentUser = user.id === currentUser?.id;
                  
                  return (
                    <tr
                      key={user.id}
                      className={`${
                        isCurrentUser
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      } transition`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">{getRankEmoji(rank)}</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                              {user.fullname.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.fullname}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                                  (You)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getFacultyBadgeColor(user.faculty)}`}>
                          {user.faculty === 'BSC_IT' ? 'BSC IT' : 'BBA'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.year === 'FIRST' ? '1st' : user.year === 'SECOND' ? '2nd' : user.year === 'THIRD' ? '3rd' : '4th'} Year
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                        {user.gamesPlayed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          {user.totalScore}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">pts</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
