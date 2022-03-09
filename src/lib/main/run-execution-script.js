const { writeFileSync, rmSync } = require('fs')
const { fork } = require('child_process')
const { transformFileSync } = require("@babel/core")
const { cwd } = require('process')
const { getFiles } = require('../utils/get-files.util')


module.exports = function runExecutionScript(stitchesExtractFolder) {
   const child = fork(`${stitchesExtractFolder}/execute.mjs`, undefined, { cwd: cwd() })

   // Add the event that will be called when the execution script ends.
   child.on('message', async ({ executionResults, css }) => {
		// Remove the execution script since it already has been executed at this point.
		rmSync(`${stitchesExtractFolder}/execute.mjs`)

		const outputFilePaths = await getFiles(stitchesExtractFolder)

		// Create the CSS file that contains all of the extracted CSS
		writeFileSync(`${stitchesExtractFolder}/extracted-styles.css`, css)

		// Replace the execution files with the actual extracted `css` functions
		replaceExecutionFilesWithExtractedStyles(
			outputFilePaths,
			executionResults
		)
   })
}


function replaceExecutionFilesWithExtractedStyles(outputFilePaths, executionResults) {
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
}
