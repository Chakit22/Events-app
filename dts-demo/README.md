# d.ts Demo

This tiny project shows what `.d.ts` files do.

`my-lib/index.js` is real JavaScript code:

```js
exports.greet = function greet(name) {
  const trimmedName = name.trim();
  const upperName = trimmedName.toUpperCase();
  const message = "Hello, " + upperName;

  return message;
};
```

`my-lib/index.d.ts` is the TypeScript declaration file:

```ts
export function greet(name: string): string;
```

The declaration file tells TypeScript:

> `greet` accepts a `string` and returns a `string`.

## Run It

From this folder:

```bash
npm install
npm run check
```

You should see this error:

```txt
consumer/app.ts(4,7): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
```

That happens because `consumer/app.ts` has this line:

```ts
greet(123);
```

The JavaScript file exists, but the `.d.ts` file lets TypeScript catch the wrong usage before runtime.

## Now Remove The d.ts File

Rename the declaration file:

```bash
mv my-lib/index.d.ts my-lib/index.d.ts.hidden
npm run check
```

Now TypeScript should say it cannot find declaration types for `../my-lib`.

Run loose checking:

```bash
npm run check:loose
```

This passes because TypeScript no longer knows the shape of `greet`, so it treats it like `any`.

But the actual JavaScript still fails at runtime:

```bash
npm run runtime:bad
```

You should see:

```txt
TypeError: name.toUpperCase is not a function
```

Restore the declaration file:

```bash
mv my-lib/index.d.ts.hidden my-lib/index.d.ts
```

## Core Idea

`.js` file = the code that runs.

`.d.ts` file = the type contract TypeScript uses before the code runs.
