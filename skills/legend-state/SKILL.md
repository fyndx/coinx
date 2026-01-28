---
name: legend-state
description: Legend State for reactive state management in React Native. Use when creating models, observables, computed values, or reactive components in CoinX.
---

# Legend State

Reactive state management for CoinX.

## Model Pattern

```typescript
import { observable, computed, type ObservableObject } from "@legendapp/state";
import { observer } from "@legendapp/state/react";

interface ItemState {
  name: string;
  amount: number;
  isLoading: boolean;
}

export class ItemModel {
  obs: ObservableObject<ItemState>;

  constructor() {
    this.obs = observable<ItemState>({
      name: "",
      amount: 0,
      isLoading: false,
    });
  }

  // Computed values
  formattedAmount = computed(() => {
    return `$${this.obs.amount.get().toFixed(2)}`;
  });

  // Actions
  setName = (name: string) => {
    this.obs.name.set(name);
  };

  loadData = async () => {
    this.obs.isLoading.set(true);
    try {
      const data = await fetchData();
      this.obs.set(data);
    } finally {
      this.obs.isLoading.set(false);
    }
  };
}
```

## Observable Operations

### Get/Set

```typescript
// Get current value (reactive)
const name = obs.name.get();

// Get without tracking (non-reactive)
const name = obs.name.peek();

// Set value
obs.name.set("New Name");

// Set with callback
obs.amount.set((prev) => prev + 10);
```

### Nested Access

```typescript
const obs = observable({
  user: { name: "John", settings: { theme: "dark" } }
});

// Direct access
obs.user.settings.theme.set("light");

// Get nested value
const theme = obs.user.settings.theme.get();
```

### Arrays

```typescript
const list = observable<Item[]>([]);

// Add item
list.push(newItem);

// Filter (returns new array, doesn't mutate)
const filtered = list.get().filter(item => item.active);

// Set filtered result
list.set(filtered);
```

## Observer Components

```typescript
import { observer, useMount } from "@legendapp/state/react";

const ItemView = observer(({ model }: { model: ItemModel }) => {
  // Automatically re-renders when observables change
  const name = model.obs.name.get();
  const amount = model.formattedAmount.get();

  useMount(() => {
    model.loadData();
    return () => model.cleanup?.();
  });

  return <Text>{name}: {amount}</Text>;
});
```

## Listeners

```typescript
class ItemModel {
  listeners: ObservableListenerDispose[] = [];

  onMount = () => {
    const listener = this.obs.name.onChange(({ value }) => {
      console.log("Name changed:", value);
    });
    this.listeners.push(listener);
  };

  onUnmount = () => {
    while (this.listeners.length > 0) {
      const dispose = this.listeners.pop();
      dispose?.();
    }
  };
}
```

## Draft Pattern

For form states with optional IDs:

```typescript
interface ItemDraft {
  id?: string;  // Optional for new items
  name: string;
  amount: number;
}

class ItemFormModel {
  draft = observable<ItemDraft>({
    name: "",
    amount: 0,
  });

  save = async () => {
    const data = this.draft.peek();
    if (data.id) {
      await updateItem(data);
    } else {
      await createItem(data);
    }
  };

  reset = () => {
    this.draft.set({ name: "", amount: 0 });
  };
}
```

## Root Store Pattern

```typescript
// src/LegendState/index.ts
class RootStore {
  itemModel = new ItemModel();
  categoryModel = new CategoryModel();
  
  actions = {
    startServices: async () => {
      await Promise.all([
        this.itemModel.loadData(),
        this.categoryModel.loadData(),
      ]);
    },
  };
}

export const rootStore = new RootStore();
```

## Tips

- Use `peek()` in event handlers to avoid extra re-renders
- Use `get()` in render for reactivity
- Clean up listeners in `onUnmount`
- Keep models as classes for encapsulation
- Export singleton instances from root store
