import get from 'lodash/get'

import { PluginNotFoundException } from './exceptions/plugin-not-found-exception'
import { functionalPlugins, namedPlugins } from './plugins'
import { getTailwindTheme } from './theme'
import { buildModifier } from './utils/build-modifier'
import { calculateHexFromString } from './utils/calculate-hex-from-string'
import { findTailwindColorFromHex } from './utils/find-tailwind-color-from-hex'
import { isColor } from './utils/is-color'
import { StringBuilder } from './utils/string-builder'

export const EMPTY_CLASSNAME = ''

export const classname = (ast, config) => {
  const theme = getTailwindTheme(config)
  const stringBuilder = new StringBuilder()
  let negative = ast.negative || false
  stringBuilder.appendVariants(...ast.variants || [])

  if (ast.important) {
    stringBuilder.makeImportant()
  }

  if (ast.value[0] === '-') {
    ast.value = ast.value.slice(1)
    negative = true
  }

  const [namedPluginClassName] = [...namedPlugins.entries()]
    .filter(([, plugin]) => plugin.ns === ast.property)
    .find(([, plugin]) => plugin.value === ast.value) || []

  if (namedPluginClassName) {
    return stringBuilder.addRoot(namedPluginClassName).toString()
  }

  const [root, possiblePlugins = []] = [...functionalPlugins.entries()].find(([, plugins]) => plugins.some(o => o.ns === ast.property)) || []
  if (!root) {
    throw new PluginNotFoundException(ast.property)
  }

  stringBuilder.addRoot(root)
  if (isColor(ast.value, theme)) {
    const matchedPlugin = possiblePlugins.find(plugin => plugin.type === 'color')
    if (!matchedPlugin) {
      throw new PluginNotFoundException(ast.property)
    }

    const tailwindThemeColor = get(theme[matchedPlugin.scaleKey || 'colors'], ast.value.split('-').join('.'))
    if (tailwindThemeColor && typeof tailwindThemeColor !== 'object') {
      return stringBuilder
        .appendModifier(buildModifier(ast.modifier, theme.opacity))
        .addValue(ast.value)
        .toString()
    }

    const isRgba = ast.value.includes('rgba')
    if (isRgba) {
      return stringBuilder
        .addValue(findTailwindValueByUnit(ast.value))
        .toString()
    }

    const color = calculateHexFromString(ast.value)
    if (!color) {
      return EMPTY_CLASSNAME
    }

    return stringBuilder
      .appendModifier(buildModifier(color.alpha || ast.modifier, theme.opacity))
      .addValue(
        findTailwindColorFromHex(color.hex, theme[matchedPlugin.scaleKey || 'colors']) || StringBuilder.makeArbitrary(color.hex),
      )
      .toString()
  }

  const matchedPlugin = possiblePlugins.find(plugin => plugin.ns === ast.property)
  if (!matchedPlugin) {
    throw new PluginNotFoundException(ast.property)
  }

  const possibleValue = findTailwindValueByUnit(ast.value, matchedPlugin)
  if (possibleValue) {
    stringBuilder.addValue(possibleValue)

    if (matchedPlugin.supportNegative && negative) {
      stringBuilder.makeNegative()
    }
  }

  return stringBuilder.toString()
}

const findTailwindValueByUnit = (unit, matchedPlugin = {}) => {
  if (!unit) {
    return undefined
  }

  if (matchedPlugin.type === 'image') {
    unit = `url(${unit})`
  }

  return StringBuilder.makeArbitrary(unit)
}
