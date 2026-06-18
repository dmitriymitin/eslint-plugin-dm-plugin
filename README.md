# eslint-plugin-dm-plugin

plugin for production project

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-dm-plugin`:

```sh
npm install eslint-plugin-dm-plugin --save-dev
```

## Usage

Add `dm-plugin` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "dm-plugin"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "dm-plugin/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here


