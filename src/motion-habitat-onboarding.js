const compactQuery = window.matchMedia('(max-width: 720px)')
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

const movementKeys = new Set([
  'w',
  'a',
  's',
  'd',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
])

let dismissed = false
let installed = false
let habitatObserver = null
let mountObserver = null
let activeWorld = null

function hideGuide() {
  if (dismissed) return
  dismissed = true

  activeWorld?.classList.remove('show-control-guide')
  document.removeEventListener('pointerdown', handlePointerDown, true)
  document.removeEventListener('keydown', handleKeyDown, true)
  habitatObserver?.disconnect()
}

function handlePointerDown() {
  hideGuide()
}

function handleKeyDown(event) {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
  if (!movementKeys.has(key)) return
  hideGuide()
}

function showGuide(world) {
  if (dismissed || compactQuery.matches || reducedMotionQuery.matches) return

  activeWorld = world
  world.classList.add('show-control-guide')
  document.addEventListener('pointerdown', handlePointerDown, true)
  document.addEventListener('keydown', handleKeyDown, true)
}

function installGuide() {
  if (installed || dismissed) return installed

  const habitat = document.querySelector('.motion-habitat')
  const world = habitat?.querySelector('.motion-habitat-world')
  if (!habitat || !world) return false

  installed = true

  if (compactQuery.matches || reducedMotionQuery.matches) return true

  if (!('IntersectionObserver' in window)) {
    showGuide(world)
    return true
  }

  habitatObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      habitatObserver?.disconnect()
      showGuide(world)
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
  )

  habitatObserver.observe(habitat)
  return true
}

if (!installGuide()) {
  mountObserver = new MutationObserver(() => {
    if (!installGuide()) return
    mountObserver?.disconnect()
    mountObserver = null
  })

  mountObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  })
}

window.addEventListener(
  'pagehide',
  () => {
    habitatObserver?.disconnect()
    mountObserver?.disconnect()
    document.removeEventListener('pointerdown', handlePointerDown, true)
    document.removeEventListener('keydown', handleKeyDown, true)
  },
  { once: true },
)
