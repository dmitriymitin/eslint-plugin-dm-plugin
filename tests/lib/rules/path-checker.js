/**
 * @fileoverview feature sliced relative path checker
 * @author dm
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/path-checker"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {ecmaVersion: 6, sourceType: 'module'}
});
ruleTester.run("path-checker", rule, {
  valid: [
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from '../../model/slices/addCommentFormSlice'",
      errors: [],
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Article\\ui\\ArticleCard.tsx',
      code: "import { addCommentFormActions, addCommentFormReducer } from '../model/slices/addCommentFormSlice'",
      errors: [],
    },
  ],

  invalid: [
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/model/slices/addCommentFormSlice'",
      output: "import { addCommentFormActions, addCommentFormReducer } from './Article/model/slices/addCommentFormSlice'",
      errors: [{ message: "В рамках одного слайса все пути должны быть относительными"}],
      options: [
        {
          alias: '@'
        }
      ]
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from 'entities/Article/model/slices/addCommentFormSlice'",
      output: "import { addCommentFormActions, addCommentFormReducer } from './Article/model/slices/addCommentFormSlice'",
      errors: [{ message: "В рамках одного слайса все пути должны быть относительными"}],
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\src-tools\\production_project\\src\\entities\\Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from 'entities/Article/model/slices/addCommentFormSlice'",
      output: "import { addCommentFormActions, addCommentFormReducer } from './Article/model/slices/addCommentFormSlice'",
      errors: [{ message: "В рамках одного слайса все пути должны быть относительными"}],
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/model/slices/addCommentFormSlice'",
      output: null,
      errors: [{ message: "В рамках одного слайса все пути должны быть относительными"}],
      options: [
        {
          alias: '@',
          autoFix: false
        }
      ]
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Article\\ui\\ArticleCard.tsx',
      code: "import { articleReducer } from '@/entities/Article'",
      output: null,
      errors: [{ message: "В рамках одного слайса все пути должны быть относительными"}],
      options: [
        {
          alias: '@'
        }
      ]
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Article\\ui\\ArticleCard.tsx',
      code: "import { articleReducer } from '@/entities/Article/model/index'",
      output: null,
      errors: [{ message: "В рамках одного слайса все пути должны быть относительными"}],
      options: [
        {
          alias: '@'
        }
      ]
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Article\\ui\\ArticleCard.tsx',
      code: "import { articleReducer } from '@/entities/Article/testing'",
      output: null,
      errors: [{ message: "В рамках одного слайса все пути должны быть относительными"}],
      options: [
        {
          alias: '@',
          forbiddenRelativeImports: ['testing', 'mock']
        }
      ]
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Article\\ui\\ArticleCard.tsx',
      code: "import { articleReducer } from '..'",
      errors: [{ message: "Относительный импорт из public API запрещен, импортируйте напрямую из файла"}],
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Article\\ui\\ArticleCard.tsx',
      code: "import { articleReducer } from '../index'",
      errors: [{ message: "Относительный импорт из public API запрещен, импортируйте напрямую из файла"}],
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Profile\\ui\\ProfileCard.tsx',
      code: "import { articleReducer } from '../../Article/index'",
      errors: [{ message: "Относительный импорт из public API запрещен, импортируйте напрямую из файла"}],
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Profile\\ui\\ProfileCard.tsx',
      code: "import { articleReducer } from '../../Article'",
      errors: [{ message: "Относительный импорт из public API запрещен, импортируйте напрямую из файла"}],
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Article\\ui\\ArticleCard.tsx',
      code: "import { articleReducer } from '../testing'",
      errors: [{ message: "Относительный импорт из public API запрещен, импортируйте напрямую из файла"}],
      options: [
        {
          forbiddenRelativeImports: ['testing', 'mock']
        }
      ]
    },
    {
      filename: 'C:\\Users\\dm\\Desktop\\javascript\\production_project\\src\\entities\\Article\\ui\\ArticleCard.tsx',
      code: "import { articleReducer } from '../mock'",
      errors: [{ message: "Относительный импорт из public API запрещен, импортируйте напрямую из файла"}],
      options: [
        {
          forbiddenRelativeImports: ['testing', 'mock']
        }
      ]
    },
  ],
});
