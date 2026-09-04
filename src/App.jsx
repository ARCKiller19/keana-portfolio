import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Projects from './components/Projects.jsx'
import Motion from './components/Motion.jsx'
import Playground from './components/Playground.jsx'
import Footer from './components/Footer.jsx'
import './editorial.css'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
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
