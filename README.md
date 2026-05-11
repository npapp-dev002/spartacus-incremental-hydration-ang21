# Spartacus Incremental Hydration — Angular 21 Demo

A working reference application demonstrating Angular incremental hydration in a Spartacus Classic (NgModule-based) storefront. Built with Angular 21.1 and Spartacus 221121.10.

## What is Incremental Hydration?

Incremental hydration is an Angular feature (stable since Angular v20, `@publicApi`) that defers the hydration of `@defer` blocks until a trigger fires — for example, when a component scrolls into the viewport or the user clicks on the page. The JavaScript chunk for the deferred component is only downloaded when the trigger fires, reducing initial page load.

Angular's `@defer` documentation states: *"Non-standalone dependencies cannot be deferred and are still eagerly loaded, even if they are inside of `@defer` blocks."* ([source](https://angular.dev/guide/templates/defer)) This is the key limitation for Spartacus apps — JS deferral only applies to fully standalone custom components.

For more information, see the [Angular Incremental Hydration Guide](https://angular.dev/guide/incremental-hydration).

---

## Setup

### Prerequisites

- Node.js 20+
- A running SAP Commerce Cloud backend (OCC API). The `baseUrl` in `src/app/spartacus/spartacus-configuration.module.ts` points to `https://40.76.109.9:9002`.

### How Incremental Hydration is Enabled

In `src/app/app.config.ts`:

```typescript
provideClientHydration(withEventReplay(), withNoHttpTransferCache(), withIncrementalHydration())
```

In `src/server.ts`, two settings are required for local SSR to work:

```typescript
// Allow CommonEngine to serve requests from localhost
ngExpressEngine({ bootstrap, allowedHosts: ['localhost'] })

// Extend timeout for remote backend
NgExpressEngineDecorator.get(engine, { timeout: 60000, ... })
```

- `allowedHosts: ['localhost']` — required because `CommonEngine` blocks requests from `localhost` by default
- `timeout: 60000` — the default 3s timeout is too short for a remote backend

### Running with SSR

```bash
# Build
ng build

# Start SSR server
NODE_TLS_REJECT_UNAUTHORIZED=0 node dist/my-spartacus-app/server/server.mjs
```

`NODE_TLS_REJECT_UNAUTHORIZED=0` is needed because the backend uses a self-signed TLS certificate.

### Running without SSR (CSR only)

```bash
ng serve
```

> **Note:** Incremental hydration requires SSR to produce the dehydrated HTML with `<!--ngh=d0-->` markers. In CSR mode the `@defer` blocks load normally without the hydration behaviour.

---

## Test Scenarios

The three test scenarios are rendered below the main `<cx-storefront>` in `app.component.html`, placed off-screen so viewport triggers fire naturally on scroll.

---

### Scenario 1 — Pure Custom Standalone Component ✅ Separate JS chunk

**Trigger:** `hydrate on viewport`

**Component:** `CustomWidgetComponent` (`src/app/custom-widget/custom-widget.component.ts`) — `standalone: true`, imports only `CommonModule`, zero Spartacus dependencies.

**What happens:**
- SSR renders the component content into the HTML with a dehydration marker (`<!--ngh=d0-->`)
- The component's JavaScript is compiled into its own separate chunk
- On initial page load, **that chunk is not downloaded**
- When the user scrolls the component into the viewport, the chunk downloads and the component becomes interactive — the click counter works and `hydrated()` becomes `true`

**Result: separate JS chunk confirmed.** The chunk appears as a dynamic import in the browser network tab and loads only on scroll.

---

### Scenario 2 — Custom Standalone Wrapping a Spartacus NgModule Component ✅ Separate JS chunk for the wrapper

**Trigger:** `hydrate on interaction`

**Component:** `CustomWithSpartacusComponent` (`src/app/custom-with-spartacus/custom-with-spartacus.component.ts`) — `standalone: true`, but imports `SearchBoxModule` from `@spartacus/storefront`.

**What happens:**
- The wrapper component (`CustomWithSpartacusComponent`) gets its own separate JS chunk
- `SearchBoxModule` is already imported by `SpartacusFeaturesModule` inside `AppModule`, so the SearchBox code is part of the eagerly loaded bundle — it is **not** deferred
- The wrapper chunk downloads on the first user interaction with the page
- Hydration triggers correctly and the component becomes interactive

**Result: separate JS chunk for the wrapper confirmed.** There is no JS deferral benefit for the Spartacus NgModule code it wraps — that code was already eagerly loaded — but the wrapper component itself is deferred.

---

### Scenario 3 — Spartacus OOTB Component Directly in `@defer` Block ⚠️ No JS deferral

**Trigger:** `hydrate on idle`

**Component:** `<cx-storefront>` used directly inside a `@defer` block.

**What happens:**
- `StorefrontComponent` is NgModule-based and already eagerly loaded via `SpartacusFeaturesModule`
- Angular's `@defer` documentation states non-standalone dependencies are eagerly loaded regardless of `@defer` placement
- No separate JS chunk is created; the code is part of the main bundle
- The `hydrate on idle` trigger fires, but there is no JS loading benefit

**Result: no separate JS chunk.**

---

## Summary

| Scenario | Component type | Separate JS chunk | Hydration trigger works |
|---|---|---|---|
| 1 — Pure custom standalone | `standalone: true`, no Spartacus imports | ✅ Yes | ✅ Yes |
| 2 — Custom standalone + Spartacus NgModule | `standalone: true` wrapper, NgModule dependency | ✅ Yes (wrapper only) | ✅ Yes |
| 3 — Spartacus OOTB in `@defer` | NgModule-based | ❌ No | ✅ Yes (no JS benefit) |

**Bottom line:** Incremental hydration gives real JS deferral today for fully custom standalone components with no NgModule dependencies. For any component that imports a Spartacus NgModule, the NgModule code is already in the eager bundle — the hydration trigger still works correctly, but there is no JS loading benefit for that Spartacus code.

---

## Development Commands

```bash
# Start development server (CSR)
ng serve

# Build
ng build

# Run unit tests
ng test

# Generate a component
ng generate component component-name
```

For more information on Angular CLI, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
