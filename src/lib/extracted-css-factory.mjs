
export const css = classes => variantOptions => {
    let className = classes.noVariant

    // console.log(variantOptions)
    
    for (const variantCategory in variantOptions){
        console.log(classes.variants[variantCategory][variantOptions[variantCategory]])
        className += " " + classes.variants[variantCategory][variantOptions[variantCategory]]
    }
    
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