const { transformFileAsync } = require("@babel/core")


// Prepare static files for execution and mark them as static (by adding their index to
// `staticStyleFileIndices`).
const prepareAndMarkStaticFiles = async (
	sourceFilePaths,
	staticStyleFileIndices,
	options
) =>
	await Promise.all(
		sourceFilePaths.map(
			runPrepareForExecutionPlugin(staticStyleFileIndices, options)
		)    
	)


function runPrepareForExecutionPlugin(staticStyleFileIndices, options) {
	return (sourceFilePath, sourceFileIndex) => transformFileAsync(
		sourceFilePath,
		{
			presets: ["@babel/preset-react"],
			plugins: [
				[
					"./src/lib/prepare-for-execution.babel-plugin.js",
					{
						markFileAsStatic: () => staticStyleFileIndices.add(sourceFileIndex),
						...options
					}
				]
			],
			configFile: false
		}
	)
}


module.exports = prepareAndMarkStaticFiles
