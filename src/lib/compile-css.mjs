import { css as stitchesCss } from '../example/stitches.mjs'


export const executionResults = {}

export const css = (styles, uuid) => {
    const cssReturn = stitchesCss(styles)
    
    const noVariant = cssReturn().className

    const variants = {}
    if (styles.variants)
        for (const variantCategory in styles.variants) {
            variants[variantCategory] = {}
            for (const variantName in styles.variants[variantCategory]) {
                variants[variantCategory][variantName] = 
                    cssReturn({ [variantCategory]: variantName }).className
                        .split(" ")[1]
            }
        }

    
    const compoundVariants = []
    if (styles.compoundVariants)
        for (const compoundVariant of styles.compoundVariants) {
            const classList = cssReturn()({ ...compoundVariant, css: undefined }).className.split(" ")
            compoundVariants.push({ variants: { ...compoundVariant, css: undefined }, className: classList[classList.length - 1] })
        }

    executionResults[uuid] = { noVariant, variants, compoundVariants }
}
