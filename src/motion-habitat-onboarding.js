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
let guideElement = null

function createKeyGrid(labels, className, keyTag = 'kbd') {
  const grid = document.createElement('span')
  grid.className = className

  labels.forEach((label) => {
    const key = document.createElement(keyTag)
    key.textContent = label
    grid.appendChild(key)
  })

  return grid
}

function createGuide(world) {
  const guide = document.createElement('div')
  guide.className = 'motion-habitat-guide'
  guide.setAttribute('aria-hidden', 'true')

  const eyebrow = document.createElement('span')
  eyebrow.className = 'motion-habitat-guide-eyebrow'
  eyebrow.textContent = 'Explore the habitat'

  const controls = document.createElement('div')
  controls.className = 'motion-habitat-guide-controls'

  const wasdGroup = document.createElement('div')
  wasdGroup.className = 'motion-habitat-guide-key-group'
  wasdGroup.appendChild(
    createKeyGrid(['W', 'A', 'S', 'D'], 'motion-habitat-guide-key-grid is-wasd'),
  )
  const wasdLabel = document.createElement('span')
  wasdLabel.textContent = 'WASD'
  wasdGroup.appendChild(wasdLabel)

  const separator = document.createElement('span')
  separator.className = 'motion-habitat-guide-or'
  separator.textContent = 'or'

  const arrowGroup = document.createElement('div')
  arrowGroup.className = 'motion-habitat-guide-key-group'
  arrowGroup.appendChild(
    createKeyGrid(['↑', '←', '↓', '→'], 'motion-habitat-guide-key-grid is-arrows'),
  )
  const arrowLabel = document.createElement('span')
  arrowLabel.textContent = 'Arrow keys'
  arrowGroup.appendChild(arrowLabel)

  controls.append(wasdGroup, separator, arrowGroup)

  const instruction = document.createElement('p')
  instruction.textContent = 'Click inside, then move · or click any station to auto-walk there'

  guide.append(eyebrow, controls, instruction)
  world.appendChild(guide)
  return guide
}

function enhancePersistentControls(habitat) {
  const controls = habitat.querySelector('.motion-habitat-controls')
  if (!controls || controls.dataset.keycapsEnhanced === 'true') return

  const copy = controls.lastElementChild
  if (!copy) return

  const separator = document.createElement('span')
  separator.className = 'motion-habitat-control-or'
  separator.textContent = 'or'

  const arrows = createKeyGrid(
    ['↑', '←', '↓', '→'],
    'motion-habitat-arrow-keys',
    'b',
  )

  copy.className = 'motion-habitat-control-copy'
  copy.textContent = 'Move · click station = auto-walk'

  controls.insertBefore(separator, copy)
  controls.insertBefore(arrows, copy)
  controls.dataset.keycapsEnhanced = 'true'
}

function hideGuide() {
  if (dismissed) return
  dismissed = true

  guideElement?.classList.remove('is-visible')
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
  guideElement ??= createGuide(world)

  requestAnimationFrame(() => {
    guideElement?.classList.add('is-visible')
  })

  document.addEventListener('pointerdown', handlePointerDown, true)
  document.addEventListener('keydown', handleKeyDown, true)
}

function installGuide() {
  if (installed || dismissed) return installed

  const habitat = document.querySelector('.motion-habitat')
  const world = habitat?.querySelector('.motion-habitat-world')
  if (!habitat || !world) return false

  installed = true
  enhancePersistentControls(habitat)

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
    guideElement?.remove()
    guideElement = null
    activeWorld = null
  },
  { once: true },
)
