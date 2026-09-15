export function getSectionActivationLine() {
  const nav = document.querySelector('.nav')
  const navHeight = nav?.getBoundingClientRect().height ?? 70

  return navHeight + 24
}

function getWorkArrivalTop(target) {
  const workbench = target.querySelector('.specimen-workbench')

  if (!workbench || window.innerWidth <= 920) return null

  const nav = document.querySelector('.nav')
  const navRect = nav?.getBoundingClientRect()
  const activationLine = getSectionActivationLine()
  const navBottom = navRect?.bottom ?? activationLine
  const reservedTop = Math.max(navBottom + 70, activationLine + 54)
  const viewportBottom = window.innerHeight - 18
  const usableHeight = Math.max(viewportBottom - reservedTop, 0)
  const desiredCenter = reservedTop + usableHeight / 2
  const workbenchRect = workbench.getBoundingClientRect()

  return (
    window.scrollY +
    workbenchRect.top +
    workbenchRect.height / 2 -
    desiredCenter
  )
}

function getPlaygroundArrivalTop(target) {
  const headingRow = target.querySelector('.section-head')
  if (!headingRow) return null

  const landingLine = getSectionActivationLine() + 28

  return (
    window.scrollY +
    headingRow.getBoundingClientRect().top -
    landingLine
  )
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
    if (sectionId === 'work') {
      window.dispatchEvent(new CustomEvent('keana:work-arrival'))
    }

    const customArrivalTop =
      sectionId === 'work'
        ? getWorkArrivalTop(target)
        : sectionId === 'playground'
          ? getPlaygroundArrivalTop(target)
          : null
    const activationLine = getSectionActivationLine()
    const targetTop =
      customArrivalTop ??
      window.scrollY + target.getBoundingClientRect().top - activationLine

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: 'smooth',
    })
  }

  const cleanUrl = `${window.location.pathname}${window.location.search}`
  window.history.replaceState(null, '', cleanUrl)
}
