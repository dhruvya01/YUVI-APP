import { useState } from 'react'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import MagicalIntro from './components/MagicalIntro'
import Home from './components/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import DynamicBackground from './components/DynamicBackground'
import CustomCursor from './components/CustomCursor'
import LockScreen from './components/LockScreen'

import Navigation from './components/Navigation'
import OurStory from './pages/OurStory'
import Gallery from './pages/Gallery'
import LoveLetters from './pages/LoveLetters'
import Settings from './pages/Settings'
import Profiles from './pages/Profiles'
import Chat from './pages/Chat'
import Arcade from './pages/Arcade'
import { PandaWidget } from './components/panda/PandaWidget'

function MainApp() {
  const { introSeen } = useTheme()
  const [isUnlocked, setIsUnlocked] = useState(false)

  if (!introSeen) {
    return <MagicalIntro />
  }

  return (
    <div className="relative w-full min-h-screen cursor-none pb-24">
      <CustomCursor />
      <DynamicBackground />
      {!isUnlocked && <LockScreen onUnlock={() => setIsUnlocked(true)} />}
      <BrowserRouter>
        <Navigation />
        <PandaWidget />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/story" element={<OurStory />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/letters" element={<LoveLetters />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/arcade" element={<Arcade />} />
          <Route path="/settings" element={<Settings />} />
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
