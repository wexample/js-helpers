## Architecture

### Two directories, one rule each

Everything lives under src, split in two:

- src/Helper — one file per domain, exporting free functions and frozen constant maps. `String.ts`, `Dom.ts`, `Array.ts`, `Url.ts`, `Reconnect.ts`, `NodeFs.ts`… twenty-seven of them.
- src/Common — the classes: `AsyncConstructor.ts` and `RetryBackoffScheduler.ts`, each a `export default abstract class` / `export default class`.

The split is by shape, not by subject. A behaviour that needs no instance state is a function in `Helper`; a behaviour that carries state across calls — a pending `setTimeout`, a ready flag, a callback list — becomes a class in `Common`. `Reconnect.ts` and `RetryBackoffScheduler.ts` are the same feature seen from both sides: the helper computes delays and hands back a closure-based controller, the class wraps that controller with a timer it can `cancel()`.

### Function names carry their file

There is no `index.ts` and no barrel file. What replaces it is a naming convention: every export is prefixed by its module's domain, lowercased.

```ts
export function stringToKebabCase(value: string): string
export function domFindScrollParent(element: HTMLElement, includeHidden = false): HTMLElement
export function nodeFsListFilesRecursively(rootPath: string, ignoredDirectoryNames: string[] = ['.git', 'node_modules']): string[]
export function reconnectBackoffCreateController(options: ReconnectBackoffOptions = {}): ReconnectBackoffController
```

Read a call site and you know which file to open. A new function goes in the file whose prefix it would take, or takes a new file if no prefix fits. Four older exports predate the rule and keep bare names — `waitForTransitionEnd`, `waitForAnimationEnd`, `waitForElementSize`, `buildUniqueId`, plus `expandHeight` / `collapseHeight` in `Height.ts`.

Files also carry a `export default` alias where one function is clearly the main one: `String.ts` ends on `export default stringToKebab;`, `Variables.ts` on `export default VARIABLES;`.

### The path a call takes

There is no runtime indirection at all. package.json maps subpaths straight onto source files:

```json
"exports": {
  "./*": {
    "types": "./src/*.ts",
    "default": "./src/*.ts"
  }
}
```

So `import { stringToKebabCase } from '@wexample/js-helpers/Helper/String'` resolves to src/Helper/String.ts and stops there. The consumer's bundler compiles the TypeScript; `"files": ["src"]` means the published tarball contains sources and nothing else. A caller importing `Helper/String` never loads `Helper/Dom`, which is what lets browser-only and Node-only modules coexist in one package.

The consequence for anyone editing: a change to a file's name or path is a breaking change to the public API, since the file path *is* the import specifier.

### Module dependencies are almost nil

Four internal imports exist in the whole tree:

- `Helper/Reconnect.ts` → `Helper/Time.ts` for `timeSleep`
- `Helper/Height.ts` → `Helper/Transition.ts` for `waitForTransitionEnd`
- `Common/AsyncConstructor.ts` → `Helper/Function.ts` for `functionIsType`
- `Common/RetryBackoffScheduler.ts` → `Helper/Reconnect.ts` for the backoff controller

External runtime dependencies: none. `node:fs` and `node:path` are the only imports outside the package, in `NodeFs.ts`, `NodePath.ts` and `NodeEnv.ts`. Keeping the graph this flat is deliberate — it is what makes `"sideEffects": false` and per-file imports actually pay off.

Import specifiers are extensionless (`from './Time'`), which works because `tsconfig.json` sets `"moduleResolution": "bundler"`. One file, `Common/AsyncConstructor.ts`, writes `from '../Helper/Function.js'` instead; both resolve, the extensionless form is the majority.

### Three runtime environments in one tree

Nothing enforces the boundary but the file name, so it has to be respected by hand:

- Browser-only, touching `document`, `window`, `HTMLElement`, `ResizeObserver`: `Dom`, `Location`, `Height`, `Transition`, `Animation`, `ElementSize`, `Pointer`, `Event`, `KeyCode`.
- Node-only, prefixed `node*`: `NodeFs`, `NodePath`, `NodeEnv`.
- Neutral, usable anywhere: `String`, `Array`, `Object`, `Url`, `Time`, `Bytes`, `Serialize`, `Function`, `Id`, `Queue`, `Reconnect`, `Mixin`.

A neutral module must not gain a DOM or `node:` reference; that is the one invariant that a new export can silently break, since `tsc` sees both lib sets.

### Options objects, callbacks, no globals

Stateful code takes a single options object with defaults resolved in one place, and reports progress through optional callbacks rather than events. `Queue` is the reference shape:

```ts
export type QueueOptions<TItem, TResult = unknown> = QueueCallbacks<TItem, TResult> & {
  worker: QueueWorker<TItem, TResult>;
  concurrency?: number;
  autoStart?: boolean;
};
```

`Reconnect` does the same with `reconnectBackoffResolveOptions()`, which merges over `DEFAULT_RECONNECT_BACKOFF_OPTIONS` and throws on invalid input (`factor must be >= 1.`), so every other function in the file can accept a partial `ReconnectBackoffOptions` and resolve it itself. Injectable seams follow the same idea: `random: () => number` in the backoff options exists so jitter can be made deterministic.

No module holds mutable module-level state. The only exported `const` are literal maps declared `as const` — `EVENT`, `KEY_CODE`, `DOM_ATTRIBUTE`, `COLORS`, `VARIABLES` — each paired with a derived type: `export type EventName = (typeof EVENT)[keyof typeof EVENT];`.

### Checking and publishing

`npm run build`, `npm run typecheck` and `npm run lint` all run `tsc --noEmit`. There is no test suite and no emitted artifact: type-checking is the whole verification step, under `"strict": true`. Publication is `npm publish --access public` from `.github/workflows/publish.yml`, triggered on `v*` tags, and `prepublishOnly` runs the build first.

tsup.config.ts configures a dual ESM/CJS bundle with `dts: true` into `dist/`, and `tsup` is a devDependency — but no script invokes it, and `dist/` is not in `files`. The shipped package is the source tree; treat the tsup config as an unused alternative path, not as the build.
