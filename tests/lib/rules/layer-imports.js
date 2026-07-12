const rule = require("../../../lib/rules/layer-imports"),
    RuleTester = require("eslint").RuleTester;

const aliasOptions = [
  {
    alias: '@'
  }
]

const layerImportError = "Слой может импортировать в себя только нижележащие слои (shared, entities, features, widgets, pages, app)";
const entityCrossImportError = "Сущности могут импортировать другие сущности только через @x public API";

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 6, sourceType: 'module' },
});
ruleTester.run("layer-imports", rule, {
  valid: [
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\features\\Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/shared/Button.tsx'",
      errors: [],
      options: aliasOptions,
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\features\\Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article'",
      errors: [],
      options: aliasOptions,
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\app\\providers',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/widgets/Articl'",
      errors: [],
      options: aliasOptions,
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\widgets\\pages',
      code: "import { useLocation } from 'react-router-dom'",
      errors: [],
      options: aliasOptions,
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\app\\providers',
      code: "import { addCommentFormActions, addCommentFormReducer } from 'redux'",
      errors: [],
      options: aliasOptions,
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from 'some-package/@/features/Article'",
      errors: [],
      options: aliasOptions,
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Article\\model\\types.ts',
      code: "import { User } from '@/entities/User/@x/Article'",
      errors: [],
      options: aliasOptions,
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\index.tsx',
      code: "import { StoreProvider } from '@/app/providers/StoreProvider';",
      errors: [],
      options: aliasOptions,
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Article.tsx',
      code: "import { StateSchema } from '@/app/providers/StoreProvider'",
      errors: [],
      options: [
        {
          alias: '@',
          ignoreImportPatterns: ['**/StoreProvider']
        }
      ],
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Article.tsx',
      code: "import { StateSchema } from '@/app/providers/StoreProvider'",
      errors: [],
      options: [
        {
          alias: '@',
          ignoreImportPatterns: ['**/StoreProvider']
        }
      ],
    },
  ],

  invalid: [
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\providers',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/features/Articl'",
      errors: [{ message: layerImportError}],
      options: aliasOptions,
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\src-tools\\production_project\\src\\entities\\providers',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/features/Articl'",
      errors: [{ message: layerImportError}],
      options: aliasOptions,
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\features\\providers',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/widgets/Articl'",
      errors: [{ message: layerImportError}],
      options: aliasOptions,
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\providers',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/widgets/Articl'",
      errors: [{ message: layerImportError}],
      options: aliasOptions,
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Article\\model\\types.ts',
      code: "import { User } from '@/entities/User'",
      errors: [{ message: entityCrossImportError}],
      options: aliasOptions,
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Article\\model\\types.ts',
      code: "import { User } from '@/entities/User/@x/Profile'",
      errors: [{ message: entityCrossImportError}],
      options: aliasOptions,
    },
  ],
});
