import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Nepal Geography Quiz - Test Your Knowledge" },
    { name: "description", content: "Challenge yourself with Nepal's geography. Identify locations on the map and earn points!" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        {/* Main Content */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            🇳🇵 Nepal Geography Quiz
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-4">
            Test your knowledge of Nepal's beautiful landmarks and places
          </p>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Identify famous locations on the map, the closer your guess, the higher your score!
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-3">🗺️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Interactive Map</h3>
            <p className="text-white/80 text-sm">Click on the map to mark your guess</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-3">🏔️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Famous Places</h3>
            <p className="text-white/80 text-sm">From temples to mountains</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-white mb-2">Score Points</h3>
            <p className="text-white/80 text-sm">Based on distance accuracy</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/register"
            className="inline-block bg-white hover:bg-gray-100 text-indigo-600 font-bold text-xl px-12 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition duration-200"
          >
            Register →
          </Link>
          <Link
            to="/login"
            className="inline-block bg-transparent hover:bg-white/10 text-white border-2 border-white font-bold text-xl px-12 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition duration-200"
          >
            Login
          </Link>
        </div>

        <p className="text-white/70 text-sm mt-6">
          Quick registration • Free to play • Challenge yourself
        </p>
      </div>
    </div>
  );
}
