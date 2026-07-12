const path = require('path');
const {isPathRelative, getProjectPathFromSrc, getCurrentFileLayer, stripAlias} = require('../helpers');
const micromatch = require('micromatch');

const LAYER_IMPORT_ERROR = 'Слой может импортировать в себя только нижележащие слои (shared, entities, features, widgets, pages, app)';
const ENTITY_CROSS_IMPORT_ERROR = 'Сущности могут импортировать другие сущности только через @x public API';
const ENTITY_CROSS_IMPORT_TARGET_ERROR = '@x public API должен быть предназначен для текущей сущности';

module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "saf",
      category: "Fill me in",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string',
          },
          ignoreImportPatterns: {
            type: 'array',
          }
        },
      }
    ],
  },

  create(context) {
    const layers = {
      'app': ['pages', 'widgets', 'features', 'shared', 'entities'],
      'pages': ['widgets', 'features', 'shared', 'entities'],
      'widgets': ['features', 'shared', 'entities'],
      'features': ['shared', 'entities'],
      'entities': ['shared', 'entities'],
      'shared': ['shared'],
    }

    const availableLayers = {
      'app': 'app',
      'entities': 'entities',
      'features': 'features',
      'shared': 'shared',
      'pages': 'pages',
      'widgets': 'widgets',
    }


    const {alias = '', ignoreImportPatterns = []} = context.options[0] ?? {};

    const getImportLayer = (value) => {
      const importPath = stripAlias(value, alias);
      const segments = importPath?.split('/')

      return segments?.[0]
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value
        const currentFileLayer = getCurrentFileLayer(context.getFilename())
        const normalizedImportPath = stripAlias(importPath, alias)
        const importLayer = getImportLayer(importPath)

        if(isPathRelative(importPath)) {
          return;
        }

        if(!availableLayers[importLayer] || !availableLayers[currentFileLayer]) {
          return;
        }

        const isIgnored = ignoreImportPatterns.some(pattern => {
          return micromatch.isMatch(importPath, pattern)
        });

        if(isIgnored) {
          return;
        }

        const entityCrossImportError = getEntityCrossImportError(context.getFilename(), normalizedImportPath);

        if(entityCrossImportError) {
          context.report(node, entityCrossImportError);
          return;
        }

        if(!layers[currentFileLayer]?.includes(importLayer)) {
          context.report(node, LAYER_IMPORT_ERROR);
        }
      }
    };
  },
};

function getEntityCrossImportError(fromFilename, importPath) {
  const fromSegments = getProjectPathFromSrc(path.toNamespacedPath(fromFilename)).split('/').filter(Boolean);
  const importSegments = importPath.split('/');

  const fromLayer = fromSegments[0];
  const fromSlice = fromSegments[1];
  const importLayer = importSegments[0];
  const importSlice = importSegments[1];
  const importApiSegment = importSegments[2];
  const importCrossTarget = importSegments[3];

  if(fromLayer !== 'entities' || importLayer !== 'entities') {
    return null;
  }

  if(!fromSlice || !importSlice || fromSlice === importSlice) {
    return null;
  }

  if(importApiSegment !== '@x') {
    return ENTITY_CROSS_IMPORT_ERROR;
  }

  return importCrossTarget !== fromSlice ? ENTITY_CROSS_IMPORT_TARGET_ERROR : null;
}
