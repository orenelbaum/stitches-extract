import { css } from "~stitches"
import { BLUE } from "./blue"
import { buttonStyles } from "./button/button-styles.mjs"


export const divStyles = css({ 
    color: BLUE,
    variants: { color: { red: { color: "red" } } }
}, buttonStyles)
