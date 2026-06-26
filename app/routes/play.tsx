/// <reference types="@types/google.maps" />
import { requireUserId } from '~/utils/session.server';
import { prisma } from '~/utils/db.server';
import { redirect, useFetcher, Form, Link } from 'react-router';
import type { Route } from './+types/play';
import { useState, useEffect, useRef } from 'react';

// Premium SVG pin markers
const GUESS_PIN = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52">
    <defs><filter id="s"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#00000066"/></filter></defs>
    <path d="M20 2C11.16 2 4 9.16 4 18c0 12.5 16 32 16 32S36 30.5 36 18C36 9.16 28.84 2 20 2z" fill="#EF4444" filter="url(#s)"/>
    <circle cx="20" cy="18" r="7" fill="white" opacity="0.95"/>
    <circle cx="20" cy="18" r="3.5" fill="#EF4444"/>
  </svg>`
)}`;

const ACTUAL_PIN = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52">
    <defs><filter id="s"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#00000066"/></filter></defs>
    <path d="M20 2C11.16 2 4 9.16 4 18c0 12.5 16 32 16 32S36 30.5 36 18C36 9.16 28.84 2 20 2z" fill="#10B981" filter="url(#s)"/>
    <path d="M14 18l4.5 4.5L26 12" stroke="white" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`
)}`;

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullname: true,
      email: true,
    },
  });

  if (!user) throw redirect('/login');

  const locationsCount = await prisma.location.count();

  if (locationsCount === 0) {
    return { user, location: null, error: 'no-locations', googleMapsApiKey: null };
  }

  const skip = Math.floor(Math.random() * locationsCount);
  const location: any = await prisma.location.findMany({ take: 1, skip });

  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';

  return { user, location: location[0] || null, error: null, googleMapsApiKey };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'logout') {
    const { logout } = await import('~/utils/session.server');
    return logout(request);
  }

  if (intent === 'complete-game') {
    const totalScore = Number(formData.get('totalScore'));
    const roundsData = JSON.parse(formData.get('roundsData') as string);

    const game = await prisma.game.create({
      data: { userId, totalScore, status: 'COMPLETED', completedAt: new Date() },
    });

    await prisma.guess.createMany({
      data: roundsData.map((round: any) => ({
        gameId: game.id,
        locationId: round.locationId,
        guessedLatitude: round.guessedLat,
        guessedLongitude: round.guessedLng,
        distance: round.distance,
        points: round.score,
      })),
    });

    return { saved: true };
  }

  return null;
}

type RoundData = {
  round: number;
  locationId: string;
  locationName: string;
  guessedLat: number;
  guessedLng: number;
  actualLat: number;
  actualLng: number;
  distance: number;
  score: number;
};

// Haversine distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateScore(dist: number) {
  return Math.max(0, Math.round(1000 * Math.exp(-dist / 50)));
}

function getScoreColor(s: number) {
  if (s >= 800) return 'text-emerald-400';
  if (s >= 500) return 'text-yellow-400';
  if (s >= 200) return 'text-orange-400';
  return 'text-red-400';
}

