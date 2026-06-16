# Learning Notes — Events App

---

## Derived State

### The core idea

- You have a **source of truth** (`events`, `userEvents`, `filter`)
- You want a **view** of that data (e.g. filtered list)
- The view is always **computed** from the source — never stored separately
- When the source changes → the view updates automatically on next render

**Source → derive → render. Never store what you can compute.**

### Why not store derived values in state

- State only updates when you explicitly call the setter
- If two related pieces of state get out of sync → stale UI bugs
- Example: filter is set to "Attending", user RSVPs a new event → filtered state doesn't update until someone calls `setFilteredEvents` again

### The pattern

```ts
// DON'T — two sources of truth, must be kept in sync manually
const [filteredEvents, setFilteredEvents] = useState(events);

// DO — one source, computed fresh every render
const filteredEvents =
  filter === "all"
    ? events
    : events.filter((event) =>
        userEvents.find(
          (ue) => ue.eventId === event.id && ue.status === filter,
        ),
      );
```

### Rule

If a value can be computed from existing state → derive it as a `const`, don't store it.
Only use `useState` for values that can't be derived (user input, server responses, toggle flags).

### useMemo dependency rule

`useMemo` is a cached calculation. It is not live magic.

React asks:

```txt
Can I reuse the previous answer, or do I need to calculate a new answer?
```

The dependency array answers that question:

```txt
Recalculate when one of these inputs changes.
```

Rule:

```txt
Anything from outside the useMemo callback that can change and is used inside
the calculation belongs in the dependency array.
```

In this app:

```ts
const filteredEvents = useMemo(() => {
  if (filter === "all") return events;

  return events.filter((event) =>
    userEvents.find(
      (userEvent) =>
        userEvent.eventId === event.id && userEvent.status === filter,
    ),
  );
}, [filter, events, userEvents]);
```

The calculation reads three outside values:

- `filter` → which view should be shown?
- `events` → what events currently exist?
- `userEvents` → what RSVP statuses currently exist?

So all three are dependencies.

### Why `[filter]` alone is wrong

If the dependency array is only:

```ts
[filter];
```

then React only recalculates when the filter changes.

That means:

1. Filter is currently `"all"`.
2. Admin creates a new event.
3. `events` changes.
4. `filter` does not change.
5. React may reuse the old cached `filteredEvents`.
6. The newly created event may not appear immediately.

The bug is not that `filter` is a string. The bug is that `events` was used
inside the calculation but left out of the dependency array.

### Do not make `filter` an object just to force recalculation

This is the wrong mental model:

```ts
const [filter, setFilter] = useState({ value: "all" });
```

Changing `filter` into an object makes state more complicated, but it does not
fix the real issue.

The real issue is:

```txt
filteredEvents depends on events, so events belongs in the dependency array.
```

Keep the state simple:

```ts
const [filter, setFilter] = useState("all");
```

Then list the true inputs:

```ts
[filter, events, userEvents];
```

### Local values inside useMemo are not dependencies

Values created inside the callback do not go in the dependency array:

```ts
const filteredEvents = useMemo(() => {
  const isAll = filter === "all";

  if (isAll) return events;

  return events.filter((event) =>
    userEvents.find((userEvent) => userEvent.eventId === event.id),
  );
}, [filter, events, userEvents]);
```

`isAll` is created inside the callback, so it is not a dependency.

But `filter`, `events`, and `userEvents` come from outside the callback, so they
are dependencies.

### Good phrase to remember

```txt
Deps are not the triggers I prefer.
Deps are the inputs my calculation depends on.
```

---

## React State

### Where state lives

- State lives at the **lowest common ancestor** of everyone who reads or writes it.
- If two siblings both need a value → lift it to their parent.
- Parent owns the state + handlers. Children receive values (props) and callbacks (functions).

### The light-bulb mental model

```
Room (parent)     → owns the on/off state
Switch (child A)  → calls onToggle() to signal the room
LightBulb (child B) → reads isOn from props and displays it
```

Siblings can't talk directly. They communicate through the parent.

### map vs filter

- `filter` → **removes** items, returns a shorter array → use for **delete**
- `map` → **transforms** items, same length → use for **edit/update**

```ts
// Delete
setEvents((prev) => prev.filter((e) => e.id !== id));

// Edit
setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
```

---

## Immutability

