# SYSTEM MEMORY: ADVISETECH PRODUCTION CHASSIS CONTEXT

## 1. ARCHITECTURAL CORE & LIFECYCLES

- **Engine:** Vite + React SPA driven by strict TypeScript compilation.
- **Routing:** TanStack Router (`@tanstack/react-router`) using a file-system routing paradigm in `src/routes/`, automatically compiling down into `src/routeTree.gen.ts`.
- **Global State Matrix:** Redux Toolkit (`src/store/`) acting as the primary transactional layer for real-time background data synchronization, replacing localized context frameworks.
- **Database / Backend:** Firebase Web SDK (v10+) utilizing Firestore real-time listener streams and Firebase Auth.

## 2. PROJECT DIRECTORY ARCHITECTURE MAP

Maintain strict conformity to this workspace hierarchy. Never introduce arbitrary folders:

- `src/components/ui/` — Atomic UI primitives generated via Shadcn (Buttons, Tables, Forms, Input-OTP, Dialogs).
- `src/components/` — Hybrid layout shells (`MobileShell.tsx`, `BottomNav.tsx`, `AppHeader.tsx`, `Logo.tsx`).
- `src/context/` — Legacy authentication contexts (to be entirely deprecated/migrated to Redux).
- `src/firebase/` — Core initialization point for the Firebase instance database connections.
- `src/hooks/` — Mobile detection and viewport tracking custom hooks (`use-mobile.tsx`).
- `src/lib/` — Shared structural data processing modules (`formatters.ts`, `utils.ts`, `mock.ts`).
- `src/pages/` — Standalone authentication screens (`Login.tsx`, `Signup.tsx`).
- `src/routes/` — Functional view panels bound to TanStack navigation trees:
  - `__root.tsx` — Root shell entry configuration
  - `index.tsx` — Gateway page / entry router redirect
  - `dashboard.tsx` — Management metrics operational dashboard
  - `tickets.index.tsx` — Core ticket management datatable queue
  - `tickets.$id.tsx` — Conversational, dynamic single-ticket workspace
  - `analytics.tsx` — Performance tracking charts interface
  - `chat.tsx` — Real-time messaging hub
  - `notifications.tsx`, `onboarding.tsx`, `profile.tsx`, `otp.tsx`, `forgot-password.tsx`, `reset-password.tsx` — Supporting feature workflows.
- `src/services/` — Decoupled data fetch layers (`authService.ts`).
- `src/store/` — Redux slices handling application logic state (`authSlice.ts`).

## 3. MULTI-PLATFORM RESPONSIVE RULES (FLUTTER WEBVIEW WRAPPER)

The front-end client is actively wrapped inside an embedded mobile Flutter WebView container.

- **Viewport Adjustments:** Desktop layouts (>= 1280px) display multi-panel dashboard grids and the default sidebar. Mobile views automatically strip away complex sidebars and deploy `src/components/MobileShell.tsx` with a bottom-navigation bar.
- **Layout Constraints:** Every custom interaction component or sliding drawer must use fluid layout boundaries (`w-full max-w-md mx-auto`) to guarantee elements never warp or shift unexpectedly when rendering within the Flutter WebView context window.
- **Hardware Integration Readiness:** Leave explicit interfaces open for potential JavaScript-to-Native bridge synchronization (`window.FlutterWebView?.postMessage`).

## 4. STRICT CODING ENFORCEMENTS & SYSTEM STANDARDS

- **No Incomplete Snippets:** When generating or modifying any code artifact, output the complete file from end to end. Placeholders or shorthand markers such as `// rest of code remains unchanged` are strictly forbidden.
- **Type Rigor:** The use of loose `any` types is banned. Every network response, data model mapping, component prop, and asynchronous return must be explicitly typed via TypeScript interfaces or types.
- **Design Consistency:** Hardcoded color spaces or inline hex strings are blacklisted. Always pull values dynamically via Tailwind CSS semantic design tokens (`bg-background`, `text-foreground`, `bg-primary`, `text-destructive`).
