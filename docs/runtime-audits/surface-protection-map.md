# GEORGE Surface Protection Map

## CRITICAL SURFACES

### 1. GEORGE Core Runtime
File:
- app/george/page.tsx

Protected behaviors:
- sidebar open/close
- message hydration
- session restore
- live routing
- continuity restore
- runtime intro injection
- typewriter state
- overlay stack order
- pointer events
- scroll locking

DO NOT:
- clear state globally
- inject duplicate message resets
- mutate overlay ownership blindly

---

### 2. LIVE Runtime
Protected behaviors:
- isolated activation
- no GEORGE flash
- intro injection
- room-prep behavior
- manual_live initialization

DO NOT:
- share runtime overlay state with GEORGE
- mutate sidebar ownership

---

### 3. Signal Surface
File:
- app/signal/page.tsx

Protected behaviors:
- standalone surface
- no legacy header shell
- clean submission reset
- mobile spacing

---

### 4. Help Surface
File:
- app/help/page.tsx

Protected behaviors:
- lightweight standalone route
- visible return path
- no shell contamination

