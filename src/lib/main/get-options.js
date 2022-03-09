const commandLineArgs = require('command-line-args')


function getOptions() {
   const optionDefinitions = [
		{ name: 'stitchesExtractFolder', type: String },
		{ name: 'sourceFolder', type: String },
		{ name: 'configuredStitchesPath', type: String }
   ]

   return commandLineArgs(optionDefinitions)
}

module.exports =  getOptions
