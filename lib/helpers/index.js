const layers = {
    app: 'app',
    entities: 'entities',
    features: 'features',
    shared: 'shared',
    pages: 'pages',
    widgets: 'widgets',
}

function isPathRelative(path) {
    return path === '.' || path === '..' || path.startsWith('./') || path.startsWith('../')
}

function normalizePath(filePath) {
    return filePath?.replace(/[\\]+/g, '/')
}

function stripAlias(value, alias = '') {
    const aliasPrefix = `${alias}/`
    return alias && value.startsWith(aliasPrefix)
        ? value.slice(aliasPrefix.length)
        : value
}

function getProjectPathFromSrc(filePath) {
    const segments = normalizePath(filePath)?.split('/') ?? []
    const srcIndex = segments.findIndex((segment, index) => {
        return segment === 'src' && layers[segments[index + 1]]
    })

    return srcIndex >= 0 ? `/${segments.slice(srcIndex + 1).join('/')}` : ''
}

function getCurrentFileLayer(filePath) {
    const projectPath = getProjectPathFromSrc(filePath)
    const segments = projectPath.split('/')

    return segments?.[1]
}

module.exports = {
    getCurrentFileLayer,
    getProjectPathFromSrc,
    isPathRelative,
    normalizePath,
    stripAlias,
}
