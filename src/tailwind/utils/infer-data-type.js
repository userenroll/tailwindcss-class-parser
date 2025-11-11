import { isColor } from './is-color'
import { hasMathFn } from './math-operators'
import { segment } from './segment'

const checks = {
  color: isColor,
  length: isLength,
  percentage: isPercentage,
  number: isNumber,
  url: isUrl,
  position: isBackgroundPosition,
  'bg-size': isBackgroundSize,
  'line-width': isLineWidth,
  image: isImage,
  'family-name': isFamilyName,
  'generic-name': isGenericName,
  'absolute-size': isAbsoluteSize,
  'relative-size': isRelativeSize,
  angle: isAngle,
  vector: isVector,
  named: () => true,
}

export function inferDataType(value, types) {
  if (value.startsWith('var(')) return null

  for (const type of types) {
    if (checks[type]?.(value)) {
      return type
    }
  }

  return null
}

/* -------------------------------------------------------------------------- */

const IS_URL = /^url\(.*\)$/

function isUrl(value) {
  return IS_URL.test(value)
}

/* -------------------------------------------------------------------------- */

function isLineWidth(value) {
  return value === 'thin' || value === 'medium' || value === 'thick'
}

/* -------------------------------------------------------------------------- */

const IS_IMAGE_FN = /^(?:element|image|cross-fade|image-set)\(/
const IS_GRADIENT_FN = /^(repeating-)?(conic|linear|radial)-gradient\(/

function isImage(value) {
  let count = 0

  for (const part of segment(value, ',')) {
    if (part.startsWith('var(')) continue

    if (isUrl(part)) {
      count += 1
      continue
    }

    if (IS_GRADIENT_FN.test(part)) {
      count += 1
      continue
    }

    if (IS_IMAGE_FN.test(part)) {
      count += 1
      continue
    }

    return false
  }

  return count > 0
}

/* -------------------------------------------------------------------------- */

function isGenericName(value) {
  return (
    value === 'serif' || value === 'sans-serif' || value === 'monospace' || value === 'cursive' || value === 'fantasy' || value === 'system-ui' || value === 'ui-serif' || value === 'ui-sans-serif' || value === 'ui-monospace' || value === 'ui-rounded' || value === 'math' || value === 'emoji' || value === 'fangsong'
  )
}

function isFamilyName(value) {
  let count = 0

  for (const part of segment(value, ',')) {
    const char = part.charCodeAt(0)
    if (char >= 48 && char <= 57) return false

    if (part.startsWith('var(')) continue

    count += 1
  }

  return count > 0
}

function isAbsoluteSize(value) {
  return (
    value === 'xx-small' || value === 'x-small' || value === 'small' || value === 'medium' || value === 'large' || value === 'x-large' || value === 'xx-large' || value === 'xxx-large'
  )
}

function isRelativeSize(value) {
  return value === 'larger' || value === 'smaller'
}

/* -------------------------------------------------------------------------- */

const HAS_NUMBER = /[+-]?\d*\.?\d+(?:[eE][+-]?\d+)?/

/* -------------------------------------------------------------------------- */

const IS_NUMBER = new RegExp(`^${HAS_NUMBER.source}$`)

function isNumber(value) {
  return IS_NUMBER.test(value) || hasMathFn(value)
}

/* -------------------------------------------------------------------------- */

const IS_PERCENTAGE = new RegExp(`^${HAS_NUMBER.source}%$`)

function isPercentage(value) {
  return IS_PERCENTAGE.test(value) || hasMathFn(value)
}

const LENGTH_UNITS = [
  'cm',
  'mm',
  'Q',
  'in',
  'pc',
  'pt',
  'px',
  'em',
  'ex',
  'ch',
  'rem',
  'lh',
  'rlh',
  'vw',
  'vh',
  'vmin',
  'vmax',
  'vb',
  'vi',
  'svw',
  'svh',
  'lvw',
  'lvh',
  'dvw',
  'dvh',
  'cqw',
  'cqh',
  'cqi',
  'cqb',
  'cqmin',
  'cqmax',
]

const IS_LENGTH = new RegExp(`^${HAS_NUMBER.source}(${LENGTH_UNITS.join('|')})$`)

function isLength(value) {
  return IS_LENGTH.test(value) || hasMathFn(value)
}

function isBackgroundPosition(value) {
  let count = 0

  for (const part of segment(value, ' ')) {
    if (
      part === 'center' || part === 'top' || part === 'right' || part === 'bottom' || part === 'left'
    ) {
      count += 1
      continue
    }

    if (part.startsWith('var(')) continue

    if (isLength(part) || isPercentage(part)) {
      count += 1
      continue
    }

    return false
  }

  return count > 0
}

function isBackgroundSize(value) {
  let count = 0

  for (const size of segment(value, ',')) {
    if (size === 'cover' || size === 'contain') {
      count += 1
      continue
    }

    const values = segment(size, ' ')

    // Sizes must have exactly one or two values
    if (values.length !== 1 && values.length !== 2) {
      return false
    }

    if (values.every(value => value === 'auto' || isLength(value) || isPercentage(value))) {
      count += 1
    }
  }

  return count > 0
}

const ANGLE_UNITS = ['deg', 'rad', 'grad', 'turn']

const IS_ANGLE = new RegExp(`^${HAS_NUMBER.source}(${ANGLE_UNITS.join('|')})$`)

function isAngle(value) {
  return IS_ANGLE.test(value)
}

const IS_VECTOR = new RegExp(`^${HAS_NUMBER.source} +${HAS_NUMBER.source} +${HAS_NUMBER.source}$`)

function isVector(value) {
  return IS_VECTOR.test(value)
}
