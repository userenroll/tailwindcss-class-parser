import { colord } from 'colord';

export const findTailwindColorFromHex = (colorInput, colors = {}) => {
  if (!colorInput) return false

  for (const [key, twColors] of Object.entries(colors)) {
    if ((twColors === '#fff' || twColors === '#000') && colord(colorInput).isEqual(twColors)) {
      return key
    } else {
      for (const [shade, hex] of Object.entries(twColors)) {
        if (hex === colorInput) {
          return `${key}-${shade}`
        }
      }
    }
  }

  return false
}
