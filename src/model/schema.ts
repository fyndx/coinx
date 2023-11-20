import { appSchema, tableSchema } from "@nozbe/watermelondb";

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "transactions",
      columns: [
        { name: "transaction_time", type: "number" },
        { name: "type", type: "string" }, // income or expense
        // TODO: can amount evolve into it's own table?
        { name: "amount", type: "number" },
        { name: "note", type: "string", isOptional: true },
        // from categories table
        { name: "category_id", type: "string", isIndexed: true },
      ],
    }),
    tableSchema({
      name: "categories",
      columns: [
        { name: "name", type: "string" },
        { name: "icon", type: "string" },
        { name: "color", type: "string" },
      ],
    }),
  ],
});
