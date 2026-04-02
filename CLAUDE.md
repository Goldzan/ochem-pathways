# OChem Pathways — Developer Guide

A single-page React + Vite app for building and studying organic chemistry reaction pathways. No backend — all data persists in localStorage via Zustand.

## Commands

```bash
npm run dev      # dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview production build
```

## Tech Stack

| Layer      | Library                                          |
|------------|--------------------------------------------------|
| Framework  | React 19 + Vite 8                                |
| Language   | TypeScript (strict)                              |
| Styling    | Tailwind CSS v4 (`@tailwindcss/vite` plugin)     |
| Graph      | Cytoscape.js + react-cytoscapejs + cytoscape-dagre |
| Animation  | Framer Motion                                    |
| State      | Zustand (with `persist` middleware)              |
| Icons      | @heroicons/react                                 |
| IDs        | uuid v4                                          |

## Design System

Design tokens are defined in `src/index.css` via `@theme {}`.

| Token                   | Value     | Usage                          |
|-------------------------|-----------|--------------------------------|
| `--color-bg`            | `#0f1117` | App background                 |
| `--color-surface`       | `#1a1d27` | Card/panel backgrounds         |
| `--color-surface-elevated` | `#22263a` | Modal backgrounds           |
| `--color-border`        | `#2e3348` | Borders, dividers              |
| `--color-text-primary`  | `#e8eaf6` | Primary text                   |
| `--color-text-secondary`| `#8b90a7` | Labels, metadata               |

Arrow colors (hardcoded in `graphStyles.ts` and Tailwind classes):
- Normal reaction arrows: `#4f8ef7` (blue)
- Mechanism arrows: `#a78bfa` (purple, dashed)
- Study mode indicator: amber (`text-amber-400`, `bg-amber-500/10`)
- Add/success: green (`text-green-400`)

Font: Inter (Google Fonts, loaded in `index.html`).

## Data Model

All types in `src/types/index.ts`.

**FunctionalGroup** — a node in the graph (e.g. "Alkene"). Fields: `id`, `name`, `formula`, `color`, `createdAt`.

**Reaction** — a directed edge between two groups. Fields: `id`, `sourceGroupId`, `targetGroupId`, `name`, `conditions`, `mechanism: MechanismStep[]`, `hasMechanism` (auto-derived), `createdAt`.

**MechanismStep** — one step in a reaction mechanism. Fields: `id`, `order`, `description`, `reagent?`, `curlyArrowNote?`.

Groups and reactions are stored as `Record<id, entity>` (flat maps, not arrays) for O(1) lookup when building graph edges.

`hasMechanism` is set on write (`mechanism.length > 0`) so Cytoscape style selectors can use `data(hasMechanism)` directly.

### localStorage

Key: `ochem-storage`. Shape: `{ state: { groups: Record<...>, reactions: Record<...> }, version: 1 }`.
If the data model changes in a breaking way, increment `version` in `src/store/index.ts` and add a `migrate` function.

Seed data is in `src/store/seedData.ts` and is loaded on first launch (before any localStorage key exists).

## File Structure

```
src/
├── types/index.ts            # All TypeScript interfaces
├── store/
│   ├── index.ts              # Zustand store + selector hooks
│   └── seedData.ts           # Default groups & reactions
├── views/
│   ├── ListView/             # List view components
│   │   ├── index.tsx
│   │   ├── GroupCard.tsx
│   │   ├── ReactionRow.tsx
│   │   ├── MechanismStepList.tsx
│   │   └── EmptyState.tsx
│   └── GraphView/            # Graph view components
│       ├── index.tsx
│       ├── CytoscapeGraph.tsx   # react-cytoscapejs wrapper
│       ├── graphStyles.ts       # buildGraphStyles(studyMode)
│       ├── graphTransform.ts    # store data → Cytoscape elements
│       ├── GraphControls.tsx
│       └── GraphLegend.tsx
├── modals/
│   ├── GroupModal.tsx
│   ├── ReactionModal.tsx
│   └── DeleteConfirmModal.tsx
├── panels/
│   └── DetailPanel.tsx       # Slide-in panel (graph view)
└── components/
    ├── TopBar.tsx
    ├── ViewToggle.tsx
    ├── StudyModeToggle.tsx
    └── shared/
        ├── Button.tsx        # variant: primary|secondary|danger|ghost
        ├── IconButton.tsx
        ├── Input.tsx
        ├── Textarea.tsx
        ├── Badge.tsx
        ├── Modal.tsx         # AnimatePresence modal shell
        └── ColorPicker.tsx
```

