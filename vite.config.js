import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const MOBILE_MAX_WIDTH = 720

function findClosingBrace(css, openingBraceIndex) {
  let depth = 0
  let quote = null
  let escaped = false

  for (let index = openingBraceIndex; index < css.length; index += 1) {
    const character = css[index]

    if (quote) {
      if (escaped) {
        escaped = false
      } else if (character === '\\') {
        escaped = true
      } else if (character === quote) {
        quote = null
      }

      continue
    }

    if (character === '"' || character === "'") {
      quote = character
      continue
    }

    if (character === '{') depth += 1
    if (character === '}') depth -= 1
    if (depth === 0) return index
  }

  return -1
}

function createLegacyMobileCondition(condition) {
  const maxWidths = Array.from(
    condition.matchAll(/\(width\s*<=\s*(\d+(?:\.\d+)?)px\)/g),
  )

  if (maxWidths.length === 0 || /\(width\s*>=/.test(condition)) {
    return null
  }

  const legacyCondition = condition
    .replace(
      /\(width\s*<=\s*(\d+(?:\.\d+)?)px\)/g,
      (_, width) => `(max-width:${Math.min(Number(width), MOBILE_MAX_WIDTH)}px)`,
    )
    .replace(
      /\(height\s*<=\s*(\d+(?:\.\d+)?)px\)/g,
      '(max-height:$1px)',
    )
    .replace(
      /\(height\s*>=\s*(\d+(?:\.\d+)?)px\)/g,
      '(min-height:$1px)',
    )

  return {
    condition: legacyCondition,
    replacesOriginal: maxWidths.every(
      ([, width]) => Number(width) <= MOBILE_MAX_WIDTH,
    ),
  }
}

function addLegacyMobileMediaQueries(css) {
  let result = ''
  let cursor = 0

  while (cursor < css.length) {
    const mediaIndex = css.indexOf('@media', cursor)
    if (mediaIndex === -1) {
      result += css.slice(cursor)
      break
    }

    const openingBraceIndex = css.indexOf('{', mediaIndex)
    if (openingBraceIndex === -1) {
      result += css.slice(cursor)
      break
    }

    const closingBraceIndex = findClosingBrace(css, openingBraceIndex)
    if (closingBraceIndex === -1) {
      result += css.slice(cursor)
      break
    }

    result += css.slice(cursor, mediaIndex)

    const condition = css.slice(mediaIndex + '@media'.length, openingBraceIndex)
    const blockBody = css.slice(openingBraceIndex, closingBraceIndex + 1)
    const legacy = createLegacyMobileCondition(condition)

    if (!legacy) {
      result += css.slice(mediaIndex, closingBraceIndex + 1)
    } else if (legacy.replacesOriginal) {
      result += `@media${legacy.condition}${blockBody}`
    } else {
      result += css.slice(mediaIndex, closingBraceIndex + 1)
      result += `@media${legacy.condition}${blockBody}`
    }

    cursor = closingBraceIndex + 1
  }

  return result
}

function legacyMobileMediaQueries() {
  return {
    name: 'legacy-mobile-media-queries',
    apply: 'build',
    generateBundle(_options, bundle) {
      Object.values(bundle).forEach((entry) => {
        if (entry.type !== 'asset' || !entry.fileName.endsWith('.css')) return

        const css = String(entry.source)
        entry.source = addLegacyMobileMediaQueries(css)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), legacyMobileMediaQueries()],
})
