import React from 'react'
import { Link } from 'react-router-dom'
import useHardwareStore from '../store/hardwareStore'
import VerdictBadge from './VerdictBadge'

export default function ModelCard({ model }) {
  const { hardware } = useHardwareStore()

  // Compute a rough verdict for the card if we have hardware and model stats
  let cardVerdict = null
  if (hardware && model.min_vram_gb !== undefined) {
      if (hardware.vram_gb >= (model.min_vram_gb + 2)) {
          cardVerdict = 'recommended'
      } else if (hardware.vram_gb >= model.min_vram_gb) {
          cardVerdict = 'minimum'
      } else {
          cardVerdict = 'not_recommended'
      }
  }

  return (
    <Link 
      to={`/models/${model.id}`} 
      className="block bg-bg-card border border-border-dark rounded-lg p-5 hover:border-accent-blue transition group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold text-text-primary group-hover:text-accent-blue transition truncate pr-2">
          {model.name}
        </h3>
        <span className="px-2 py-0.5 bg-[#1e1e28] text-text-secondary text-xs rounded-full whitespace-nowrap">
          {model.family}
        </span>
      </div>
      
      <div className="text-accent-blue text-sm mb-3">
        {model.params_b}B params
      </div>
      
      <p className="text-text-secondary text-sm line-clamp-2 mb-4 flex-grow">
        {model.description || 'No description available.'}
      </p>
      
      <div className="flex justify-between items-center mt-auto pt-4 border-t border-border-dark">
        <div className="text-xs text-text-secondary">
          {model.min_vram_gb ? `${model.min_vram_gb} GB min VRAM` : 'VRAM unknown'} 
          {model.quant_count ? ` • ${model.quant_count} quants` : ''}
        </div>
        
        {cardVerdict && (
          <VerdictBadge verdict={cardVerdict} />
        )}
      </div>
    </Link>
  )
}
