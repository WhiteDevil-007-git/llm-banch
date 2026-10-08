import React from 'react'

export default function HardwareBar({ label, userValue, minValue, recValue, unit = 'GB' }) {
  // Calculate width percentage (max 100%)
  // We'll scale so that recValue is at 80% width to allow some overflow visual
  const maxDisplayValue = Math.max(userValue, recValue * 1.25);
  const userWidth = Math.min((userValue / maxDisplayValue) * 100, 100);
  const minWidth = Math.min((minValue / maxDisplayValue) * 100, 100);
  const recWidth = Math.min((recValue / maxDisplayValue) * 100, 100);

  let fillColor = 'bg-accent-red';
  if (userValue >= recValue) {
      fillColor = 'bg-accent-green';
  } else if (userValue >= minValue) {
      fillColor = 'bg-accent-amber';
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold text-text-primary">{label}</span>
        <span className="text-text-secondary">
          {userValue}{unit} / {recValue}{unit} recommended
        </span>
      </div>
      
      <div className="relative h-4 bg-bg-primary rounded-full overflow-hidden border border-border-dark">
        {/* Fill bar */}
        <div 
          className={`absolute top-0 left-0 h-full ${fillColor} transition-all duration-500`} 
          style={{ width: `${userWidth}%` }}
        ></div>
        
        {/* Markers */}
        <div 
          className="absolute top-0 bottom-0 border-l-2 border-white/40 z-10"
          style={{ left: `${minWidth}%` }}
          title={`Minimum: ${minValue}${unit}`}
        ></div>
        <div 
          className="absolute top-0 bottom-0 border-l-2 border-white/80 z-10"
          style={{ left: `${recWidth}%` }}
          title={`Recommended: ${recValue}${unit}`}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-text-secondary mt-1">
        <div style={{ marginLeft: `${Math.max(0, minWidth - 2)}%` }}>Min</div>
        <div style={{ position: 'absolute', left: `${recWidth}%`, transform: 'translateX(-50%)' }}>Rec</div>
      </div>
    </div>
  )
}
