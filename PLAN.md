# Transaction List UI — Improvement Plan

## Issues to Fix

### 1. Bottom padding between list and tab bar
**File:** `src/Containers/Transactions/TransactionsList.tsx`

- Add `contentContainerStyle={{ paddingBottom: tabBarHeight }}` to `AnimatedFlashList`
- Get the tab bar height using `useBottomTabBarHeight()` from `@react-navigation/bottom-tabs`
- Pass it down or call directly inside `TransactionsList`

---

### 2. Active button press state (blue highlight)
**Files:** `src/Components/ui/Button.tsx`, `src/Components/MonthYearPicker.tsx`

**Root cause:** `ghost` and `outline` variants in `Button.tsx` use `active:bg-accent`. The `accent` token resolves to a blue/indigo from heroui-native defaults.

**Changes:**
- In `Button.tsx`: change both `ghost` and `outline` variants from `active:bg-accent` → `active:bg-zinc-100 dark:active:bg-zinc-800` (neutral grey, dark-mode-aware)
- In `MonthYearPicker.tsx`: change hardcoded `color="black"` on all `ChevronLeft`/`ChevronRight` icons to a theme-aware value (using a CSS variable or passing the foreground color)

---

### 3. Define a proper light/dark theme
**File:** `global.css`

**Current state:** `global.css` has no custom CSS variable definitions — all colors come from `heroui-native/styles` defaults. The app detects `colorScheme` but never applies custom overrides.

**Change:** Add `@layer base` blocks for `:root` (light) and `.dark` (dark) with semantic CSS variable overrides:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --card: 0 0% 98%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --accent: 210 40% 94%;          /* neutral grey — NOT blue */
    --accent-foreground: 222 47% 11%;
    --border: 214 32% 91%;
    --primary: 221 83% 53%;         /* slate-blue for primary actions only */
    --primary-foreground: 0 0% 100%;
  }
  .dark {
    --background: 222 47% 7%;
    --foreground: 210 40% 98%;
    --card: 222 47% 10%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --accent: 217 33% 17%;
    --accent-foreground: 210 40% 98%;
    --border: 217 33% 17%;
    --primary: 221 83% 53%;
    --primary-foreground: 0 0% 100%;
  }
}
```

---

### 4. Replace Modal with @gorhom/bottom-sheet
**File:** `src/Components/MonthYearPicker.tsx`

**Current problem:** `Modal` with `animationType="slide"` causes the `bg-black/50` backdrop to appear as a visible grey flash/pulse during open and close.

**Change:**
- Replace React Native `Modal` with `BottomSheet` + `BottomSheetBackdrop` from `@gorhom/bottom-sheet` (already installed)
- Use a `ref` to call `bottomSheetRef.current?.expand()` / `.close()`
- Result: native spring animation, swipe-to-dismiss gesture, clean animated backdrop — no grey flash

---

## Bonus Fixes (also included)

| # | Change | File |
|---|--------|------|
| A | Fix hardcoded `bg-[#f2f2f2]` → `bg-card` on transaction row (dark mode broken) | `Components/Transaction.tsx` |
| B | Fix FAB hardcoded `bg-blue-100` / `color="#2563eb"` → theme tokens | `app/(tabs)/transactions/index.tsx` |

---

## Out of Scope (not implementing)
- Slide transition animation when changing months (complex, separate task)
- Pull-to-refresh (separate task)
- Income/expense summary strip (separate task)
