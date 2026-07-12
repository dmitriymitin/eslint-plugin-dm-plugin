/**
 * @fileoverview descr
 * @author dn
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/public-api-imports"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {ecmaVersion: 6, sourceType: 'module'}
});

const aliasOptions = [
  {
    alias: '@'
  }
]

const publicApiOptions = [
  {
    alias: '@',
    publicApiImports: [
      'mock',
      {
        testing: {
          filePatterns: ['**/*.test.ts', '**/*.test.ts', '**/StoreDecorator.tsx']
        }
      }
    ]
  }
]

const storybookPublicApiOptions = [
  {
    alias: '@',
    publicApiImports: ['storybook']
  }
]

ruleTester.run("public-api-imports", rule, {
  valid: [
    {
      code: "import { addCommentFormActions, addCommentFormReducer } from '../../model/slices/addCommentFormSlice'",
      errors: [],
    },
    {
      code: "import { addCommentFormActions, addCommentFormReducer } from 'some-package/@/entities/Article/model/file.ts'",
      errors: [],
      options: aliasOptions,
    },
    {
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article'",
      errors: [],
      options: aliasOptions,
    },
    {
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/mock'",
      errors: [],
      options: publicApiOptions,
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\file.test.ts',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/testing'",
      errors: [],
      options: publicApiOptions,
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\StoreDecorator.tsx',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/testing'",
      errors: [],
      options: publicApiOptions,
    },
    {
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/storybook'",
      errors: [],
      options: storybookPublicApiOptions,
    },
    {
      code: "import { User } from '@/entities/User/@x/Article'",
      errors: [],
      options: aliasOptions,
    }
  ],

  invalid: [
    {
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/model/file.ts'",
      output: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article'",
      errors: [{ message: "Абсолютный импорт разрешен только из Public API (index.ts)"}],
      options: aliasOptions,
    },
    {
      code: "import { addCommentFormActions, addCommentFormReducer } from 'entities/Article/model/file.ts'",
      output: "import { addCommentFormActions, addCommentFormReducer } from 'entities/Article'",
      errors: [{ message: "Абсолютный импорт разрешен только из Public API (index.ts)"}],
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\StoreDecorator.tsx',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/testing/file.tsx'",
      output: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article'",
      errors: [{message: 'Абсолютный импорт разрешен только из Public API (index.ts)'}],
      options: publicApiOptions,
    },
    {
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/mock'",
      output: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article'",
      errors: [{message: 'Абсолютный импорт разрешен только из Public API (index.ts)'}],
      options: aliasOptions,
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\forbidden.ts',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/testing'",
      errors: [{message: 'Этот public API разрешен только в специальных файлах'}],
      options: publicApiOptions,
    }
  ],
});
