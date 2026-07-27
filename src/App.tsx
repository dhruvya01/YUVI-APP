import { ThemeProvider } from './context/ThemeContext'
import Home from './components/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import DynamicBackground from './components/DynamicBackground'
import CustomCursor from './components/CustomCursor'

import Navigation from './components/Navigation'
import Gallery from './pages/Gallery'
import Profiles from './pages/Profiles'
import Chat from './pages/Chat'
import Arcade from './pages/Arcade'
import PandaHouse from './pages/PandaHouse'
import { PandaWidget } from './components/panda/PandaWidget'

function MainApp() {
  return (
    <div className="relative w-full max-w-md mx-auto min-h-screen shadow-2xl overflow-x-hidden pb-24 bg-[var(--color-bg-main)]">
      <CustomCursor />
      <DynamicBackground />
      <BrowserRouter>
        <Navigation />
        <PandaWidget />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/arcade" element={<Arcade />} />
          <Route path="/panda-house" element={<PandaHouse />} />
          <Route path="/settings" element={<Profiles />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  )
}

export default App
