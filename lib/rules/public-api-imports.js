const {isPathRelative, normalizePath, stripAlias} = require("../helpers");
const micromatch = require("micromatch");
const path = require("path");

const PUBLIC_ERROR = 'PUBLIC_ERROR';
const TESTING_PUBLIC_ERROR = 'TESTING_PUBLIC_ERROR';

module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "descr",
      category: "Fill me in",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: 'code', // Or `code` or `whitespace`
    messages: {
      [PUBLIC_ERROR]: 'Абсолютный импорт разрешен только из Public API (index.ts)',
      [TESTING_PUBLIC_ERROR]: 'Тестовые данные необходимо импортировать из publicApi/testing.ts',
    },
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string'
          },
          testFilesPatterns: {
            type: 'array'
          }
        }
      }
    ],
  },

  create(context) {
    const { alias = '', testFilesPatterns = [] } = context.options[0] ?? {};

    const checkingLayers = {
      'entities': 'entities',
      'features': 'features',
      'pages': 'pages',
      'widgets': 'widgets',
    }

    return {
      ImportDeclaration(node) {
        const value = node.source.value
        const importTo = stripAlias(value, alias);

        if(isPathRelative(importTo)) {
          return;
        }

        // [entities, article, model, types]
        const segments = importTo.split('/')
        const layer = segments[0];
        const slice = segments[1];

        if(!checkingLayers[layer]) {
          return;
        }

        const isImportNotFromPublicApi = segments.length > 2;
        // [entities, article, testing]
        const isShort = segments.length === 3;
        const isTestingPublicApi = isShort && segments[2] === 'testing';
        const isMockPublicApi = isShort && segments[2] === 'mock';

        if(isImportNotFromPublicApi && !isTestingPublicApi && !isMockPublicApi) {
          context.report({
            node,
            messageId: PUBLIC_ERROR,
            fix: (fixer) => {
              const publicApiPath = alias ? `${alias}/${layer}/${slice}` : `${layer}/${slice}`
              return fixer.replaceText(node.source, `'${publicApiPath}'`)
            }
          });
        }

        if (isTestingPublicApi) {
          const normalizedPath = normalizePath(path.toNamespacedPath(context.getFilename()));

          const validatePattern = (patterns, messageId) => {
            if (!patterns.some(p => micromatch.isMatch(normalizedPath, p))) {
              context.report({ node, messageId });
            }
          };

          validatePattern(testFilesPatterns, TESTING_PUBLIC_ERROR);
        }
      }
    };
  },
};
