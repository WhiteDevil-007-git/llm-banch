import React from 'react'
import { Link } from 'react-router-dom'
import useHardwareStore from '../store/hardwareStore'
import { Monitor } from 'lucide-react'

export default function Navbar() {
  const { hardware } = useHardwareStore()

  return (
    <nav className="sticky top-0 z-50 bg-[#0d0d0f] border-b border-[#1e1e28]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left */}
        <Link to="/" className="text-xl font-bold text-text-primary flex items-center gap-2">
          🧪 LLM Bench
        </Link>

        {/* Center */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/models" className="text-text-secondary hover:text-text-primary transition">
            Models
          </Link>
          <Link to="/leaderboard" className="text-text-secondary hover:text-text-primary transition">
            Leaderboard
          </Link>
        </div>

        {/* Right */}
        <div>
          {hardware ? (
            <div className="flex items-center gap-2 text-sm text-text-secondary bg-[#13131a] px-3 py-1.5 rounded-full border border-[#1e1e28]">
              <div className="w-2 h-2 rounded-full bg-accent-green"></div>
              <span>GPU: {hardware.gpu_name}</span>
            </div>
          ) : (
            <Link to="/models" className="flex items-center gap-2 text-sm bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition">
              <Monitor size={16} />
              <span>Scan Your PC</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
