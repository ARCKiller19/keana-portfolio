export function handleSectionNavigation(event) {
  const href = event.currentTarget.getAttribute('href')

  if (!href?.startsWith('#')) return

  const sectionId = href.slice(1)
  const target = document.getElementById(sectionId)

  if (!target) return

  event.preventDefault()

  if (sectionId === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cleanUrl = `${window.location.pathname}${window.location.search}`
  window.history.replaceState(null, '', cleanUrl)
}
