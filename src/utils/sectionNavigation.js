export function getSectionActivationLine() {
  const nav = document.querySelector('.nav')
  const navHeight = nav?.getBoundingClientRect().height ?? 70

  return navHeight + 24
}

function getWorkArrivalTop(target) {
  const sectionHead = target.querySelector('.specimen-section-head')

  if (!sectionHead || window.innerWidth <= 920) return null

  const nav = document.querySelector('.nav')
  const navRect = nav?.getBoundingClientRect()
  const activationLine = getSectionActivationLine()
  const navBottom = navRect?.bottom ?? activationLine
  const desiredHeadTop = Math.max(navBottom + 12, activationLine)
  const headRect = sectionHead.getBoundingClientRect()

  return window.scrollY + headRect.top - desiredHeadTop
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

    const workArrivalTop =
      sectionId === 'work' ? getWorkArrivalTop(target) : null
    const activationLine = getSectionActivationLine()
    const targetTop =
      workArrivalTop ??
      window.scrollY + target.getBoundingClientRect().top - activationLine

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: 'smooth',
    })
  }

  const cleanUrl = `${window.location.pathname}${window.location.search}`
  window.history.replaceState(null, '', cleanUrl)
}
