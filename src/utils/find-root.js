export function findRoot(input, lookup) {
  if (lookup.has(input)) return [input, null]

  let idx = input.lastIndexOf('-')
  if (idx === -1) {
    if (input[0] === '@' && lookup.has('@')) {
      return ['@', input.slice(1)]
    }

    return [null, null]
  }

  do {
    const maybeRoot = input.slice(0, idx)
    if (lookup.has(maybeRoot)) {
      return [maybeRoot, input.slice(idx + 1)]
    }

    idx = input.lastIndexOf('-', idx - 1)
  } while (idx > 0)

  return [null, null]
}
