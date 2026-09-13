const REEL_PREVIEW_SELECTOR = '.motion-reel-neighbor-video'
const PREVIEW_TIME_SECONDS = 0.08

function primeReelPreview(video) {
  if (!(video instanceof HTMLVideoElement)) return
  if (video.dataset.reelPreviewPrimed === 'true') return

  video.dataset.reelPreviewPrimed = 'true'
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
      // The next metadata/data event will give the browser another chance.
    }
  }

  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    seekToPreviewFrame()
  } else {
    video.addEventListener('loadedmetadata', seekToPreviewFrame, { once: true })
  }

  video.load()
}

function scanForReelPreviews(root = document) {
  root.querySelectorAll?.(REEL_PREVIEW_SELECTOR).forEach(primeReelPreview)
}

if (typeof document !== 'undefined') {
  const start = () => {
    scanForReelPreviews()

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return

          if (node.matches(REEL_PREVIEW_SELECTOR)) {
            primeReelPreview(node)
          }

          scanForReelPreviews(node)
        })
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true })
  } else {
    start()
  }
}
