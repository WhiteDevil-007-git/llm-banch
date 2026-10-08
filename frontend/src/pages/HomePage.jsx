import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getModels } from '../api/client'
import ModelCard from '../components/ModelCard'

export default function HomePage() {
  const [topModels, setTopModels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch top 6 models by quality
    getModels({ sort: 'quality', limit: 6 })
      .then(res => {
        const models = Array.isArray(res.data) ? res.data : (res.data.models || [])
        models.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))
        setTopModels(models.slice(0, 6))
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-blue/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-text-primary leading-tight">
            Find the Right Local LLM for Your Hardware
          </h1>
          <p className="text-xl text-text-secondary mb-10">
            Compare models by speed, quality, and memory — then check if your PC can run them with our standalone scanner.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/models" className="bg-accent-blue text-white px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition shadow-lg shadow-accent-blue/20">
              Browse Models
            </Link>
            <a href="http://localhost:8000/static/LLMBench-Scanner.exe" className="bg-[#1e1e28] text-text-primary px-8 py-4 rounded-lg font-semibold hover:bg-[#2a2a35] transition border border-border-dark">
              Scan My PC
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border-dark bg-bg-card py-6 mb-16">
        <div className="container mx-auto px-4 flex justify-around text-center">
          <div>
            <div className="text-3xl font-bold text-accent-blue">20</div>
            <div className="text-text-secondary text-sm mt-1">Models</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent-green">50+</div>
            <div className="text-text-secondary text-sm mt-1">Quantizations</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent-amber">Free</div>
            <div className="text-text-secondary text-sm mt-1">Forever</div>
          </div>
        </div>
      </section>

      {/* Featured Models */}
      <section className="mb-20">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold text-text-primary">Top Models by Quality</h2>
          <Link to="/models" className="text-accent-blue hover:underline">View all →</Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-bg-card rounded-lg animate-pulse border border-border-dark"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topModels.map(model => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="mb-20 bg-bg-card border border-border-dark rounded-xl p-10">
        <h2 className="text-3xl font-bold text-center mb-12 text-text-primary">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-12 h-12 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
            <h3 className="text-xl font-semibold mb-2 text-text-primary">Browse Models</h3>
            <p className="text-text-secondary">Explore our database of open-source models and compare their specifications.</p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
            <h3 className="text-xl font-semibold mb-2 text-text-primary">Scan Your PC</h3>
            <p className="text-text-secondary">Run our lightweight scanner to securely check your CPU, RAM, and GPU.</p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2 text-text-primary">Get Verdict</h3>
            <p className="text-text-secondary">Instantly see which models and quantizations will run smoothly on your exact hardware.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
