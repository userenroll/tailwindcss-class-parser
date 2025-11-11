const mathFunctions = [
  'calc',
  'min',
  'max',
  'clamp',
  'mod',
  'rem',
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'atan2',
  'pow',
  'sqrt',
  'hypot',
  'log',
  'exp',
  'round',
]

export function hasMathFn(input) {
  return input.indexOf('(') !== -1 && mathFunctions.some(fn => input.includes(`${fn}(`))
}

export function addWhitespaceAroundMathOperators(input) {
  if (input.indexOf('(') === -1) {
    return input
  }

  if (!mathFunctions.some(fn => input.includes(fn))) {
    return input
  }

  let result = ''
  const formattable = []

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    if (char === '(') {
      result += char

      let start = i

      for (let j = i - 1; j >= 0; j--) {
        const inner = input.charCodeAt(j)

        if (inner >= 48 && inner <= 57) {
          start = j
        } else if (inner >= 97 && inner <= 122) {
          start = j
        } else {
          break
        }
      }

      const fn = input.slice(start, i)

      if (mathFunctions.includes(fn)) {
        formattable.unshift(true)
        continue
      } else if (formattable[0] && fn === '') {
        formattable.unshift(true)
        continue
      }

      formattable.unshift(false)
      continue
    } else if (char === ')') {
      result += char
      formattable.shift()
    } else if (char === ',' && formattable[0]) {
      result += `, `
      continue
    } else if (char === ' ' && formattable[0] && result[result.length - 1] === ' ') {
      continue
    } else if ((char === '+' || char === '*' || char === '/' || char === '-') && formattable[0]) {
      const trimmed = result.trimEnd()
      const prev = trimmed[trimmed.length - 1]

      if (prev === '+' || prev === '*' || prev === '/' || prev === '-') {
        result += char
        continue
      } else if (prev === '(' || prev === ',') {
        result += char
        continue
      } else if (input[i - 1] === ' ') {
        result += `${char} `
      } else {
        result += ` ${char} `
      }
    } else if (formattable[0] && input.startsWith('to-zero', i)) {
      const start = i
      i += 7
      result += input.slice(start, i + 1)
    } else {
      result += char
    }
  }

  return result
}
