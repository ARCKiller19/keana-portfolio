import { useCallback, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Projects from './components/Projects.jsx'
import Motion from './components/Motion.jsx'
import Playground from './components/Playground.jsx'
import Footer from './components/Footer.jsx'
import ScrollStem from './components/ScrollStem.jsx'

function App() {
  const [motionReady, setMotionReady] = useState(false)
  const handleIntroComplete = useCallback(() => setMotionReady(true), [])

  return (
    <>
      <ScrollStem active={motionReady} />
      <Navbar />
      <main>
        <Hero
          motionReady={motionReady}
          onIntroComplete={handleIntroComplete}
        />
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
