const {isPathRelative, normalizePath, stripAlias} = require("../helpers");
const micromatch = require("micromatch");
const path = require("path");

const PUBLIC_ERROR = 'PUBLIC_ERROR';
const LIMITED_PUBLIC_API_ERROR = 'LIMITED_PUBLIC_API_ERROR';

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
      [LIMITED_PUBLIC_API_ERROR]: 'Этот public API разрешен только в специальных файлах',
    },
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
          publicApiImports: {
            type: 'array',
            items: {
              anyOf: [
                {
                  type: 'string'
                },
                {
                  type: 'object',
                  additionalProperties: {
                    type: 'object',
                    properties: {
                      filePatterns: {
                        type: 'array',
                        items: {
                          type: 'string'
                        }
                      }
                    },
                    required: ['filePatterns'],
                    additionalProperties: false
                  }
                }
              ]
            }
          }
        }
      }
    ],
  },

  create(context) {
    const {
      alias = '',
      autoFix = true,
      publicApiImports = [],
    } = context.options[0] ?? {};

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
        // [entities, article, publicApiSegment]
        const isShort = segments.length === 3;
        const publicApiSegment = segments[2];
        const publicApiConfig = getPublicApiConfig(publicApiImports, publicApiSegment);
        const isAllowedPublicApiImport = isShort && Boolean(publicApiConfig);
        const isEntityCrossImport = layer === 'entities' && publicApiSegment === '@x' && segments.length === 4;

        if(isImportNotFromPublicApi && !isAllowedPublicApiImport && !isEntityCrossImport) {
          const report = {
            node,
            messageId: PUBLIC_ERROR,
          };

          if(autoFix) {
            report.fix = (fixer) => {
              const publicApiPath = alias ? `${alias}/${layer}/${slice}` : `${layer}/${slice}`
              return fixer.replaceText(node.source, `'${publicApiPath}'`)
            }
          }

          context.report(report);
        }

        if (isAllowedPublicApiImport && publicApiConfig.filePatterns) {
          const normalizedPath = normalizePath(path.toNamespacedPath(context.getFilename()));

          if (!publicApiConfig.filePatterns.some(p => micromatch.isMatch(normalizedPath, p))) {
            context.report({node, messageId: LIMITED_PUBLIC_API_ERROR});
          }
        }
      }
    };
  },
};

function getPublicApiConfig(publicApiImports, segment) {
  const publicApiImport = publicApiImports.find(item => {
    if (typeof item === 'string') {
      return item === segment;
    }

    return item && Object.prototype.hasOwnProperty.call(item, segment);
  });

  if (typeof publicApiImport === 'string') {
    return {};
  }

  return publicApiImport?.[segment];
}
