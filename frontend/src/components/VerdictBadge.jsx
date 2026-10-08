import React from 'react'

export default function VerdictBadge({ verdict }) {
  if (!verdict) return null

  if (verdict === 'recommended') {
    return (
      <span className="inline-block px-3 py-1 bg-[#0d2e1a] text-[#3cb080] text-xs font-semibold rounded-full border border-[#3cb080]/20">
        ✓ Recommended
      </span>
    )
  }
  
  if (verdict === 'minimum') {
    return (
      <span className="inline-block px-3 py-1 bg-[#2e1e0a] text-[#e0a040] text-xs font-semibold rounded-full border border-[#e0a040]/20">
        ⚠ Minimum
      </span>
    )
  }
  
  if (verdict === 'not_recommended') {
    return (
      <span className="inline-block px-3 py-1 bg-[#2e1010] text-[#d06050] text-xs font-semibold rounded-full border border-[#d06050]/20">
        ✗ Not Recommended
      </span>
    )
  }

  return null
}
