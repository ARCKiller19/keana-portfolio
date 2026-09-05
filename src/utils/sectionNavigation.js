export function getSectionActivationLine() {
  const nav = document.querySelector('.nav')
  const navHeight = nav?.getBoundingClientRect().height ?? 70

  return navHeight + 24
}

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
    const activationLine = getSectionActivationLine()
    const targetTop =
      window.scrollY + target.getBoundingClientRect().top - activationLine

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: 'smooth',
    })
  }

  const cleanUrl = `${window.location.pathname}${window.location.search}`
  window.history.replaceState(null, '', cleanUrl)
}
