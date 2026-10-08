import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import useHardwareStore from './store/hardwareStore'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ModelsPage from './pages/ModelsPage'
import ModelDetailPage from './pages/ModelDetailPage'
import VerdictPage from './pages/VerdictPage'
import LeaderboardPage from './pages/LeaderboardPage'

// A wrapper component to check URL params on load
function RouteWrapper() {
  const location = useLocation();
  const { setToken } = useHardwareStore();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
        setToken(token);
    }
  }, [location.search, setToken]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/models/:id" element={<ModelDetailPage />} />
          <Route path="/scan-result" element={<VerdictPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <RouteWrapper />
    </BrowserRouter>
  )
}

export default App
