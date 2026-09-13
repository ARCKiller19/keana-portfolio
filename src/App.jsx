import { useCallback, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Projects from './components/Projects.jsx'
import Motion from './components/Motion.jsx'
import Playground from './components/Playground.jsx'
import Footer from './components/Footer.jsx'
import SiteLoader from './components/SiteLoader.jsx'
import ScrollStem from './components/ScrollStem.jsx'

function App() {
  const [motionReady, setMotionReady] = useState(false)
  const handleIntroComplete = useCallback(() => setMotionReady(true), [])

  return (
    <>
      <SiteLoader onComplete={handleIntroComplete} />
      <ScrollStem active={motionReady} />
      <Navbar />
      <main>
        <Hero motionReady={motionReady} />
        <About />
        <Projects />
        <Motion />
        <Playground />
      </main>
      <Footer />
    </>
  )
}

export default App