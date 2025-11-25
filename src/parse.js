import { functionalPlugins, namedPlugins } from './plugins';
import { buildModifier } from './utils/build-modifier';
import { calculateHexFromString } from './utils/calculate-hex-from-string';
import { decodeArbitraryValue } from './utils/decode-arbitrary-value';
import { findRoot } from './utils/find-root';
import { findTailwindColorFromHex } from './utils/find-tailwind-color-from-hex';
import { inferDataType } from './utils/infer-data-type';
import { isColor } from './utils/is-color';
import { parseVariant } from './utils/parse-variant';
import { segment } from './utils/segment';

export const parse = input => {
  if (!input) {
    return {
      root: '',
      kind: 'error',
      message: 'Empty input',
    }
  }

  const state = {
    important: false,
    negative: false,
  }
  const variants = segment(input, ':')
  let base = variants.pop()

  const parsedCandidateVariants = []

  for (let i = variants.length - 1; i >= 0; --i) {
    const parsedVariant = parseVariant(variants[i])
    if (parsedVariant !== null) {
      parsedCandidateVariants.push(parsedVariant)
    }
  }

  if (base[0] === '!') {
    state.important = true
    base = base.slice(1)
  }

  if (base[0] === '-') {
    state.negative = true
    base = base.slice(1)
  }

  const namedPlugin = namedPlugins.get(base)
  if (namedPlugin) {
    return {
      root: base,
      kind: 'named',
      property: namedPlugin.ns,
      value: namedPlugin.value,
      valueDef: {
        class: namedPlugin.class,
        raw: base,
        kind: 'named',
        value: namedPlugin.value,
      },
      variants: parsedCandidateVariants,
      modifier: null,
      important: state.important,
      negative: state.negative,
      arbitrary: false,
    }
  }

  const [root, value] = findRoot(base, functionalPlugins)

  if (!root) {
    return {
      root: base,
      kind: 'error',
      message: 'Tailwindcss core plugin not found',
    }
  }

  const availablePlugins = functionalPlugins.get(root)
  let modifier = null
  let [valueWithoutModifier, modifierSegment = null] = segment(value || '', '/')
  if (modifierSegment && isColor(valueWithoutModifier.replace(/[[\]]/g, ''))) {
    modifier = buildModifier(modifierSegment)
  }

  if (valueWithoutModifier && valueWithoutModifier[0] === '[' && valueWithoutModifier[valueWithoutModifier.length - 1] === ']') {
    let arbitraryValue = valueWithoutModifier.slice(1, -1)
    const unitType = inferDataType(arbitraryValue, [...availablePlugins.values()].map(({ type }) => type))
    let associatedPluginByType = availablePlugins.find(plugin => plugin.type === unitType)

    if (unitType === 'color') {
      const color = calculateHexFromString(arbitraryValue)
      if (!color) {
        return {
          root: base,
          kind: 'error',
          message: 'Color is not correct',
        }
      }
      valueWithoutModifier = findTailwindColorFromHex(color.hex) || color.hex
    } else if (availablePlugins.length > 0) {
      associatedPluginByType = availablePlugins.find(x => x.type === unitType) || availablePlugins.find(x => x.type !== 'color')
    }

    arbitraryValue = decodeArbitraryValue(arbitraryValue)

    return {
      root: root,
      kind: 'functional',
      property: associatedPluginByType.ns,
      value: arbitraryValue,
      valueDef: {
        value: arbitraryValue,
        class: associatedPluginByType.class,
        raw: valueWithoutModifier,
        kind: unitType || 'named',
      },
      variants: parsedCandidateVariants,
      modifier: modifier,
      arbitrary: true,
      important: state.important,
      negative: state.negative,
    }
  }

  return {
    root: root,
    kind: 'functional',
    property: availablePlugins[0].ns,
    value,
    valueDef: {},
    variants: parsedCandidateVariants,
    modifier: modifier,
    important: state.important,
    negative: state.negative,
    arbitrary: false,
  }
}
