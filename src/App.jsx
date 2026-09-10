import { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Projects from './components/Projects.jsx'
import Motion from './components/Motion.jsx'
import Playground from './components/Playground.jsx'
import Footer from './components/Footer.jsx'
import BookingModal from './components/BookingModal.jsx'

function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  const openBooking = () => setIsBookingOpen(true)
  const closeBooking = () => setIsBookingOpen(false)

  return (
    <>
      <Navbar onOpenBooking={openBooking} />
      <main>
        <Hero onOpenBooking={openBooking} />
        <About />
        <Projects />
        <Motion />
        <Playground />
      </main>
      <Footer />
      <BookingModal isOpen={isBookingOpen} onClose={closeBooking} />
    </>
  )
}

export default App
