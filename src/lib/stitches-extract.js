#! /usr/bin/env node

const fs = require('fs')
const { promisify } = require('util')
const path = require("path")
const childProcess = require('child_process')
const { transformFileAsync, transformFileSync, transformAsync } = require("@babel/core")
const process = require('process')
const commandLineArgs = require('command-line-args')

const { resolve, relative } = path
const { writeFileSync } = fs


const optionDefinitions = [
    { name: 'stitchesExtractFolder', type: String },
    { name: 'sourceFolder', type: String },
    { name: 'configuredStitchesPath', type: String }
]

const options = commandLineArgs(optionDefinitions)

// Delete and create again the folder for extracted styles
{
    fs.rmdirSync(options.stitchesExtractFolder, { recursive: true })
    fs.mkdirSync(options.stitchesExtractFolder, { recursive: true })
}

// A function that gets all the file paths in a given directory
// Copied from https://stackoverflow.com/a/45130990
const getFiles = (() => {
    const readdir = promisify(fs.readdir)
    const stat = promisify(fs.stat)
    
    return async dir => {
        const subdirs = await readdir(dir)
        const files = await Promise.all(subdirs.map(async subdir => {
            const res = resolve(dir, subdir)
            return (await stat(res)).isDirectory() ? getFiles(res) : res
        }))
        return files.reduce((a, f) => a.concat(f), [])
    }
})()


;(async () => {
    const sourceFilePaths = await getFiles(options.sourceFolder)
    const staticStyleFileIndices = new Set()

    // Prepare static files for execution and mark them as static
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
                                    () => staticStyleFileIndices.add(sourceFileIndex),
                                ...options
                            }
                        ]
                    ],
                    configFile: false
                }
            )
        )
    )

    // Transform imports from src
    const doubleTransformedResults = await Promise.all(
        [...staticStyleFileIndices].map(resultIndex =>
            transformAsync(
                transformedResults[resultIndex].code,
                {
                    // presets: ["@babel/preset-typescript"],
                    presets: ["@babel/preset-react"],
                    plugins: [
                        [
                            "./src/lib/paparoni.babel-plugin.js",
                            { 
                                markFileAsStatic:
                                    () => staticStyleFileIndices.add(sourceFileIndex),
                                staticStyleFileIndices,
                                sourceFilePaths,
                                filePath: sourceFilePaths[resultIndex],
                                ...options
                            }
                        ]
                    ],
                    configFile: false
                }
            )
        )
    )

    const sourceFolderAbsolutePath = path.resolve(options.sourceFolder)

    // Add all transformed files to the extraction folder
    let i = 0
    for (const staticStyleFileIndex of staticStyleFileIndices.values()) {
        // Get the absolute path to output the file to
        let outputFileAbsolutePath
        {
            const sourceFilePath = sourceFilePaths[staticStyleFileIndex]
            const sourceFileRelativePath = sourceFilePath.replace(sourceFolderAbsolutePath, "")
            outputFileAbsolutePath = `./stitches-extract/${sourceFileRelativePath}`
        }

        const transformedCode = doubleTransformedResults[i].code

        // console.log({transformedCode});
        
        // Create the output directory if it doesn't exist and write the transformed file
        fs.mkdirSync(outputFileAbsolutePath.match(/(.*)[\/\\]/)[1]||'', { recursive: true })
        writeFileSync(outputFileAbsolutePath, transformedCode)

        i++
    }

    // Create the execution script
    {
        // Create code to import all of the transformed files
        let importList
        {
            importList = ''
            for (const staticStyleFileIndex of staticStyleFileIndices.values()){
                const importPath = sourceFilePaths[staticStyleFileIndex]
                const relativeImport = importPath.replace(sourceFolderAbsolutePath, "")
                const relativeImportPathWithForwardSlashes = relativeImport.replace(/\\/g, "/")
                importList += `import '.${relativeImportPathWithForwardSlashes}'\n`
            }
        }

        const pathFromStitchesExtractToSrc = relative(options.stitchesExtractFolder, options.configuredStitchesPath).replace(/\\/g, "/")

        writeFileSync(`${options.stitchesExtractFolder}/execute.mjs`, `
import { getCssText } from "${pathFromStitchesExtractToSrc}"
import { executionResults } from "../src/lib/compile-css.mjs"

${
    // Import all of the transformed files, which will call the 'css' function from the
    // 'compile-css' file, thus generating the css and storing the class names in the
    // 'executionResults' object
    importList
}

// Send the class names and the resulting CSS back to the parent
process.send({ executionResults, css: getCssText() })
`
        )
    }

    // Execute the execution script
    {
        // Execute the execution script
        const child = childProcess.fork(`${options.stitchesExtractFolder}/execute.mjs`, undefined, { cwd: process.cwd() });

        // Add the event that will be called when the execution script ends.
        child.on('message', async ({ executionResults, css }) => {
            // Remove the execution script since it already has been executed at this point.
            fs.rmSync(`${options.stitchesExtractFolder}/execute.mjs`)

            const outputFilePaths = await getFiles(options.stitchesExtractFolder)

            // Create the CSS file that contains all of the extracted CSS
            writeFileSync(`${options.stitchesExtractFolder}/extracted-styles.css`, css)

            // Replace the execution files with the actual extracted `css` functions
            outputFilePaths.map((outputFilePath) => {
                // Transform the file
                const { code } = transformFileSync(
                    outputFilePath,
                    {
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

                // Overwrite the execution file
                writeFileSync(outputFilePath, code)
            })
        })
    }

})()
