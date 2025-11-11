import { addWhitespaceAroundMathOperators } from './math-operators'

export function decodeArbitraryValue(input) {
  if (input.startsWith('url(')) {
    return input
  }

  input = convertUnderscoresToWhitespace(input)
  input = addWhitespaceAroundMathOperators(input)

  return input
}

function convertUnderscoresToWhitespace(input) {
  let output = ''
  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    if (char === '\\' && input[i + 1] === '_') {
      output += '_'
      i += 1
    } else if (char === '_') {
      output += ' '
    } else {
      output += char
    }
  }

  return output
}
