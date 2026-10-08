import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getLeaderboard } from '../api/client'
import { Trophy } from 'lucide-react'

export default function LeaderboardPage() {
  const [metric, setMetric] = useState('quality')
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getLeaderboard(metric, 15)
      .then(res => setLeaders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [metric])

  const tabs = [
    { id: 'quality', label: 'Quality' },
    { id: 'speed', label: 'Speed' },
    { id: 'efficiency', label: 'Efficiency' }
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-text-primary mb-4 flex items-center justify-center gap-3">
          <Trophy className="text-accent-amber" size={32} />
          Model Leaderboard
        </h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Rankings based on community scores, estimated tokens per second, and performance relative to VRAM requirements.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-bg-card p-1 rounded-lg border border-border-dark inline-flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setMetric(tab.id)}
              className={`px-6 py-2 rounded-md text-sm font-semibold transition ${
                metric === tab.id 
                  ? 'bg-accent-blue text-white shadow' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-border-dark rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-secondary animate-pulse">Loading rankings...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#1e1e28] text-text-primary text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold text-center w-20">Rank</th>
                <th className="px-6 py-4 font-semibold">Model</th>
                <th className="px-6 py-4 font-semibold">Params</th>
                <th className="px-6 py-4 font-semibold">Score</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {leaders.map((model, index) => {
                let rankColor = "text-text-secondary"
                if (index === 0) rankColor = "text-[#FFD700] font-bold text-lg" // Gold
                else if (index === 1) rankColor = "text-[#C0C0C0] font-bold text-lg" // Silver
                else if (index === 2) rankColor = "text-[#CD7F32] font-bold text-lg" // Bronze
                
                return (
                  <tr key={model.id} className="hover:bg-bg-hover transition">
                    <td className={`px-6 py-4 text-center ${rankColor}`}>
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/models/${model.id}`} className="font-bold text-text-primary hover:text-accent-blue transition block">
                        {model.name}
                      </Link>
                      <span className="text-xs text-text-secondary">{model.family}</span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {model.params_b}B
                    </td>
                    <td className="px-6 py-4 font-semibold text-accent-blue">
                      {model.metric_value?.toFixed(1) || model.quality_score}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/models/${model.id}`}
                        className="text-xs border border-border-dark hover:border-accent-blue hover:text-accent-blue px-3 py-1.5 rounded transition inline-block"
                      >
                        Check My PC
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
