---
name: zod
description: Zod schema validation. Use when validating data, creating type-safe schemas, or integrating with Drizzle schemas in CoinX.
---

# Zod

Schema validation for CoinX.

## Basic Schemas

```typescript
import { z } from "zod";

// Primitives
const stringSchema = z.string();
const numberSchema = z.number();
const boolSchema = z.boolean();
const dateSchema = z.date();

// With constraints
const email = z.string().email();
const age = z.number().min(0).max(120);
const name = z.string().min(1).max(100);
const url = z.string().url();
```

## Object Schemas

```typescript
const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().optional(),
  role: z.enum(["admin", "user"]),
});

// Infer TypeScript type
type User = z.infer<typeof userSchema>;
```

## Validation

```typescript
// Parse (throws on error)
const user = userSchema.parse(data);

// Safe parse (returns result object)
const result = userSchema.safeParse(data);
if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error.issues);
}
```

## Optional & Nullable

```typescript
const schema = z.object({
  required: z.string(),
  optional: z.string().optional(),      // string | undefined
  nullable: z.string().nullable(),      // string | null
  nullish: z.string().nullish(),        // string | null | undefined
  withDefault: z.string().default(""),  // defaults to ""
});
```

## Arrays & Records

```typescript
// Array
const tags = z.array(z.string());
const items = z.array(userSchema);

// Non-empty array
const nonEmpty = z.array(z.string()).nonempty();

// Record (object with dynamic keys)
const scores = z.record(z.string(), z.number());
// { [key: string]: number }
```

## Enums

```typescript
// Zod enum
const status = z.enum(["pending", "synced"]);
type Status = z.infer<typeof status>; // "pending" | "synced"

// Native enum
enum Role { Admin = "admin", User = "user" }
const roleSchema = z.nativeEnum(Role);
```

## Unions & Discriminated Unions

```typescript
// Union
const stringOrNumber = z.union([z.string(), z.number()]);

// Discriminated union
const event = z.discriminatedUnion("type", [
  z.object({ type: z.literal("click"), x: z.number(), y: z.number() }),
  z.object({ type: z.literal("scroll"), offset: z.number() }),
]);
```

## Transformations

```typescript
// Transform value
const trimmed = z.string().transform((s) => s.trim());

// Coerce types
const coercedNumber = z.coerce.number(); // "42" -> 42
const coercedDate = z.coerce.date();     // string -> Date
```

## Drizzle Integration

```typescript
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { items } from "@/db/schema";

// Auto-generate schemas from Drizzle table
export const selectItemSchema = createSelectSchema(items);
export const insertItemSchema = createInsertSchema(items);

// Extend with custom validation
const customInsertSchema = insertItemSchema.extend({
  name: z.string().min(1, "Name required").max(100),
});
```

## Form Validation Pattern

```typescript
const formSchema = z.object({
  amount: z.coerce.number().positive("Must be positive"),
  category: z.string().min(1, "Select a category"),
  date: z.coerce.date(),
});

const validateForm = (data: unknown) => {
  const result = formSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return { valid: false, errors };
  }
  return { valid: true, data: result.data };
};
```

## Error Messages

```typescript
const schema = z.object({
  name: z.string({ required_error: "Name is required" })
    .min(1, { message: "Name cannot be empty" }),
  age: z.number({ invalid_type_error: "Age must be a number" })
    .positive({ message: "Age must be positive" }),
});
```
