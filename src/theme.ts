import memoize from 'lodash/memoize'

export const getTailwindTheme = memoize((config: any | undefined = {}): any => {
    const parsedConfig = config || {}
    return parsedConfig.theme || {}
})
