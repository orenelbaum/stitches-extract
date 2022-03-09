
function importIsRelative(path) {
	return path.node.source.value[0] === "."
}

module.exports = importIsRelative