## Component Conventions

- One component per file. **Named exports only** (no default exports for components — `App.tsx` is the exception).
- Props interfaces in the same file, named `<ComponentName>Props`.
- Custom hooks in `src/hooks/` (if adding new ones), prefixed `use`.
- Keep components under ~150 lines; extract sub-components if longer.
- No `any` type except for Cytoscape stylesheet (its types are broken upstream).
- Event handlers named `handleXxx`, defined inside the component body (not inline JSX arrow functions).

## Code Style

- Use Tailwind classes. Only use inline `style` for dynamic values (e.g. node `color` from store data).
- Zustand: always destructure only what you need (`useStore((s) => s.foo)`) to prevent unnecessary re-renders.
- Cytoscape: **never mutate** the elements array. Always pass a new array. Memoize with `useMemo`.
- Framer Motion: use the `layout` prop on list items for smooth reorder; use `AnimatePresence` for mount/unmount transitions.
- `buildGraphStyles(studyMode)` is the single place that controls graph visual appearance — do not add Cytoscape inline styles elsewhere.

## Graph View — Key Notes

- `graphTransform.ts` → the **only** place store data is mapped to Cytoscape element format.
- `graphStyles.ts` → exports `buildGraphStyles(studyMode: boolean)` which returns the full Cytoscape stylesheet. Study mode hides edge labels by setting `label: ''`.
- Mechanism edges: identified by `data.hasMechanism === true`. Styled with `line-style: dashed`, purple color.
- After adding/removing nodes, call `cy.layout(LAYOUT_CONFIG).run()` to refit (already handled by the `useEffect` in `CytoscapeGraph.tsx`).
- Double-click on a node → opens GroupModal for editing. Double-click on an edge → opens ReactionModal.
- `cytoscape-dagre` layout: `rankDir: 'TB'` (top-to-bottom), mirrors textbook pathway diagrams.

## Study Mode

Toggled by `StudyModeToggle` in TopBar. Keyboard shortcut: `S`.

When enabled:
- `ReactionRow` hides reaction conditions (AnimatePresence fade out).
- `buildGraphStyles(true)` sets edge labels to empty strings and reduces opacity.
- `MechanismStepList` shows placeholder pulses instead of step text.
- `DetailPanel` shows "Conditions hidden" placeholder.
- A yellow banner appears below the TopBar.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `S` | Toggle study mode |
| `G` | Switch to graph view |
| `L` | Switch to list view |
| `Escape` | Close panels/modals |

## How to Add Features

### New field on FunctionalGroup
1. Add to `FunctionalGroup` in `src/types/index.ts`
2. Update `addGroup` / `updateGroup` in `src/store/index.ts`
3. Update `GroupModal.tsx` form
4. Update `graphTransform.ts` if it should appear in graph data
5. Update `src/store/seedData.ts`

### New field on Reaction
Same pattern but for `Reaction` and `ReactionModal.tsx`.

### New graph layout
Install the cytoscape layout plugin + register it with `cytoscape.use(plugin)` in `CytoscapeGraph.tsx`. Add a toggle to `GraphControls.tsx`.

### New view
1. Create `src/views/NewView/index.tsx`
2. Add the view name to `ActiveView` union in `src/types/index.ts`
3. Add tab to `ViewToggle.tsx`
4. Add conditional render in `App.tsx`
5. Add keyboard shortcut in the `useEffect` in `App.tsx`

## Seed Data

`src/store/seedData.ts` ships 6 functional groups and 7 reactions covering a basic pathway (Alkene → Alcohol → Aldehyde → Carboxylic Acid, with branches to Alkyl Halide and Ester). Several reactions include full mechanism steps. Modify this file to change the default content users see on first load.
