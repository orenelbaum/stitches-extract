
import { getCssText } from "../src/example/stitches.mjs"
import { executionResults } from "../src/lib/compile-css.mjs"

import './div-styles.mjs'


process.send({ executionResults })
