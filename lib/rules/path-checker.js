"use strict";

const path = require('path');
const {getProjectPathFromSrc, isPathRelative, stripAlias} = require('../helpers');

const SAME_SLICE_RELATIVE_ERROR = 'В рамках одного слайса все пути должны быть относительными';
const PUBLIC_API_RELATIVE_ERROR = 'Относительный импорт из public API запрещен, импортируйте напрямую из файла';

module.exports = {
  meta: {
    type: null,
    docs: {
      description: "feature sliced relative path checker",
      category: "Fill me in",
      recommended: false,
      url: null,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string'
          },
          autoFix: {
            type: 'boolean'
          },
          forbiddenRelativeImports: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      }
    ],
  },

  create(context) {
    const {alias = '', autoFix = true, forbiddenRelativeImports = []} = context.options[0] ?? {};

    return {
      ImportDeclaration(node) {
        try {
          // example app/entities/Article
          const value = node.source.value
          const importTo = stripAlias(value, alias);

          // example C:\Users\dm\Desktop\javascript\production_project\src\entities\Article
          const fromFilename = context.getFilename();

          if(shouldBeRelative(fromFilename, importTo)) {
            const report = {
              node,
              message: SAME_SLICE_RELATIVE_ERROR,
            };

            if(autoFix) {
              const relativePath = getRelativePath(fromFilename, importTo);

              if(!isForbiddenRelativeImport(fromFilename, relativePath, forbiddenRelativeImports)) {
                report.fix = (fixer) => {
                return fixer.replaceText(node.source, `'${relativePath}'`)
                }
              }
            }

            context.report({
              ...report,
            });
          }

          if(isForbiddenRelativeImport(fromFilename, importTo, forbiddenRelativeImports)) {
            context.report({
              node,
              message: PUBLIC_API_RELATIVE_ERROR,
            });
          }
        } catch (e) {
          console.log(e)
        }
      }
    };
  },
};



const layers = {
  'entities': 'entities',
  'features': 'features',
  'shared': 'shared',
  'pages': 'pages',
  'widgets': 'widgets',
}

function getNormalizedCurrentFilePath(currentFilePath) {
  return getProjectPathFromSrc(path.toNamespacedPath(currentFilePath))
}

function shouldBeRelative(from, to) {
  if(isPathRelative(to)) {
    return false;
  }

  // example entities/Article
  const toArray = to.split('/')
  const toLayer = toArray[0]; // entities
  const toSlice = toArray[1]; // Article

  if(!toLayer || !toSlice || !layers[toLayer]) {
    return false;
  }

  const projectFrom = getNormalizedCurrentFilePath(from);
  const fromArray = projectFrom.split(/\\|\//);

  const fromLayer = fromArray[1];
  const fromSlice = fromArray[2];

  if(!fromLayer || !fromSlice || !layers[fromLayer]) {
    return false;
  }

  return fromSlice === toSlice && toLayer === fromLayer;
}

function getRelativePath(from, to) {
  const normalizedPath = getNormalizedCurrentFilePath(from) // /entities/Article/Article.tsx
      .split('/')
      .slice(0, -1)
      .join('/');
  let relativePath = path.relative(normalizedPath, `/${to}`)
      .split('\\')
      .join('/');

  if(!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }

  return relativePath;
}

function isForbiddenRelativeImport(from, to, forbiddenRelativeImports) {
  if(!isPathRelative(to)) {
    return false;
  }

  const projectFrom = getNormalizedCurrentFilePath(from);

  if(!projectFrom) {
    return false;
  }

  const fromDir = path.posix.dirname(projectFrom);
  const importTo = path.posix.normalize(path.posix.join(fromDir, to));
  const segments = importTo.split('/').filter(Boolean);

  const layer = segments[0];
  const slice = segments[1];
  const importTarget = segments[segments.length - 1];
  const importTargetName = path.parse(importTarget ?? '').name;
  const relativeSegments = to.split('/').filter(Boolean);
  const relativeTarget = relativeSegments[relativeSegments.length - 1];
  const isEmptyImportTarget = relativeTarget === '.' || relativeTarget === '..';

  if(!layer || !slice || !layers[layer]) {
    return false;
  }

  return isEmptyImportTarget
      || segments.length === 2
      || importTargetName === 'index'
      || forbiddenRelativeImports.includes(importTargetName);
}

// console.log(shouldBeRelative('C:\\Users\\dm\\Desktop\\javascript\\src\\entities\\Article', 'entities/Article/fasfasfas'))
// console.log(shouldBeRelative('C:\\Users\\dm\\Desktop\\javascript\\src\\entities\\Article', 'entities/ASdasd/fasfasfas'))
// console.log(shouldBeRelative('C:\\Users\\dm\\Desktop\\javascript\\src\\entities\\Article', 'features/Article/fasfasfas'))
// console.log(shouldBeRelative('C:\\Users\\dm\\Desktop\\javascript\\src\\features\\Article', 'features/Article/fasfasfas'))
// console.log(shouldBeRelative('C:\\Users\\dm\\Desktop\\javascript\\src\\entities\\Article', 'app/index.tsx'))
// console.log(shouldBeRelative('C:/Users/dm/Desktop/javascript/src/entities/Article', 'entities/Article/asfasf/asfasf'))
// console.log(shouldBeRelative('C:\\Users\\dm\\Desktop\\javascript\\src\\entities\\Article', '../../model/selectors/getSidebarItems'))
