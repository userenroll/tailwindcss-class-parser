export class StringBuilder {
    _classRoot = ''
    _classValue = ''
    _modifier = ''
    _variants = []
    important = false
    negative = false

    addRoot(str) {
        this._classRoot = str
        return this
    }

    addValue(str) {
        this._classValue = str
        return this
    }

    appendModifier(modifier) {
        if (modifier) {
            this._modifier = `/${modifier}`
        }
        return this
    }

    appendVariants(...variants) {
        for (const variant of variants) {
            this._variants.push(variant)
        }
        return this
    }

    makeImportant() {
        this.important = true
        return this
    }

    makeNegative() {
        this.negative = true
        return this
    }

    toString() {
        const variantOrder = ['media', 'system', 'interaction', 'pseudo', 'content', 'form', 'state', 'misc']
        const _sortedVariants = this._variants.sort((a, b) => variantOrder.indexOf(a.type) - variantOrder.indexOf(b.type))

        return (_sortedVariants.length > 0 ? `${_sortedVariants.map(x => x.value).join(':')}:` : '') + (this.important ? '!' : '') + (this.negative ? '-' : '') + this._classRoot + (this._classValue ? `-${this._classValue}` : '') + this._modifier
    }

    static makeInputArbitraryFormat(input) {
        return input.replace(/\s/g, '_')
    }

    static makeArbitrary(input) {
        if (input.includes('(') || /[0-9]/.test(input) && (!input.includes('-') || !input.indexOf('-'))) {
            return `[${StringBuilder.makeInputArbitraryFormat(input)}]`
        }
        return input
    }
}
