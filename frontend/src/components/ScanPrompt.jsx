import React from 'react'
import { Cpu } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ScanPrompt() {
  return (
    <div className="bg-bg-card border border-border-dark rounded-lg p-8 text-center max-w-2xl mx-auto my-8">
      <div className="flex justify-center mb-4 text-accent-blue">
        <Cpu size={48} />
      </div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">
        Scan Your PC to Check Compatibility
      </h2>
      <p className="text-text-secondary mb-6">
        Download our free scanner to see if this model runs on your hardware. 
        It checks your GPU, VRAM, and RAM instantly.
      </p>
      
      <a 
        href="http://localhost:8000/static/LLMBench-Scanner.exe" 
        className="inline-block bg-accent-blue text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition font-semibold"
      >
        Download Scanner
      </a>
      
      <p className="text-xs text-text-secondary mt-4">
        Runs once, then deletes itself. No installation needed.
      </p>
    </div>
  )
}