### The rule

**Never modify existing state/objects. Always create new ones.**

```ts
// WRONG — mutates, React won't re-render
state.title = "New Title";
arr.push(newItem);

// RIGHT — new references, React re-renders
setState({ ...state, title: "New Title" });
setState((prev) => [...prev, newItem]);
```

### Why React needs this

- React detects changes by comparing **references** (memory addresses), not contents.
- Mutate → same reference → React thinks nothing changed → UI stays stale.
- New object → new reference → React sees the change → re-renders.

**One rule to remember: copy, don't modify.**

---

## Common Mistakes

### 1. Discarding a map result

```ts
// WRONG — map creates a new array but the result is thrown away
if (exists) {
  prev.map((item) => (item.id === id ? { ...item, status } : item));
  return prev; // returns the OLD array, nothing changed
}

// RIGHT — return the mapped result
if (exists) {
  return prev.map((item) => (item.id === id ? { ...item, status } : item));
}
```

### 2. Mutating a function argument

```ts
// WRONG — mutates the object passed in
const handleCreate = (data: Omit<Event, "id">) => {
  data.id = "123"; // mutation + TS error (id not on Omit<Event,"id">)
  setEvents((prev) => [...prev, data]);
};

// RIGHT — build a new object
const handleCreate = (data: Omit<Event, "id">) => {
  setEvents((prev) => [...prev, { ...data, id: crypto.randomUUID() }]);
};
```

### 3. Uninitialized array state

```ts
// WRONG — undefined, [...prev] will crash
const [items, setItems] = useState<Item[]>();

// RIGHT — always initialize arrays as []
const [items, setItems] = useState<Item[]>([]);
```

### 4. Props object vs first argument

```tsx
// WRONG — names the entire props bag `event`, types it as Event
const EditEventForm = (event: Event) => { ... };

// RIGHT — destructure named props from the one props object React passes
const EditEventForm = ({ event, onEdit }: EditEventProps) => { ... };
```

---

## Callbacks & Function Props

### How callbacks work

A callback is a function you pass to another function to be called later.
The receiver decides when and with what arguments to call it.

```ts
function greet(name: string, callback: (msg: string) => void) {
  callback(`Hello ${name}`); // greet decides when to call it
}
greet("Chakit", (msg) => console.log(msg));
```

### onX vs handleX naming convention

- `onDelete` = the **prop name** (the event slot on the child component)
- `handleDelete` = the **function** (the implementation in the parent)

```tsx
// Parent — owns the logic
const handleDelete = (id) =>
  setEvents((prev) => prev.filter((e) => e.id !== id));
<EventCard onDelete={handleDelete} />;

// Child — receives and calls it
const EventCard = ({ onDelete }) => (
  <Trash onClick={() => onDelete(event.id)} />
);
```

### React Hook Form — handleSubmit pattern

`handleSubmit(onSubmit)` is a higher-order function:

1. You pass your handler (`onSubmit`) as a callback.
2. RHF returns a new function that React stores as the submit handler.
3. On submit → React fires it with the event → RHF validates → calls your `onSubmit(data)`.

```ts
// Mock implementation
function handleSubmit(userCallback) {
  return (event) => {
    event.preventDefault();
    const data = collectAndValidateFields();
    if (isValid(data)) userCallback(data);
  };
}
```

### useCallback dependency rule

If a callback reads a value from the current render scope, that value belongs in the dependency array.

```ts
const handleDeleteEvent = useCallback(
  (id: string) => {
    deleteEvent(id);
    removeRSVPsForEvent(id);
  },
  [deleteEvent, removeRSVPsForEvent],
);
```

Even if `deleteEvent` and `removeRSVPsForEvent` only call stable state setters internally, they are still values that `handleDeleteEvent` closes over.

Three cases:

```txt
No useCallback
  Safe and simple.
  Creates a new function each render.
  Can make React.memo less useful.

useCallback with correct deps
  Safe.
  Keeps the function stable when deps are stable.
  More code, so only use when stability matters.

useCallback with missing deps
  Risky.
  Can close over stale values from an older render.
  Avoid this even if it happens to work today.
```

Rule of thumb: use `useCallback` when the function is passed to a memoized child, used as another hook's dependency, or you have seen unnecessary renders. Otherwise, a normal function is usually fine.

---

