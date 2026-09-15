const TILE_SELECTOR = '.playground-archive-grid .playground-archive-tile'

let archiveTiles = []
let activeIndex = 0
let dialogElement = null
let stageElement = null
let titleElement = null
let metaElement = null
let counterElement = null
let lastTrigger = null
let mountObserver = null

function getTileData(tile) {
  const captionParts = tile.querySelectorAll('.playground-template-caption span')
  const images = Array.from(tile.querySelectorAll('img')).map((image) => ({
    src: image.currentSrc || image.src,
    alt: image.alt || '',
  }))

  let layout = 'single'
  if (tile.classList.contains('playground-fairy-collection')) layout = 'fairy'
  if (tile.classList.contains('playground-orb-collection')) layout = 'orb'

  return {
    index: tile.querySelector('.tile-index')?.textContent?.trim() || '',
    label: captionParts[0]?.textContent?.trim() || 'Pixel work',
    meta: captionParts[1]?.textContent?.trim() || '',
    images,
    layout,
  }
}

function renderSlide(index) {
  if (!archiveTiles.length || !stageElement) return

  activeIndex = (index + archiveTiles.length) % archiveTiles.length
  const data = getTileData(archiveTiles[activeIndex])
  const lastIndex = getTileData(archiveTiles[archiveTiles.length - 1]).index

  stageElement.className = `playground-archive-viewer-stage is-${data.layout}`
  stageElement.replaceChildren()

  data.images.forEach(({ src, alt }) => {
    const image = document.createElement('img')
    image.src = src
    image.alt = alt
    image.decoding = 'async'
    image.draggable = false
    stageElement.appendChild(image)
  })

  titleElement.textContent = data.label
  metaElement.textContent = data.meta
  counterElement.textContent = `${data.index || String(activeIndex + 1).padStart(2, '0')} / ${lastIndex || String(archiveTiles.length).padStart(2, '0')}`
}

function moveSlide(offset) {
  renderSlide(activeIndex + offset)
}

function closeViewer() {
  if (!dialogElement?.open) return
  dialogElement.close()
}

function createViewer() {
  if (dialogElement) return dialogElement

  const dialog = document.createElement('dialog')
  dialog.className = 'playground-archive-viewer'
  dialog.setAttribute('aria-labelledby', 'playground-archive-viewer-title')

  const shell = document.createElement('div')
  shell.className = 'playground-archive-viewer-shell'

  const header = document.createElement('div')
  header.className = 'playground-archive-viewer-header'

  const eyebrow = document.createElement('span')
  eyebrow.className = 'playground-archive-viewer-eyebrow'
  eyebrow.textContent = 'Pixel Works & Process'

  const closeButton = document.createElement('button')
  closeButton.type = 'button'
  closeButton.className = 'playground-archive-viewer-close'
  closeButton.setAttribute('aria-label', 'Close gallery')
  closeButton.textContent = 'CLOSE ×'
  closeButton.addEventListener('click', closeViewer)

  header.append(eyebrow, closeButton)

  const body = document.createElement('div')
  body.className = 'playground-archive-viewer-body'

  const previousButton = document.createElement('button')
  previousButton.type = 'button'
  previousButton.className = 'playground-archive-viewer-nav is-previous'
  previousButton.setAttribute('aria-label', 'Previous work')
  previousButton.innerHTML = '<span aria-hidden="true">←</span>'
  previousButton.addEventListener('click', () => moveSlide(-1))

  const stage = document.createElement('div')
  stage.className = 'playground-archive-viewer-stage is-single'

  const nextButton = document.createElement('button')
  nextButton.type = 'button'
  nextButton.className = 'playground-archive-viewer-nav is-next'
  nextButton.setAttribute('aria-label', 'Next work')
  nextButton.innerHTML = '<span aria-hidden="true">→</span>'
  nextButton.addEventListener('click', () => moveSlide(1))

  body.append(previousButton, stage, nextButton)

  const footer = document.createElement('div')
  footer.className = 'playground-archive-viewer-footer'

  const caption = document.createElement('div')
  caption.className = 'playground-archive-viewer-caption'
  caption.setAttribute('aria-live', 'polite')

  const title = document.createElement('strong')
  title.id = 'playground-archive-viewer-title'

  const meta = document.createElement('span')
  caption.append(title, meta)

  const counter = document.createElement('span')
  counter.className = 'playground-archive-viewer-counter'

  footer.append(caption, counter)
  shell.append(header, body, footer)
  dialog.appendChild(shell)
  document.body.appendChild(dialog)

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      moveSlide(-1)
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      moveSlide(1)
    }
  })

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeViewer()
  })

  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('playground-archive-viewer-open')
    lastTrigger?.focus()
  })

  dialogElement = dialog
  stageElement = stage
  titleElement = title
  metaElement = meta
  counterElement = counter

  return dialog
}

function openViewer(index, trigger) {
  const dialog = createViewer()
  lastTrigger = trigger
  renderSlide(index)
  document.documentElement.classList.add('playground-archive-viewer-open')

  if (!dialog.open) dialog.showModal()
  dialog.querySelector('.playground-archive-viewer-close')?.focus()
}

function enhanceArchiveTiles() {
  const tiles = Array.from(document.querySelectorAll(TILE_SELECTOR))
  if (!tiles.length) return false

  archiveTiles = tiles

  tiles.forEach((tile, index) => {
    if (tile.dataset.archiveViewerReady === 'true') return

    const { label } = getTileData(tile)
    tile.dataset.archiveViewerReady = 'true'
    tile.tabIndex = 0
    tile.setAttribute('role', 'button')
    tile.setAttribute('aria-haspopup', 'dialog')
    tile.setAttribute('aria-label', `Open ${label} in gallery`)

    tile.addEventListener('click', () => openViewer(index, tile))
    tile.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      openViewer(index, tile)
    })
  })

  return true
}

if (!enhanceArchiveTiles()) {
  mountObserver = new MutationObserver(() => {
    if (!enhanceArchiveTiles()) return
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
    mountObserver?.disconnect()
    dialogElement?.remove()
    dialogElement = null
    stageElement = null
    titleElement = null
    metaElement = null
    counterElement = null
    archiveTiles = []
    lastTrigger = null
  },
  { once: true },
)
