# `@mdz/wolpi-types`

Type declarations for writing Wolpi JavaScript extensions.

This package provides:
- Wolpi hook signatures and data model types
- declarations for the global `wolpi` object and GraalJS `Java` interop
- typings for `wolpi:fs` and `wolpi:fetch`
- opaque host object types used by the core API (`VImage`, `ByteBuffer`, `HttpClient`, `Arena`, etc.)

The exported type names match the Java types used in Wolpi itself.


## Install

Add the package as a development dependency:

```sh
npm install --save-dev @mdz/wolpi-types
```

## Enable the declarations

This package is for type checking and editor support only. At runtime, Wolpi provides the `wolpi`
and `Java` globals plus the built-in `wolpi:fs` and `wolpi:fetch` modules. Do not import runtime
values from `@mdz/wolpi-types`; use type-only imports or JSDoc references.

The simplest setup is to load the declarations through `compilerOptions.types`:

```json
{
	"compilerOptions": {
		"types": ["@mdz/wolpi-types"]
	}
}
```

For JavaScript projects, also enable `checkJs`:

```json
{
	"compilerOptions": {
		"allowJs": true,
		"checkJs": true,
		"noEmit": true,
		"types": ["@mdz/wolpi-types"]
	},
	"include": ["./**/*.js"]
}
```

## Typing the extension object

TypeScript:

```ts
import type { WolpiExtension } from '@mdz/wolpi-types';

const extension: WolpiExtension = {
};

export default extension;
```

JavaScript:

```js
// @ts-check

/** @type {import('@mdz/wolpi-types').WolpiExtension} */
const extension = {
    // ... your extension that will be type-checked against the WolpiExtension interface
};

export default extension;
```
