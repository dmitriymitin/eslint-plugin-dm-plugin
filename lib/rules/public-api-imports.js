const {isPathRelative} = require("../helpers");
const micromatch = require("micromatch");
const path = require("path");

const PUBLIC_ERROR = 'PUBLIC_ERROR';
const TESTING_PUBLIC_ERROR = 'TESTING_PUBLIC_ERROR';
const MOCK_PUBLIC_ERROR = 'MOCK_PUBLIC_ERROR';

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
      [MOCK_PUBLIC_ERROR]: 'Моковые данные необходимо импортировать из publicApi/mock.ts',
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
    const { alias = '', testFilesPatterns = [], mockFilesPatterns = [] } = context.options[0] ?? {};

    const checkingLayers = {
      'entities': 'entities',
      'features': 'features',
      'pages': 'pages',
      'widgets': 'widgets',
    }

    return {
      ImportDeclaration(node) {
        const value = node.source.value
        const importTo = alias ? value.replace(`${alias}/`, '') : value;

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
        // [entities, article, testing, mock]
        const isShort = segments.length === 3;
        const isTestingPublicApi = isShort && segments[2] === 'testing';
        const isMockPublicApi = isShort && segments[2] === 'mock';

        if(isImportNotFromPublicApi && !isTestingPublicApi && !isMockPublicApi) {
          context.report({
            node,
            messageId: PUBLIC_ERROR,
            fix: (fixer) => {
              return fixer.replaceText(node.source, `'${alias}/${layer}/${slice}'`)
            }
          });
        }

        if (isTestingPublicApi || isMockPublicApi) {
          const normalizedPath = path.toNamespacedPath(context.getFilename()).replace(/[\\]+/g, '/');

          const validatePattern = (patterns, messageId) => {
            if (!patterns.some(p => micromatch.isMatch(normalizedPath, p))) {
              context.report({ node, messageId });
            }
          };

          if (isTestingPublicApi) validatePattern(testFilesPatterns, TESTING_PUBLIC_ERROR);
          if (isMockPublicApi) validatePattern(mockFilesPatterns, MOCK_PUBLIC_ERROR);
        }
      }
    };
  },
};
