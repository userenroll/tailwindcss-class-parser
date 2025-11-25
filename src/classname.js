import { PluginNotFoundException } from './exceptions/plugin-not-found-exception'
import { functionalPlugins, namedPlugins } from './plugins'
import { isColor } from './utils/is-color'
import { StringBuilder } from './utils/string-builder'

export const EMPTY_CLASSNAME = ''

export const classname = ast => {
  if ([null, undefined, ''].includes(ast.value)) {
    return EMPTY_CLASSNAME
  }

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

  if (ast.skipParse) {
    return stringBuilder
      .addValue(ast.value)
      .toString()
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
  if (isColor(ast.value)) {
    const matchedPlugin = possiblePlugins.find(plugin => plugin.type === 'color')
    if (!matchedPlugin) {
      throw new PluginNotFoundException(ast.property)
    }

    const isRgba = ast.value.includes('rgba')
    if (isRgba) {
      return stringBuilder
        .addValue(findTailwindValueByUnit(ast.value))
        .toString()
    }

    return stringBuilder
      .addValue(ast.value)
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

  if (matchedPlugin.type === 'image' && !unit.includes('url')) {
    unit = `url(${unit})`
  }

  return StringBuilder.makeArbitrary(unit)
}