## Children, Wrapper Props, and cloneElement

### Children are props

This:

```tsx
<Box message="hello">
  <Button />
</Box>
```

is basically this:

```tsx
<Box message="hello" children={<Button />} />
```

So `Box` receives:

```ts
{
  message: "hello",
  children: <Button />
}
```

But `Button` does **not** automatically receive `message`.

```tsx
function Box({ message, children }) {
  return <div>{children}</div>;
}

function Button({ message }) {
  return <button>{message}</button>;
}
```

In this example:

```txt
Box gets message ✅
Box gets Button as children ✅
Button gets message ❌
```

### Props do not flow through children automatically

This:

```tsx
<Box message="hello">
  <Button />
</Box>
```

does not mean:

```txt
Pass message to Box and Button.
```

It means:

```txt
Pass message to Box.
Pass Button as Box's children.
```

If `Button` needs `message`, `Box` must explicitly give it.

### When Box creates Button directly

This is simple:

```tsx
function Box({ message }) {
  return <Button message={message} />;
}
```

Here `Box` owns the JSX, so it can pass props normally.

### When Button comes through children

If `Button` is passed into `Box` as `children`, then `Box` did not create it directly:

```tsx
<Box message="hello">
  <Button />
</Box>
```

So `Box` needs to enhance the child:

```tsx
function Box({ message, children }) {
  const childWithMessage = React.cloneElement(children, {
    message,
  });

  return <div>{childWithMessage}</div>;
}
```

That turns:

```tsx
<Button />
```

into:

```tsx
<Button message="hello" />
```

### Multiple children

If there may be more than one child, use `React.Children.map`:

```tsx
type InjectedProps = {
  message?: string;
};

function Box({
  message,
  children,
}: {
  message: string;
  children: React.ReactNode;
}) {
  const childrenWithMessage = React.Children.map(children, (child) => {
    if (!React.isValidElement<InjectedProps>(child)) {
      return child;
    }

    return React.cloneElement(child, {
      message,
    });
  });

  return <div>{childrenWithMessage}</div>;
}
```

### Mental model

```txt
Wrapper owns a value/callback
Children need that value/callback
Children do not get wrapper props automatically
Wrapper must pass or inject the prop
```

Normal prop passing:

```tsx
<Button message={message} />
```

Injecting into children:

```tsx
React.cloneElement(child, { message });
```

Use `cloneElement` only when a wrapper receives children from outside and needs to add props to those children.

---

## TypeScript Compilation and `tsconfig.json`

### The compiler's job

`tsc` is the TypeScript compiler. It checks your `.ts` and `.tsx` files, removes
TypeScript-only syntax, and produces JavaScript when emitting is enabled.

```ts
// main.ts
const username: string = "Alex";
console.log(username);
```

```js
// main.js
const username = "Alex";
console.log(username);
```

In Vite apps, TypeScript often type-checks while Vite/esbuild handles the actual
browser bundle.

### `tsconfig.json` is the compiler instruction file

The compiler reads `tsconfig.json` to understand which files belong to the
project and which rules/options to use.

```jsonc
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "strict": true
  },
  "include": ["src"]
}
```

### `files`, `include`, and `exclude`

These decide which source files are part of the TypeScript program.

```jsonc
{
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["src/**/*.test.ts", "node_modules"]
}
```

Important detail: if an included file imports an excluded file, TypeScript can
still pull that imported file into the program.

```ts
// src/main.ts
import "./debug-only";
```

### `target`

`target` controls the JavaScript version TypeScript outputs or checks against.
Modern targets keep modern syntax; older targets downlevel some syntax.

```jsonc
{
  "compilerOptions": {
    "target": "ES5"
  }
}
```

```ts
const greet = (name: string) => `Hello, ${name}`;
```

```js
var greet = function (name) {
  return "Hello, " + name;
};
```

### TypeScript does not add polyfills

TypeScript can transform syntax, but it does not automatically add runtime
features like `Promise`, `Map`, or `Array.prototype.includes` for old browsers.

```ts
const result = [1, 2, 3].includes(2);
```

If the runtime does not support `includes`, you need a polyfill or a different
target/runtime strategy.

### `module`

`module` controls the import/export format in the output or the format expected
by the bundler/runtime.

```jsonc
{
  "compilerOptions": {
    "module": "CommonJS"
  }
}
```

