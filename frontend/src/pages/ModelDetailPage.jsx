import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getModelById, getModelQuants, getVerdict } from '../api/client'
import useHardwareStore from '../store/hardwareStore'
import VerdictBadge from '../components/VerdictBadge'
import HardwareBar from '../components/HardwareBar'
import QuantTable from '../components/QuantTable'
import ScanPrompt from '../components/ScanPrompt'

export default function ModelDetailPage() {
  const { id } = useParams()
  const { hardware, token } = useHardwareStore()
  
  const [model, setModel] = useState(null)
  const [quants, setQuants] = useState([])
  const [verdictData, setVerdictData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getModelById(id),
      getModelQuants(id)
    ]).then(([modelRes, quantsRes]) => {
      setModel(modelRes.data)
      setQuants(quantsRes.data)
      
      // If hardware is scanned, get verdict for the best quant
      if (token) {
        getVerdict(id, token)
          .then(vRes => setVerdictData(vRes.data))
          .catch(err => console.error('Verdict error:', err))
      }
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false))
  }, [id, token])

  if (loading) {
    return <div className="animate-pulse flex flex-col gap-6"><div className="h-32 bg-bg-card rounded-lg w-full"></div><div className="h-64 bg-bg-card rounded-lg w-full"></div></div>
  }

  if (!model) {
    return <div className="text-center text-text-secondary py-12">Model not found.</div>
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold text-text-primary">{model.name}</h1>
          <span className="px-3 py-1 bg-[#1e1e28] text-text-secondary text-sm rounded-full">
            {model.family}
          </span>
          <span className="px-3 py-1 bg-[#1e1e28] text-accent-blue text-sm rounded-full font-semibold">
            {model.params_b}B params
          </span>
        </div>
        <p className="text-text-secondary mt-4 max-w-3xl leading-relaxed whitespace-pre-wrap">
          {model.description}
        </p>
      </div>

      {/* Hardware Verdict Section */}
      {token && hardware ? (
        <div className="bg-bg-card border border-border-dark rounded-xl p-8 mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            Hardware Compatibility
            {verdictData && <VerdictBadge verdict={verdictData.verdict} />}
          </h2>
          
          {verdictData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <p className="text-text-secondary mb-6 leading-relaxed">
                  {verdictData.reason}
                </p>
                <div className="bg-bg-primary border border-border-dark p-4 rounded-lg">
                  <p className="text-xs text-text-secondary mb-2 uppercase tracking-wider font-semibold">Recommended Command</p>
                  <code className="text-accent-green block overflow-x-auto">
                    {verdictData.ollama_command}
                  </code>
                </div>
              </div>
              
              <div>
                <HardwareBar 
                  label="VRAM" 
                  userValue={verdictData.user_hw.vram_gb} 
                  minValue={verdictData.model_req.min_vram_gb} 
                  recValue={verdictData.model_req.rec_vram_gb} 
                />
                <HardwareBar 
                  label="System RAM" 
                  userValue={verdictData.user_hw.ram_gb} 
                  minValue={verdictData.model_req.min_ram_gb} 
                  recValue={verdictData.model_req.rec_ram_gb} 
                />
              </div>
            </div>
          ) : (
            <p className="text-text-secondary">Evaluating hardware...</p>
          )}
        </div>
      ) : (
        <ScanPrompt />
      )}

      {/* Quants Table */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Available Quantizations</h2>
        <QuantTable quants={quants} userVram={hardware?.vram_gb} />
      </div>
    </div>
  )
}
