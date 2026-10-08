import React from 'react'
import VerdictBadge from './VerdictBadge'
import { Copy } from 'lucide-react'

export default function QuantTable({ quants, userVram }) {
  if (!quants || quants.length === 0) {
    return <p className="text-text-secondary">No quants available.</p>
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border-dark bg-bg-card">
      <table className="w-full text-left text-sm text-text-secondary">
        <thead className="bg-[#1e1e28] text-text-primary uppercase text-xs">
          <tr>
            <th className="px-4 py-3">Quant</th>
            <th className="px-4 py-3">Size</th>
            <th className="px-4 py-3">Min VRAM</th>
            <th className="px-4 py-3">Rec VRAM</th>
            <th className="px-4 py-3">Est Speed</th>
            <th className="px-4 py-3">Verdict</th>
            <th className="px-4 py-3">Ollama Command</th>
          </tr>
        </thead>
        <tbody>
          {quants.map((q) => {
            let verdict = null;
            let isHighlight = false;
            
            if (userVram !== undefined && userVram !== null) {
                if (userVram >= q.rec_vram_gb) verdict = 'recommended';
                else if (userVram >= q.min_vram_gb) verdict = 'minimum';
                else verdict = 'not_recommended';
                
                // Highlight the recommended row roughly
                if (verdict === 'recommended' || verdict === 'minimum') {
                    // This is a simple highlight check. In real app, we might find the *best* fitting one.
                    isHighlight = true;
                }
            }

            return (
              <tr 
                key={q.id} 
                className={`border-b border-border-dark hover:bg-bg-hover transition ${
                  isHighlight && verdict === 'recommended' ? 'bg-[#0d2e1a]/10' : ''
                }`}
              >
                <td className="px-4 py-3 font-semibold text-text-primary">{q.quant}</td>
                <td className="px-4 py-3">{q.size_gb} GB</td>
                <td className="px-4 py-3">{q.min_vram_gb} GB</td>
                <td className="px-4 py-3">{q.rec_vram_gb} GB</td>
                <td className="px-4 py-3">{q.est_tps_low ? `${q.est_tps_low} tps` : '-'}</td>
                <td className="px-4 py-3"><VerdictBadge verdict={verdict} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-between bg-bg-primary border border-border-dark rounded px-2 py-1">
                    <code className="text-xs text-text-primary truncate max-w-[120px]" title={q.ollama_url}>
                      {q.ollama_url || `ollama run model:${q.quant}`}
                    </code>
                    <button 
                      onClick={() => handleCopy(q.ollama_url || `ollama run model:${q.quant}`)}
                      className="text-text-secondary hover:text-white"
                      title="Copy command"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
