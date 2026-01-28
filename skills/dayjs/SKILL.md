---
name: dayjs
description: Day.js for date manipulation. Use when working with dates, formatting, parsing, or date calculations in CoinX.
---

# Day.js

Lightweight date library for CoinX.

## Basic Usage

```typescript
import dayjs from "dayjs";

// Current time
const now = dayjs();

// From date
const date = dayjs(new Date());

// From string
const parsed = dayjs("2024-01-15");
const fromFormat = dayjs("15-01-2024", "DD-MM-YYYY");

// From timestamp
const fromTs = dayjs(1705276800000);
```

## Formatting

```typescript
dayjs().format("YYYY-MM-DD");        // 2024-01-15
dayjs().format("DD MMM YYYY");       // 15 Jan 2024
dayjs().format("h:mm A");            // 2:30 PM
dayjs().format("DD MMMM YYYY");      // 15 January 2024
dayjs().format("D MMM");             // 15 Jan
dayjs().format("MMM YY");            // Jan 24
```

## Parsing

```typescript
// ISO string
dayjs("2024-01-15T14:30:00.000Z");

// Custom format
dayjs("15-01-2024", "DD-MM-YYYY");

// Multiple formats
dayjs("Jan 15, 2024", ["MMM D, YYYY", "YYYY-MM-DD"]);
```

## Manipulation

```typescript
// Add
dayjs().add(1, "day");
dayjs().add(2, "week");
dayjs().add(1, "month");
dayjs().add(1, "year");

// Subtract
dayjs().subtract(1, "day");
dayjs().subtract(30, "minute");

// Start/End of
dayjs().startOf("day");     // 00:00:00
dayjs().startOf("week");    // Start of week
dayjs().startOf("month");   // First day of month
dayjs().startOf("year");    // Jan 1

dayjs().endOf("day");       // 23:59:59
dayjs().endOf("month");     // Last day of month
```

## Comparison

```typescript
const date1 = dayjs("2024-01-15");
const date2 = dayjs("2024-01-20");

date1.isBefore(date2);           // true
date1.isAfter(date2);            // false
date1.isSame(date2);             // false
date1.isSame(date2, "month");    // true (same month)

// Between (with plugin)
date1.isBetween("2024-01-01", "2024-01-31");
```

## Getters

```typescript
const d = dayjs("2024-01-15");

d.year();        // 2024
d.month();       // 0 (January, 0-indexed)
d.date();        // 15
d.day();         // 1 (Monday, 0 = Sunday)
d.hour();        // 0
d.minute();      // 0
d.second();      // 0

d.daysInMonth(); // 31
```

## Relative Time (Plugin)

```typescript
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

dayjs().from(dayjs("2024-01-01"));     // "14 days ago"
dayjs().fromNow();                      // "a few seconds ago"
dayjs("2024-02-01").toNow();           // "in 17 days"
```

## IsToday/IsYesterday (Plugin)

```typescript
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import isTomorrow from "dayjs/plugin/isTomorrow";

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isTomorrow);

dayjs().isToday();                     // true
dayjs().subtract(1, "day").isYesterday(); // true
dayjs().add(1, "day").isTomorrow();    // true
```

## Localization

```typescript
import "dayjs/locale/de";

dayjs.locale("de");
dayjs().format("MMMM");  // "Januar"

// Per-instance
dayjs().locale("fr").format("MMMM");
```

## CoinX Pattern

```typescript
// Transaction date display
const formatTransactionDate = (date: string) => {
  const d = dayjs(date, "DD-MM-YYYY");
  
  if (d.isToday()) return "Today";
  if (d.isYesterday()) return "Yesterday";
  if (d.isTomorrow()) return "Tomorrow";
  
  return d.format("DD MMMM YYYY");
};

// Duration range
const getDateRange = (type: "week" | "month" | "year") => ({
  startTime: dayjs().startOf(type).format(),
  endTime: dayjs().endOf(type).format(),
});
```

## ISO Strings for DB

```typescript
// Store as ISO string
const isoString = dayjs().toISOString();
// "2024-01-15T14:30:00.000Z"

// Read from ISO
const date = dayjs(isoString);
```