```ts
import { add } from "./math";
```

```js
const math_1 = require("./math");
```

For Vite/frontend code, `"module": "esnext"` is common because the bundler wants
to see native `import`/`export` syntax.

### `outDir` and `rootDir`

`outDir` decides where emitted JavaScript goes. `rootDir` decides the source
folder used to preserve output structure.

```jsonc
{
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  }
}
```

```txt
src/app.ts -> dist/app.js
```

Without `rootDir`, output paths may preserve more of the original folder tree
than expected.

### `noEmit`

`noEmit` means TypeScript checks types but does not write JavaScript files.
This is common when a tool like Vite, Next.js, or esbuild handles bundling.

```jsonc
{
  "compilerOptions": {
    "noEmit": true
  }
}
```

### `declaration`

`declaration` creates `.d.ts` files. These are useful when publishing a library
because consumers get types without needing the original TypeScript source.

```jsonc
{
  "compilerOptions": {
    "declaration": true
  }
}
```

```txt
dist/index.js
dist/index.d.ts
```

### `sourceMap`

`sourceMap` creates `.map` files so debugger tools can point back to the
original TypeScript instead of only showing generated JavaScript.

```jsonc
{
  "compilerOptions": {
    "sourceMap": true
  }
}
```

```txt
app.js
app.js.map
```

### `allowJs` and `checkJs`

`allowJs` lets JavaScript files join a TypeScript project. `checkJs` asks
TypeScript to type-check those JavaScript files too.

```jsonc
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true
  }
}
```

```js
let age = 20;
age = "twenty"; // TypeScript can report this with checkJs enabled.
```

### `strict`

`strict` enables stronger type-checking rules and catches more bugs early.

```jsonc
{
  "compilerOptions": {
    "strict": true
  }
}
```

```ts
function greet(name) {
  return name.toUpperCase();
}
```

With `strict` on, `name` is an error because it has an implicit `any` type.

### `baseUrl` and `paths`

These options create cleaner import aliases for TypeScript.

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"]
    }
  }
}
```

```ts
import { EventCard } from "@components/EventCard";
```

Important detail: TypeScript understands the alias for type-checking, but the
runtime or bundler must also be configured to resolve the same alias.

## TypeScript Utilities

### Omit — remove fields from a type

```ts
type EventFormInputs = Omit<Event, "id">;
// Event without `id` → { title, description, location, date, time }
```

### Pick — keep only certain fields

```ts
type Coords = Pick<Event, "date" | "time">;
```

### Runtime omit — destructure + rest

```ts
const { id, ...rest } = event; // rest = event without id
```

---

## Git

### When to commit

- One logical unit of work is done and the code is in a working state.
- Small focused commits > one giant commit.
- Rule: if you can explain the change in one sentence, it's ready.

### When to push

- To back up work remotely.
- Before switching machines.
- When others need to review your code (PR).

### Useful commands

```bash
git show              # last commit — message + full diff
git show --stat       # last commit — files changed only
git diff              # uncommitted changes
git diff HEAD~1 HEAD  # compare last two commits
git log --oneline     # compact commit history
git difftool HEAD~1 HEAD  # open diff in VS Code (if configured)
```

---

## CSS / Tailwind

### Why min-h-screen

- Sets a floor: element is **at least** the viewport height.
- Content shorter → still fills screen. Content taller → grows past it (no clipping).
- Different from `h-screen` which locks to exactly viewport height and clips overflow.

### items-start shrinks children

- `flex-col` + `items-start` makes children only as wide as their content.
- Add `w-full` to a child row to make it span the full container width.

### Arbitrary values

```tsx
className = "min-w-[320px] max-w-[600px]";
```

### Typescript compilation

#### tsconfig.json

- This file basically has two most important things
  - "files"
    - This defines which files to compile exactly.
    - All files must be mentioned in a relative path relative to where the tsconfig.json is present as typescript compiler considers the root of the project to be where tsconfig.json is present.
    - It only compiles those files which are present in the files array.
    - "include" and "exclude" keys can also be mentioned in the tsconfig.json file which specify which files to include and exclude during the compilation process.
  - "compilerOptions"

#### declaration

- `declaration: true` tells TypeScript to generate `.d.ts` files along with the compiled JavaScript.
- `.js` files are the real code that runs.
- `.d.ts` files are only type information for TypeScript.
- If TypeScript can directly see the original `.ts` source file, it can understand the types from that source file.
- But published npm packages usually ship compiled JavaScript, not the original TypeScript source as the main runtime entry.
- That is why packages often publish both:

```txt
dist/index.js
dist/index.d.ts
```

- Example source TypeScript:

```ts
export function greet(name: string): string {
  return `Hello, ${name}`;
}
```

- Published JavaScript:

```js
export function greet(name) {
  return `Hello, ${name}`;
}
```

- Published declaration file:

```ts
export declare function greet(name: string): string;
```

- When another file imports it:

```ts
import { greet } from "my-lib";
```

- TypeScript uses the `.d.ts` file to know:

```txt
greet accepts a string and returns a string
```

- Runtime JavaScript uses the `.js` file to actually run the function.
- The import line is not replaced with the whole function code. It just gives the current file access to the exported function.

#### @types packages

- `@types` packages are just declaration files for JavaScript packages.
- They usually contain `.d.ts` files.
- They do not add runtime JavaScript behavior.
- They only help TypeScript understand a JavaScript package.

- Example with lodash:

```bash
npm install lodash
```

- This installs the real JavaScript code:

```txt
node_modules/lodash/debounce.js
```

- But TypeScript may still say:

```txt
Could not find a declaration file for module 'lodash/debounce'
```

- Then install the types:

```bash
npm install -D @types/lodash
```

- This installs declaration files:

```txt
node_modules/@types/lodash/...
```

- Simple mental model:

```txt
lodash        -> actual JavaScript code that runs
@types/lodash -> .d.ts files that TypeScript reads
```

- Example:

```ts
import debounce from "lodash/debounce";

