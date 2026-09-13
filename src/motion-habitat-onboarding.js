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

  const intro = document.createElement('p')
  intro.className = 'motion-habitat-guide-intro'
  intro.textContent = 'Choose how you want to move through the motion archive.'

  const paths = document.createElement('div')
  paths.className = 'motion-habitat-guide-paths'

  const manualPath = document.createElement('div')
  manualPath.className = 'motion-habitat-guide-path is-manual'

  const manualTitle = document.createElement('span')
  manualTitle.className = 'motion-habitat-guide-path-title'
  manualTitle.textContent = 'Move manually'

  const manualKeys = document.createElement('div')
  manualKeys.className = 'motion-habitat-guide-manual-keys'
  manualKeys.appendChild(
    createKeyGrid(['W', 'A', 'S', 'D'], 'motion-habitat-guide-key-grid is-wasd'),
  )

  const manualOr = document.createElement('span')
  manualOr.className = 'motion-habitat-guide-or'
  manualOr.textContent = 'or'
  manualKeys.appendChild(manualOr)

  manualKeys.appendChild(
    createKeyGrid(['↑', '←', '↓', '→'], 'motion-habitat-guide-key-grid is-arrows'),
  )

  const manualCopy = document.createElement('span')
  manualCopy.className = 'motion-habitat-guide-path-copy'
  manualCopy.textContent = 'Click inside the habitat first, then use the keys.'

  manualPath.append(manualTitle, manualKeys, manualCopy)

  const separator = document.createElement('span')
  separator.className = 'motion-habitat-guide-path-separator'
  separator.textContent = 'or'

  const stationPath = document.createElement('div')
  stationPath.className = 'motion-habitat-guide-path is-station'

  const stationTitle = document.createElement('span')
  stationTitle.className = 'motion-habitat-guide-path-title'
  stationTitle.textContent = 'Click any station'

  const stationDemo = document.createElement('div')
  stationDemo.className = 'motion-habitat-guide-station-demo'

  const stationDemoCopy = document.createElement('div')
  const stationDemoTitle = document.createElement('strong')
  stationDemoTitle.textContent = 'Signal station'
  const stationDemoAction = document.createElement('span')
  stationDemoAction.textContent = '> Click to approach'
  stationDemoCopy.append(stationDemoTitle, stationDemoAction)
  stationDemo.appendChild(stationDemoCopy)

  const stationCopy = document.createElement('span')
  stationCopy.className = 'motion-habitat-guide-path-copy'
  stationCopy.textContent = 'The visitor will auto-walk there and open the work.'

  stationPath.append(stationTitle, stationDemo, stationCopy)
  paths.append(manualPath, separator, stationPath)

  const dismiss = document.createElement('p')
  dismiss.className = 'motion-habitat-guide-dismiss'
  dismiss.textContent = 'Any click or movement key closes this guide.'

  guide.append(eyebrow, intro, paths, dismiss)
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
