const REEL_PREVIEW_SELECTOR = '.motion-reel-neighbor-video'
const PREVIEW_TIME_SECONDS = 0.08

function getPreviewSource(video) {
  const source = video.querySelector('source')
  return source?.getAttribute('src') ?? video.getAttribute('src') ?? ''
}

function primeReelPreview(video) {
  if (!(video instanceof HTMLVideoElement)) return

  const source = getPreviewSource(video)
  if (!source || video.dataset.reelPreviewSource === source) return

  video.dataset.reelPreviewSource = source
  video.pause()
  video.preload = 'auto'

  const seekToPreviewFrame = () => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return

    const previewTime = Math.min(
      PREVIEW_TIME_SECONDS,
      Math.max(0, video.duration - 0.01),
    )

    try {
      video.currentTime = previewTime
    } catch {
      // The browser can retry after the next source change/load cycle.
    }
  }

  video.addEventListener('loadedmetadata', seekToPreviewFrame, { once: true })
  video.load()
}

function scanForReelPreviews(root = document) {
  if (root instanceof HTMLVideoElement && root.matches(REEL_PREVIEW_SELECTOR)) {
    primeReelPreview(root)
  }

  root.querySelectorAll?.(REEL_PREVIEW_SELECTOR).forEach(primeReelPreview)
}

if (typeof document !== 'undefined') {
  const start = () => {
    scanForReelPreviews()

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target
          const video =
            target instanceof HTMLVideoElement
              ? target
              : target instanceof HTMLSourceElement
                ? target.parentElement
                : null

          if (
            video instanceof HTMLVideoElement &&
            video.matches(REEL_PREVIEW_SELECTOR)
          ) {
            primeReelPreview(video)
          }

          return
        }

        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return
          scanForReelPreviews(node)
        })
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src'],
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true })
  } else {
    start()
  }
}
