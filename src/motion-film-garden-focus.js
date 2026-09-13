const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

function handleFilmGardenChoice(event) {
  const choice = event.target.closest('.motion-screening-choice')
  if (!choice || choice.classList.contains('is-active')) return

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const stage = document.querySelector('.motion-screening-stage')
      if (!stage) return

      stage.scrollIntoView({
        behavior: reducedMotionQuery.matches ? 'auto' : 'smooth',
        block: 'center',
      })
    })
  })
}

document.addEventListener('click', handleFilmGardenChoice)
