import { StringBuilder } from './string-builder';

export const buildModifier = (modifier, opacityScale = {}) => {
  if (!modifier) return ''

  if (modifier[0] === '[' && modifier[modifier.length - 1] === ']') {
    modifier = modifier.slice(1, -1)
  }

  if (modifier[modifier.length - 1] === '%') {
    return StringBuilder.makeArbitrary(modifier)
  }

  for (const [key, value] of Object.entries(opacityScale)) {
    if (key === modifier || value === modifier) {
      return key
    }
  }

  if ((Number(modifier) === 0 || Number(modifier) >= 1) && Number(modifier) <= 100) {
    return StringBuilder.makeArbitrary(`${modifier}%`)
  }

  if (Number(modifier) >= 0 && Number(modifier) <= 1) {
    // we have number between 0-1 but it's not in the scale just make it arbitrary.
    return StringBuilder.makeArbitrary(modifier)
  }

  return ''
}
