import { ThemeProvider, useTheme } from './context/ThemeContext'
import MagicalIntro from './components/MagicalIntro'
import Home from './components/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import DynamicBackground from './components/DynamicBackground'
import CustomCursor from './components/CustomCursor'

import Navigation from './components/Navigation'
import OurStory from './pages/OurStory'
import Gallery from './pages/Gallery'
import LoveLetters from './pages/LoveLetters'
import Settings from './pages/Settings'

function MainApp() {
  const { introSeen } = useTheme()

  if (!introSeen) {
    return <MagicalIntro />
  }

  return (
    <div className="relative w-full min-h-screen cursor-none pb-24">
      <CustomCursor />
      <DynamicBackground />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/story" element={<OurStory />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/letters" element={<LoveLetters />} />
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