export default function Play({ loaderData }: Route.ComponentProps) {
  const { user, location: initialLocation, error, googleMapsApiKey } = loaderData;

  // Game state
  const [currentRound, setCurrentRound] = useState(1);
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [usedLocationIds, setUsedLocationIds] = useState<string[]>(
    initialLocation ? [initialLocation.id] : []
  );
  const [currentLocation, setCurrentLocation] = useState(initialLocation);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [mainScore, setMainScore] = useState<number | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timedOut, setTimedOut] = useState(false);
  const [mapType, setMapType] = useState<'hybrid' | 'roadmap'>('roadmap');

  // Animated display values for count-up
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedDistance, setAnimatedDistance] = useState(0);

  // Avatar dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Map refs
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const actualMarkerRef = useRef<google.maps.Marker | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const isSubmittedRef = useRef(false);
  const fetcher = useFetcher();

  // Street View
  const [useStreetView, setUseStreetView] = useState(false);
  const [panoPosition, setPanoPosition] = useState<{ lat: number; lng: number } | null>(null);
  const streetViewRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);

  // Sync isSubmitted to ref (avoids stale closure in map click listener)
  useEffect(() => {
    isSubmittedRef.current = isSubmitted;
  }, [isSubmitted]);

  // Dropdown outside-click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Count-up animation when score/distance revealed
  useEffect(() => {
    if (mainScore === null) { setAnimatedScore(0); return; }
    const target = mainScore;
    const steps = 60;
    let step = 0;
    const id = setInterval(() => {
      step++;
      const eased = 1 - (1 - step / steps) ** 2;
      setAnimatedScore(Math.round(target * eased));
      if (step >= steps) clearInterval(id);
    }, 1400 / steps);
    return () => clearInterval(id);
  }, [mainScore]);

  useEffect(() => {
    if (distance === null) { setAnimatedDistance(0); return; }
    const target = distance;
    const steps = 60;
    let step = 0;
    const id = setInterval(() => {
      step++;
      const eased = 1 - (1 - step / steps) ** 2;
      setAnimatedDistance(parseFloat((target * eased).toFixed(1)));
      if (step >= steps) clearInterval(id);
    }, 1400 / steps);
    return () => clearInterval(id);
  }, [distance]);

  // Countdown timer
  useEffect(() => {
    if (isSubmitted || gameCompleted || timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isSubmitted, gameCompleted]);

  // Force-submit on timeout
  useEffect(() => {
    if (timeLeft === 0 && !isSubmitted && !gameCompleted) {
      setTimedOut(true);
      setMainScore(0);
      if (currentLocation) {
        const dist = selectedCoords
          ? calculateDistance(selectedCoords.lat, selectedCoords.lng, currentLocation.latitude, currentLocation.longitude)
          : null;
        setDistance(dist);
        setRounds(prev => [...prev, {
          round: currentRound,
          locationId: currentLocation.id,
          locationName: currentLocation.name,
          guessedLat: selectedCoords?.lat ?? 0,
          guessedLng: selectedCoords?.lng ?? 0,
          actualLat: currentLocation.latitude,
          actualLng: currentLocation.longitude,
          distance: dist ?? 0,
          score: 0,
        }]);
      }
      setIsSubmitted(true);
    }
  }, [timeLeft]);

  // Auto-save game on completion
  useEffect(() => {
    if (gameCompleted && rounds.length > 0 && fetcher.state === 'idle' && !fetcher.data) {
      const totalScore = rounds.reduce((sum, r) => sum + r.score, 0);
      fetcher.submit(
        { intent: 'complete-game', totalScore: String(totalScore), roundsData: JSON.stringify(rounds) },
        { method: 'post' }
      );
    }
  }, [gameCompleted]);

  // Check Street View coverage whenever the location changes
  useEffect(() => {
    if (!map || !currentLocation) return;
    setUseStreetView(false);
    setPanoPosition(null);
    if (panoramaRef.current) { panoramaRef.current.setVisible(false); panoramaRef.current = null; }

    let cancelled = false;
    const sv = new google.maps.StreetViewService();
    sv.getPanorama(
      { location: { lat: currentLocation.latitude, lng: currentLocation.longitude }, radius: 100, source: google.maps.StreetViewSource.OUTDOOR },
      (data: google.maps.StreetViewPanoramaData | null, status: string) => {
        if (cancelled) return;
        if (status === 'OK' && data?.location?.latLng) {
          const pos = data.location.latLng;
          setPanoPosition({ lat: pos.lat(), lng: pos.lng() });
          setUseStreetView(true);
        }
      }
    );
    return () => { cancelled = true; };
  }, [map, currentLocation]);

  // Initialize panorama once the Street View container div is rendered
  useEffect(() => {
    if (!useStreetView || !panoPosition || !streetViewRef.current) return;
    panoramaRef.current = new google.maps.StreetViewPanorama(streetViewRef.current, {
      position: panoPosition,
      addressControl: false,
      showRoadLabels: false,
      enableCloseButton: false,
      fullscreenControl: false,
      motionTracking: false,
      motionTrackingControl: false,
    });
    // Wait for the browser to paint the container with real dimensions before
    // triggering resize — without this Street View sees a zero-size box and goes black
    requestAnimationFrame(() => {
      if (panoramaRef.current) {
        google.maps.event.trigger(panoramaRef.current, 'resize');
      }
    });
  }, [useStreetView, panoPosition]);

  // Initialize Google Maps (once — no currentLocation in deps)
  useEffect(() => {
    if (!googleMapsApiKey || !mapRef.current) return;

    const initMap = async () => {
      const { Loader } = await import('@googlemaps/js-api-loader');
      const loader = new Loader({ apiKey: googleMapsApiKey, version: 'weekly' });

      try {
        const { Map } = await loader.importLibrary('maps') as google.maps.MapsLibrary;
        const mapInstance = new Map(mapRef.current!, {
          center: { lat: 28.3949, lng: 84.124 },
          zoom: 7,
          mapTypeId: 'roadmap',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        });

        setMap(mapInstance);

        mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (isSubmittedRef.current) return;
          const lat = e.latLng?.lat();
          const lng = e.latLng?.lng();
          if (lat !== undefined && lng !== undefined) {
            setSelectedCoords({ lat, lng });
            if (markerRef.current) { markerRef.current.setMap(null); markerRef.current = null; }
            markerRef.current = new google.maps.Marker({
              position: { lat, lng },
              map: mapInstance,
              icon: { url: GUESS_PIN, scaledSize: new google.maps.Size(36, 47), anchor: new google.maps.Point(18, 47) },
              animation: google.maps.Animation.DROP,
            });
          }
        });
      } catch (err) {
        console.error('Error loading Google Maps:', err);
      }
    };

    initMap();
  }, [googleMapsApiKey]);

  // Show actual marker + polyline after submission
  useEffect(() => {
    if (isSubmitted && map && currentLocation && !actualMarkerRef.current) {
      actualMarkerRef.current = new google.maps.Marker({
        position: { lat: currentLocation.latitude, lng: currentLocation.longitude },
        map,
        icon: { url: ACTUAL_PIN, scaledSize: new google.maps.Size(36, 47), anchor: new google.maps.Point(18, 47) },
        animation: google.maps.Animation.BOUNCE,
      });

      if (selectedCoords) {
        polylineRef.current = new google.maps.Polyline({
          path: [
            { lat: selectedCoords.lat, lng: selectedCoords.lng },
            { lat: currentLocation.latitude, lng: currentLocation.longitude },
          ],
          geodesic: true,
          strokeColor: '#6366F1',
          strokeOpacity: 0.85,
          strokeWeight: 3,
          map,
        });

        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: selectedCoords.lat, lng: selectedCoords.lng });
        bounds.extend({ lat: currentLocation.latitude, lng: currentLocation.longitude });
        map.fitBounds(bounds);
      }
    }
  }, [isSubmitted, map, currentLocation, selectedCoords]);

  const loadNextLocation = async () => {
    try {
      const response = await fetch('/api/random-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excludeIds: usedLocationIds }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.location) {
          setCurrentLocation(data.location);
          setUsedLocationIds(prev => [...prev, data.location.id]);
        }
      }
    } catch (err) {
      console.error('Error loading next location:', err);
    }
  };

  const handleSubmit = () => {
    if (!selectedCoords || !currentLocation) return;
    const dist = calculateDistance(selectedCoords.lat, selectedCoords.lng, currentLocation.latitude, currentLocation.longitude);
    setDistance(dist);
    const score = calculateScore(dist);
    setMainScore(score);
    setRounds(prev => [...prev, {
      round: currentRound,
      locationId: currentLocation.id,
      locationName: currentLocation.name,
      guessedLat: selectedCoords.lat,
      guessedLng: selectedCoords.lng,
      actualLat: currentLocation.latitude,
      actualLng: currentLocation.longitude,
      distance: dist,
      score,
    }]);
    setIsSubmitted(true);
  };

  const toggleMapType = () => {
    const next = mapType === 'hybrid' ? 'roadmap' : 'hybrid';
    setMapType(next);
    map?.setMapTypeId(next);
  };

  const handleNextRound = async () => {
    if (currentRound >= 5) {
      setGameCompleted(true);
    } else {
      setSelectedCoords(null);
      setIsSubmitted(false);
      setDistance(null);
      setMainScore(null);
      setTimedOut(false);
      setTimeLeft(60);
      setAnimatedScore(0);
      setAnimatedDistance(0);
      setUseStreetView(false);
      setPanoPosition(null);

      if (markerRef.current) { markerRef.current.setMap(null); markerRef.current = null; }
      if (actualMarkerRef.current) { actualMarkerRef.current.setMap(null); actualMarkerRef.current = null; }
      if (polylineRef.current) { polylineRef.current.setMap(null); polylineRef.current = null; }
      if (panoramaRef.current) { panoramaRef.current.setVisible(false); panoramaRef.current = null; }

      if (map) { map.setCenter({ lat: 28.3949, lng: 84.124 }); map.setZoom(7); }

      await loadNextLocation();
      setCurrentRound(r => r + 1);
    }
  };

  // ── No-locations error state ──────────────────────────────────────────────
  if (error === 'no-locations' || !currentLocation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-5">
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Locations Available</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Run <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-sm font-mono">npm run db:seed</code> to populate the database.</p>
          <a href="/game" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl transition">← Back to Dashboard</a>
        </div>
      </div>
    );
  }

  // ── Game Completed screen ─────────────────────────────────────────────────
  if (gameCompleted) {
    const totalScore = rounds.reduce((sum, r) => sum + r.score, 0);
    const isSaving = fetcher.state !== 'idle';
    const isSaved = !!fetcher.data;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8 text-center text-white">
            <div className="text-5xl mb-3">🏆</div>
            <h1 className="text-3xl font-extrabold mb-1">Game Complete!</h1>
            <p className="text-indigo-200 text-sm">{user.fullname} · 5 rounds finished</p>
            <p className="text-6xl font-black mt-4">{totalScore}</p>
            <p className="text-indigo-200 text-sm mt-1">out of 5,000 points</p>
            <div className="mt-3 bg-white/20 rounded-full px-4 py-1 inline-block">
              <span className="text-sm font-semibold">
                {totalScore >= 4000 ? 'Nepal Expert!' : totalScore >= 2500 ? 'Explorer!' : totalScore >= 1000 ? 'Adventurer' : 'Beginner'}
              </span>
            </div>
          </div>

          <div className="px-8 py-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Round Breakdown</h3>
            <div className="space-y-2">
              {rounds.map((r) => (
                <div key={r.round} className="flex items-center justify-between bg-gray-700/50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-900/60 text-indigo-400 text-xs font-bold flex items-center justify-center">{r.round}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-200">{r.locationName}</p>
                      <p className="text-xs text-gray-400">{r.distance.toFixed(1)} km away</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${getScoreColor(r.score)}`}>+{r.score}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-8 pb-8 space-y-3">
            {isSaving && <p className="text-center text-xs text-gray-400 animate-pulse">Saving your score…</p>}
            {isSaved && <p className="text-center text-xs text-emerald-400">Score saved!</p>}
            <div className="grid grid-cols-2 gap-3">
              <a href="/play" className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Play Again
              </a>
              <a href="/leaderboard" className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Leaderboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Running totals
  const runningScore = rounds.reduce((s, r) => s + r.score, 0);
  const urgentTimer = timeLeft > 0 && timeLeft <= 10 && !isSubmitted;

  // ── Main game screen ──────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Keyframe animations */}
      <style>{`
        @keyframes urgentBlink{0%,100%{opacity:0.07;}50%{opacity:0.32;}}
        @keyframes numberBeat{0%,100%{transform:scale(0.9);}50%{transform:scale(1.1);}}
        @keyframes scoreReveal{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
      `}</style>

      {/* Urgent timer overlay (red blink + giant number) */}
      {urgentTimer && (
        <>
          <div className="fixed inset-0 bg-red-500 pointer-events-none z-50" style={{ animation: 'urgentBlink 0.5s ease-in-out infinite' }} />
          <div className="fixed inset-0 pointer-events-none z-50" style={{ boxShadow: 'inset 0 0 0 8px rgba(239,68,68,0.75)' }} />
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
            <span className="font-black text-red-500/20 select-none leading-none" style={{ fontSize: '28vmin', animation: 'numberBeat 0.5s ease-in-out infinite' }}>
              {timeLeft}
            </span>
          </div>
        </>
      )}

      {/* ── Header ── */}
      <header className="bg-gray-800 border-b border-gray-700 flex-shrink-0 z-30">
        <div className="max-w-full px-6 h-14 flex items-center justify-between relative">
          {/* Nav pills */}
          <nav className="flex items-center gap-1">
            <Link to="/game" className="px-4 py-1.5 text-sm font-medium rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition">
              Dashboard
            </Link>
            <Link to="/leaderboard" className="px-4 py-1.5 text-sm font-medium rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition">
              Leaderboard
            </Link>
          </nav>

          {/* Centered logo */}
          <Link to="/game" className="absolute left-1/2 -translate-x-1/2 flex items-center bg-white rounded-lg px-3 py-1" aria-label="Home">
            <img src="/logo.svg" alt="Presidential" className="h-7 w-auto" />
          </Link>

          {/* Avatar dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm hover:ring-2 hover:ring-indigo-400 hover:ring-offset-2 hover:ring-offset-gray-800 transition"
              aria-label="User menu"
            >
              {user.fullname.charAt(0).toUpperCase()}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden z-50">
                <div className="px-4 py-3 bg-gray-700/50 border-b border-gray-700">
                  <p className="text-sm font-semibold text-white truncate">{user.fullname}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-indigo-900/30 hover:text-indigo-400 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Edit Profile
                </Link>
                <div className="border-t border-gray-700">
                  <Form method="post">
                    <button type="submit" name="intent" value="logout" className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 transition">
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
      </header>

      {/* ── Two-column game area ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Map */}
        <div className="w-1/2 relative border-r border-gray-700">
          {/* Map canvas */}
          <div ref={mapRef} className="absolute inset-0" />

          {/* Round tracker overlay (bottom strip) */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gray-900/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between">
            {/* R1-R5 pills */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(r => {
                const done = r < currentRound;
                const active = r === currentRound;
                return (
                  <div
                    key={r}
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                      done
                        ? 'bg-emerald-500 text-white'
                        : active
                        ? 'bg-indigo-500 text-white scale-110 ring-2 ring-indigo-400 ring-offset-1 ring-offset-gray-900'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {done ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      `R${r}`
                    )}
                  </div>
                );
              })}
            </div>

            {/* Running score */}
            <div className="text-right">
              <p className="text-xs text-gray-400">Score</p>
              <p className="text-base font-black text-indigo-400">{runningScore}</p>
            </div>
          </div>

          {/* Layer toggle (top-left of map) */}
          <button
            onClick={toggleMapType}
            className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-gray-900/80 hover:bg-gray-800/90 border border-gray-600 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm transition"
            title="Toggle map layer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4-9 4-9-4zm0 6l9 4 9-4m-9 4v4" />
            </svg>
            {mapType === 'hybrid' ? 'Normal' : 'Satellite'}
          </button>

          {/* Timer badge (top-right of map) */}
          {!isSubmitted && (
            <div className={`absolute top-3 right-3 z-20 w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-3 shadow-lg transition-colors ${
              timeLeft <= 10
                ? 'bg-red-900/80 border-red-500 text-red-300'
                : timeLeft <= 30
                ? 'bg-yellow-900/80 border-yellow-400 text-yellow-300'
                : 'bg-gray-900/80 border-emerald-500 text-emerald-300'
            }`} style={{ border: '3px solid' }}>
              {timeLeft}
            </div>
          )}

          {/* Submit button overlay */}
          {selectedCoords && !isSubmitted && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20">
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-2xl transition-all hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Submit Guess
              </button>
            </div>
          )}
        </div>

        {/* Right: Street View / Image + results */}
        <div className="w-1/2 flex flex-col bg-gray-900">
          {/* Location viewer */}
          <div className="flex-1 relative overflow-hidden bg-gray-950">
            {/* Street View container — rendered only when coverage confirmed */}
            {useStreetView && (
              <div ref={streetViewRef} className="absolute inset-0" style={{ touchAction: 'none' }} />
            )}

            {/* Image fallback — shown while checking coverage or when unavailable */}
            {!useStreetView && (
              <img
                src={currentLocation?.imageUrl}
                alt="Mystery Location"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/800x600/1e1b4b/818cf8?text=Location+Image'; }}
              />
            )}

            {/* Overlay: "Where is this?" */}
            <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none bg-gradient-to-b from-gray-900/70 to-transparent px-5 pt-4 pb-8">
              <p className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">Round {currentRound} of 5</p>
              <p className="text-lg font-bold text-white mt-0.5">Where is this place?</p>
            </div>

            {/* Difficulty badge */}
            <div className="absolute top-4 right-4 z-10 pointer-events-none">
              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow ${
                currentLocation?.difficulty === 'EASY' ? 'bg-emerald-500 text-white'
                : currentLocation?.difficulty === 'MEDIUM' ? 'bg-yellow-500 text-white'
                : 'bg-red-500 text-white'
              }`}>
                {currentLocation?.difficulty}
              </span>
            </div>

            {/* Clue strip */}
            {!isSubmitted && currentLocation?.description && (
              <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent px-5 pt-10 pb-4">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-xs font-black bg-yellow-400 text-gray-900 uppercase tracking-wide">
                    Clue
                  </span>
                  <p className="text-sm text-gray-200 leading-snug">{currentLocation.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Results panel */}
          {isSubmitted && mainScore !== null && (
            <div className="bg-gray-800 border-t border-gray-700 flex-shrink-0" style={{ animation: 'scoreReveal 0.35s ease-out' }}>
              {timedOut && (
                <div className="bg-red-600/90 text-white text-center py-2 text-xs font-bold tracking-widest uppercase">
                  ⏰ Time's up — 0 points this round
                </div>
              )}

              {/* Location name reveal */}
              <div className="px-5 py-3 bg-indigo-900/30 border-b border-indigo-800/40">
                <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-0.5">This place was</p>
                <h3 className="text-lg font-bold text-white">{currentLocation.name}</h3>
                {currentLocation.description && (
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{currentLocation.description}</p>
                )}
              </div>

              {/* Animated score + distance row */}
              <div className="px-5 py-4 flex items-center justify-between gap-3">
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-400 mb-1">This round</p>
                  <p className={`text-4xl font-black tabular-nums ${getScoreColor(mainScore)}`}>{animatedScore}</p>
                  <p className={`text-xs font-semibold mt-0.5 ${getScoreColor(mainScore)}`}>
                    {timedOut ? "Time's up!" : mainScore >= 800 ? 'Excellent!' : mainScore >= 500 ? 'Good job!' : mainScore >= 200 ? 'Not bad!' : 'Keep trying!'}
                  </p>
                </div>

                <div className="w-px h-12 bg-gray-700" />

                <div className="text-center flex-1">
                  <p className="text-xs text-gray-400 mb-1">Distance</p>
                  {distance !== null ? (
                    <>
                      <p className="text-3xl font-black text-gray-200 tabular-nums">{animatedDistance.toFixed(1)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">km off</p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-gray-500">—</p>
                      <p className="text-xs text-gray-500 mt-0.5">no guess</p>
                    </>
                  )}
                </div>

                <div className="w-px h-12 bg-gray-700" />

                <div className="text-center flex-1">
                  <p className="text-xs text-gray-400 mb-1">Total</p>
                  <p className="text-3xl font-black text-indigo-400 tabular-nums">{runningScore}</p>
                  <p className="text-xs text-gray-400 mt-0.5">pts</p>
                </div>
              </div>

              {/* Next / Finish button */}
              <div className="px-5 pb-5">
                <button
                  onClick={handleNextRound}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
                >
                  {currentRound >= 5 ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      See Final Results
                    </>
                  ) : (
                    <>
                      Next Location
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