const sayHello = () => {
  console.log("Hello");
};

debounce(sayHello, 300);
debounce("not a function", 300);
```

- With `@types/lodash`, TypeScript knows `debounce` expects a function.
- So it can catch:

```txt
Argument of type 'string' is not assignable to parameter of type '(...args: any) => any'.
```

#### real package example: typescript

- The real `typescript` npm package is a good example.
- Its `package.json` contains entries like:

```json
{
  "main": "./lib/typescript.js",
  "typings": "./lib/typescript.d.ts"
}
```

- Meaning:

```txt
./lib/typescript.js    -> actual JavaScript used at runtime
./lib/typescript.d.ts  -> type information used by TypeScript
```

- So even the TypeScript package itself is published as runnable JavaScript plus declaration files.

#### sourceMap

- `sourceMap: true` tells TypeScript/build tools to generate `.js.map` files.
- `.js` files are the real code that runs.
- `.js.map` files help the browser/debugger map generated JavaScript back to the original TypeScript source.
- Example output:

```txt
app.js
app.js.map
```

- Simple mental model:

```txt
.ts file      -> code we wrote
.js file      -> code the browser/Node runs
.js.map file  -> debugging map between generated JS and original TS
```

- In development, source maps are useful because an error can point to the original file:

```txt
src/components/SourceMapDemo.tsx:4
```

- Without source maps, production errors often point to bundled/minified JavaScript:

```txt
assets/index-BvBZ5oe3.js:1:48291
```

- This is why source maps are useful for debugging, especially with tools like Sentry or Datadog.

#### source maps security example: Claude Code

- Source maps can become risky if they are accidentally published publicly.
- A reported Claude Code incident happened because a `.map` file was included in a published npm package.
- The runtime only needed the JavaScript file:

```txt
cli.js
```

- But the package also exposed a source map:

```txt
cli.js.map
```

- Source maps can include or point to original source files:

```json
{
  "sources": ["src/main.ts", "src/tools/bash.ts"],
  "sourcesContent": ["original TypeScript source code can be here"]
}
```

- The dangerous part is `sourcesContent`.
- It can contain the original TypeScript code as text.
- That can reveal:
  - project structure
  - internal function names
  - business logic
  - comments
  - feature flags
  - security checks
  - accidentally committed secrets, if any exist in source

- Important distinction:

```txt
.d.ts   -> exposes public type contracts
.js.map -> can expose original source code used for debugging
```

- Practical production rule:

```txt
Development source maps are useful.
Public production source maps should be intentional.
For private/proprietary code, upload source maps privately to an error tool instead of publishing them publicly.
```
