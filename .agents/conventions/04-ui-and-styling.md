# UI & Styling (Tailwind & HeroUI Native)

- **Utility Classes:** Use `className` with TailwindCSS utilities for styling.
- **Component Library:** Rely on `heroui-native` components (e.g., `Button`, `Tabs`, `Input`, `Text`) rather than building raw React Native elements where possible.
- **Icons:** Use `lucide-react-native` for icons.
- **Bottom Sheets:** Use `@gorhom/bottom-sheet` for modal sheets.
- **File Structure & Routing:** Keep screen components (`app/.../index.tsx`) focused on composing smaller sub-components. Extract complex UI blocks into local components within the same file or `src/Components`.
