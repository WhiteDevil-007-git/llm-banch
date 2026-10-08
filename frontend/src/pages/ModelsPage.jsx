import React, { useState, useEffect } from 'react'
import { getModels } from '../api/client'
import ModelCard from '../components/ModelCard'
import useHardwareStore from '../store/hardwareStore'

export default function ModelsPage() {
  const { hardware } = useHardwareStore()
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [search, setSearch] = useState('')
  const [family, setFamily] = useState('All')
  const [task, setTask] = useState('All')
  
  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true)
      const params = {}
      if (search) params.search = search
      if (family !== 'All') params.family = family
      if (task !== 'All') params.task = task
      
      getModels(params)
        .then(res => {
          setModels(Array.isArray(res.data) ? res.data : (res.data.models || []))
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    }, 300)
    
    return () => clearTimeout(timer)
  }, [search, family, task])

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-2">Search</label>
          <input 
            type="text" 
            placeholder="Search models..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-card border border-border-dark rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-blue"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-2">Family</label>
          <select 
            value={family}
            onChange={(e) => setFamily(e.target.value)}
            className="w-full bg-bg-card border border-border-dark rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-blue appearance-none"
          >
            <option value="All">All Families</option>
            <option value="llama">Llama</option>
            <option value="qwen">Qwen</option>
            <option value="phi">Phi</option>
            <option value="mistral">Mistral</option>
            <option value="gemma">Gemma</option>
            <option value="deepseek">DeepSeek</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-2">Task</label>
          <select 
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="w-full bg-bg-card border border-border-dark rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-blue appearance-none"
          >
            <option value="All">All Tasks</option>
            <option value="chat">Chat</option>
            <option value="coding">Coding</option>
            <option value="reasoning">Reasoning</option>
            <option value="vision">Vision</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        {hardware && (
          <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-lg p-4 mb-6 text-sm text-accent-blue flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-blue"></span>
            Showing compatibility results for: <span className="font-semibold">{hardware.gpu_name} ({hardware.vram_gb}GB VRAM)</span>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6 text-text-secondary text-sm">
          <span>Showing {models.length} models</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-bg-card rounded-lg animate-pulse border border-border-dark"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {models.length > 0 ? models.map(model => (
              <ModelCard key={model.id} model={model} />
            )) : (
              <div className="col-span-2 text-center py-12 text-text-secondary">
                No models found matching your criteria.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
