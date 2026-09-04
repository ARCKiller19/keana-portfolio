import { useEffect, useRef } from 'react'

function useReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      node.classList.add('is-revealed')
      return undefined
    }

    if (node.classList.contains('is-revealed')) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return

        node.classList.add('is-revealed')
        observer.unobserve(node)
      },
      {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.12,
      },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return ref
}

export default useReveal
