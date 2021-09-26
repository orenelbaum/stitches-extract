import React from "react"
import { render } from "react-dom"
import { divStyles } from "./div-styles"


const App = () => <div className={divStyles()}>Hi</div>

const rootDiv = document.querySelector("#root")
render(<App />, rootDiv)