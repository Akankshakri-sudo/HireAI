import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
        <Compass size={32} className="text-emerald-400" />
      </div>
      <h1 className="text-6xl font-bold text-white mb-2">404</h1>
      <p className="text-gray-400 mb-8">The page you're looking for doesn't exist or has moved.</p>
      <Link
        to="/"
        className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
