import React from "react"
import { render } from "react-dom"
import { Button } from "./button/button"
import { divStyles } from "./div-styles"


const App = () => <>
   <div className={divStyles({ color: "red" })}>Hi</div>
   <Button/>
</>

const rootDiv = document.querySelector("#root")
render(<App />, rootDiv)