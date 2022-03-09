import { css as stitchesCss } from '../example/stitches.mjs'


// This object contains all of the resulting class names.
export const executionResults = {}


// During the execution phase of the plugin, this function will replace the `css`
// function imported from Stitches.
// It exectues the Stitches `css` function and stores the resulting classes in the
// `executionResults` object.
export const css = (styles, uuid) => {
	const cssReturn = stitchesCss(styles)
	
	const noVariant = cssReturn().className

	const variants = getVariants(styles, cssReturn)
	
	const compoundVariants = getCompoundVariants(styles, cssReturn)

	executionResults[uuid] = { noVariant, variants, compoundVariants }
}


function getCompoundVariants(styles, cssReturn) {
	const compoundVariants = []
	if (styles.compoundVariants)
		for (const compoundVariant of styles.compoundVariants) {
			const classList = cssReturn()({ ...compoundVariant, css: undefined }).className.split(" ")
			compoundVariants.push({ variants: { ...compoundVariant, css: undefined }, className: classList[classList.length - 1] })
		}
	return compoundVariants
}


function getVariants(styles, cssReturn) {
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
	return variants
}
