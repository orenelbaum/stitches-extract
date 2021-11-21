
export const extractedCss = classes => variantOptions => {
    const className = classes.noVariant
    
    for (const variantCategory in variantOptions)
        className += classes.variants[variantCategory]
    
    for (const compoundVariant of classes.compoundVariants) {
        let foundMissingVariant = false
        for (variantCategory in compoundVariant.variants)
            if (
                !variantOptions[variantCategory] 
                || variantOptions[variantCategory] !== compoundVariant.variants[variantCategory]
            )
                foundMissingVariant = true
        
        if (!foundMissingVariant) className += compoundVariant.className
    }
    
    return className
}