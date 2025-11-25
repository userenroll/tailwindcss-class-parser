import { variants } from '../plugins';

import { decodeArbitraryValue } from './decode-arbitrary-value';

export function parseVariant(variant) {
  if (variant[0] === '[' && variant[variant.length - 1] === ']') {
    let arbitraryValue = variant.slice(1, -1)

    if (arbitraryValue[0] === '-' && arbitraryValue[1] === '-') {
      arbitraryValue = `var(${arbitraryValue})`
    } else {
      arbitraryValue = decodeArbitraryValue(arbitraryValue)
    }

    return {
      kind: 'arbitrary',
      type: 'misc',
      value: arbitraryValue,
    }
  }

  const matchedVariantType = variants.get(variant)
  return {
    kind: 'named',
    type: matchedVariantType || 'misc',
    value: variant,
  }
}
