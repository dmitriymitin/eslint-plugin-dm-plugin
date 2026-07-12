# eslint-plugin-dm-plugin

ESLint-плагин для проектов на Feature-Sliced Design

Плагин помогает держать импорты в порядке:

- слои импортируют только разрешенные нижележащие слои
- слайсы импортируются через public API
- импорты внутри одного слайса должны быть относительными
- относительные импорты не должны идти через public API слайса

## Установка

```sh
npm install eslint-plugin-dm-plugin --save-dev
```

Также в проекте должен быть установлен ESLint:

```sh
npm install eslint --save-dev
```

## Использование

Добавь `dm-plugin` в ESLint config:

```json
{
  "plugins": ["dm-plugin"],
  "rules": {
    "dm-plugin/layer-imports": "error",
    "dm-plugin/public-api-imports": "error",
    "dm-plugin/path-checker": "error"
  }
}
```

Если в проекте используется alias для `src`, передай его в правила:

```json
{
  "rules": {
    "dm-plugin/layer-imports": [
      "error",
      {
        "alias": "@"
      }
    ],
    "dm-plugin/public-api-imports": [
      "error",
      {
        "alias": "@",
        "testFilesPatterns": ["**/*.test.ts", "**/*.test.tsx"]
      }
    ],
    "dm-plugin/path-checker": [
      "error",
      {
        "alias": "@"
      }
    ]
  }
}
```

## Правила

### `dm-plugin/layer-imports`

Запрещает неправильные импорты между FSD-слоями

Разрешенные импорты:

- `app` может импортировать из `pages`, `widgets`, `features`, `entities`, `shared`
- `pages` может импортировать из `widgets`, `features`, `entities`, `shared`
- `widgets` может импортировать из `features`, `entities`, `shared`
- `features` может импортировать из `entities`, `shared`
- `entities` может импортировать из `entities`, `shared`
- `shared` может импортировать только из `shared`

Пример неправильного импорта:

```ts
// src/entities/Article/ui/Article.tsx
import { login } from '@/features/Auth'
```

Можно игнорировать отдельные импорты:

```json
{
  "dm-plugin/layer-imports": [
    "error",
    {
      "alias": "@",
      "ignoreImportPatterns": ["**/StoreProvider"]
    }
  ]
}
```

### `dm-plugin/public-api-imports`

Запрещает глубокие абсолютные импорты внутрь слайса

Слайс должен импортироваться через public API

Неправильно:

```ts
import { articleReducer } from '@/entities/Article/model/slice'
```

Правильно:

```ts
import { articleReducer } from '@/entities/Article'
```

Правило также поддерживает testing public API:

```ts
import { ArticleMock } from '@/entities/Article/testing'
```

Такие импорты разрешены только в файлах, которые подходят под `testFilesPatterns`

### `dm-plugin/path-checker`

Требует относительные импорты внутри одного слайса

Также запрещает относительные импорты из public API слайса

Это помогает избежать циклических зависимостей, когда файл внутри слайса импортирует index этого же или соседнего слайса

Неправильно:

```ts
// src/entities/Article/ui/ArticleCard.tsx
import { articleReducer } from '@/entities/Article/model/slice'
```

Правильно:

```ts
// src/entities/Article/ui/ArticleCard.tsx
import { articleReducer } from '../model/slice'
```

Неправильно:

```ts
// src/entities/Article/ui/ArticleCard.tsx
import { articleReducer } from '..'
```

Неправильно:

```ts
// src/entities/Profile/ui/ProfileCard.tsx
import { articleReducer } from '../../Article'
```
