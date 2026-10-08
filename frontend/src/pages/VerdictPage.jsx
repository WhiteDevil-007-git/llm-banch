import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useHardwareStore from '../store/hardwareStore'
import { getHardwareScan, getRecommendations } from '../api/client'
import ModelCard from '../components/ModelCard'

export default function VerdictPage() {
  const { token, hardware, setHardware } = useHardwareStore()
  const navigate = useNavigate()
  
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }

    const loadData = async () => {
      setLoading(true)
      try {
        // Fetch hardware if we don't have it yet
        if (!hardware) {
          const hwRes = await getHardwareScan(token)
          setHardware(hwRes.data)
        }
        
        // Fetch recommendations
        const recRes = await getRecommendations(token, null, 6)
        setRecommendations(recRes.data)
        
      } catch (err) {
        console.error(err)
        setError('Failed to load scan data. The session may have expired.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [token, hardware, setHardware, navigate])

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-accent-red mb-4">Error</h2>
        <p className="text-text-secondary mb-6">{error}</p>
        <button onClick={() => navigate('/')} className="text-accent-blue hover:underline">
          Return Home
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hardware Summary */}
      <div className="bg-bg-card border border-border-dark rounded-xl p-8 mb-12">
        <h1 className="text-3xl font-bold mb-6 text-text-primary">Hardware Scan Complete</h1>
        {hardware ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-bg-primary rounded-lg p-4 border border-border-dark">
              <p className="text-xs text-text-secondary uppercase mb-1">GPU</p>
              <p className="font-semibold text-accent-blue">{hardware.gpu_name}</p>
              <p className="text-sm text-text-secondary">{hardware.vram_gb} GB VRAM</p>
            </div>
            <div className="bg-bg-primary rounded-lg p-4 border border-border-dark">
              <p className="text-xs text-text-secondary uppercase mb-1">RAM</p>
              <p className="font-semibold text-text-primary">{hardware.ram_gb} GB</p>
            </div>
            <div className="bg-bg-primary rounded-lg p-4 border border-border-dark">
              <p className="text-xs text-text-secondary uppercase mb-1">CPU</p>
              <p className="font-semibold text-text-primary truncate" title={hardware.cpu_name}>{hardware.cpu_name}</p>
              <p className="text-sm text-text-secondary">{hardware.cpu_cores} Cores</p>
            </div>
            <div className="bg-bg-primary rounded-lg p-4 border border-border-dark">
              <p className="text-xs text-text-secondary uppercase mb-1">Disk</p>
              <p className="font-semibold text-text-primary">{hardware.disk_free_gb || 'Unknown'} GB Free</p>
            </div>
          </div>
        ) : (
          <p className="text-text-secondary">Loading hardware details...</p>
        )}
      </div>

      {/* Recommendations */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Recommended Models For You</h2>
        <p className="text-text-secondary mb-8">
          Based on your hardware, here are the highest quality models you can run smoothly.
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-bg-card rounded-lg animate-pulse border border-border-dark"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {recommendations.map(rec => (
              <ModelCard key={rec.model_id} model={rec} />
            ))}
          </div>
        )}

        <div className="text-center">
          <button 
            onClick={() => navigate('/models')} 
            className="bg-[#1e1e28] text-text-primary px-8 py-3 rounded-lg font-semibold hover:bg-[#2a2a35] transition border border-border-dark"
          >
            Browse All Compatible Models
          </button>
        </div>
      </div>
    </div>
  )
}
