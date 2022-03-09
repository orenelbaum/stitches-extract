const { transformAsync } = require("@babel/core")


// Transform imports from the source folder
async function transformImportsFromSrc(
	staticStyleFileIndices,
	transformedResults,
	sourceFilePaths,
	options
) {
	return await Promise.all(
		[...staticStyleFileIndices].map(resultIndex =>
			runTransformImportsFromSrcPlugin(
				transformedResults,
				resultIndex,
				staticStyleFileIndices,
				sourceFilePaths,
				options
			)
		)
	)
}


function runTransformImportsFromSrcPlugin(
	transformedResults,
	resultIndex,
	staticStyleFileIndices,
	sourceFilePaths,
	options
) {
	return transformAsync(
		transformedResults[resultIndex].code,
		{
			presets: ["@babel/preset-react"],
			plugins: [
				[
					"./src/lib/transform-imports-from-src.babel-plugin.js",
					{
						markFileAsStatic: () => staticStyleFileIndices.add(sourceFileIndex),
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
}


module.exports = transformImportsFromSrc
