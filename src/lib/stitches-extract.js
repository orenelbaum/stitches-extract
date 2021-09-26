#! /usr/bin/env node

const fs = require('fs')
const { promisify } = require('util')
const path = require("path")
const childProcess = require('child_process')
const { transformFileAsync, transformFileSync } = require("@babel/core")
const process = require('process')

const { resolve } = path
const { writeFileSync } = fs


fs.rmdirSync("./stitches-extract", { recursive: true })
fs.mkdirSync("./stitches-extract", { recursive: true })

// Copied from https://stackoverflow.com/a/45130990
const getFiles = (() => {
    const readdir = promisify(fs.readdir)
    const stat = promisify(fs.stat)
    
    return async dir => {
        const subdirs = await readdir(dir)
        const files = await Promise.all(subdirs.map(async (subdir) => {
            const res = resolve(dir, subdir)
            return (await stat(res)).isDirectory() ? getFiles(res) : res
        }))
        return files.reduce((a, f) => a.concat(f), [])
    }
})()


;(async () => {
    const sourceFilePaths = await getFiles("./src/example")
    const staticStyleFileIndices = new Set()

    const transformedResults = await Promise.all(
        sourceFilePaths.map((sourceFilePath, sourceFileIndex) =>
            transformFileAsync(
                sourceFilePath,
                {
                    // presets: ["@babel/preset-typescript"],
                    presets: ["@babel/preset-react"],
                    plugins: [
                        [
                            "./src/lib/prepare-for-execution.babel-plugin.js",
                            { 
                                markFileAsStatic:
                                    () => staticStyleFileIndices.add(sourceFileIndex)
                            }
                        ]
                    ],
                    configFile: false
                }
            )
        )
    )

    const sourceFolderAbsolutePath = path.resolve("./src/example")

    for (const staticStyleFileIndex of staticStyleFileIndices.values()) {
        const sourceFilePath = sourceFilePaths[staticStyleFileIndex]
        const sourceFileRelativePath = sourceFilePath.replace(sourceFolderAbsolutePath, "")
        const outputFileAbsolutePath = `./stitches-extract/${sourceFileRelativePath}`
        const transformedCode = transformedResults[staticStyleFileIndex].code
        
        fs.mkdirSync(outputFileAbsolutePath.match(/(.*)[\/\\]/)[1]||'', { recursive: true })
        writeFileSync(outputFileAbsolutePath, transformedCode)
    }

    {
        let importList = ''
        for (const staticStyleFileIndex of staticStyleFileIndices.values()){
            const importPath = sourceFilePaths[staticStyleFileIndex]
            const relativeImport = importPath.replace(sourceFolderAbsolutePath, "")
            const relativeImportPathWithForwardSlashes = relativeImport.replace(/\\/g, "/")
            importList += `import '.${relativeImportPathWithForwardSlashes}'\n`
        }

        // const stitchesPath = path.resolve("./src/example/stitches.js")

        writeFileSync("./stitches-extract/execute.mjs", `
import { getCssText } from "../src/example/stitches.mjs"
import { executionResults } from "../src/lib/compile-css.mjs"

${importList}

process.send({ executionResults, css: getCssText() })
`
        )
    }

    {
        const child = childProcess.fork("./stitches-extract/execute.mjs", undefined, { cwd: process.cwd() });

        const outputFilePaths = await getFiles("./stitches-extract")
        child.on('message', ({ executionResults, css }) => {
            writeFileSync("./stitches-extract/extracted-styles.css", css)
            outputFilePaths.map((outputFilePath) => {
                const { code } = transformFileSync(
                    outputFilePath,
                    {
                        // presets: ["@babel/preset-typescript"],
                        presets: ["@babel/preset-react"],
                        plugins: [
                            [
                                "./src/lib/transform-to-static.babel-plugin.js",
                                { executionResults }
                            ]
                        ],
                        configFile: false
                    }
                )
                writeFileSync(outputFilePath, code)
            })
        })
    }

})()
