# State Management (Legend State)

- **Observable Models:** Global state is encapsulated in model classes (e.g., `TransactionModel`). Use `observable` from `@legendapp/state` for reactive state.
- **Get vs. Peek:** Use `.get()` inside observer components to subscribe to changes. Use `.peek()` in functions/callbacks where you only need to read the value without tracking.
- **Component Wrapping:** Wrap components that consume observable state with `observer(...)` from `@legendapp/state/react` to ensure fine-grained re-rendering.
- **Lifecycle Hooks:** Use `useMount` and `useUnmount` for model initialization and cleanup within components.
