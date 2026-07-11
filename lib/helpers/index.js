function isPathRelative(path) {
    return path === '.' || path.startsWith('./') || path.startsWith('../')
}

function getCurrentFileLayer(filePath) {
    const normalizedPath = filePath?.replace(/[\\]+/g, "/")
    const projectPath = normalizedPath?.split('src')[1]
    const segments = projectPath?.split('/')

    return segments?.[1]
}

module.exports = {
    isPathRelative,
    getCurrentFileLayer
}
