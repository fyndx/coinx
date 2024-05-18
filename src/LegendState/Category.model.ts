import { db as database } from "@/db/client";
import {
  type ObservableObject,
  observable,
  type ObservableArray,
  computed,
} from "@legendapp/state";
import { colorKit } from "reanimated-color-picker";
import { categories as categoriesRepo } from "@/db/schema";
import * as Crypto from "expo-crypto";
import { eq } from "drizzle-orm";

const DEFAULT_CATEGORIES = [
  {
    name: "Food",
    color: "#FFC542",
    icon: "🍔",
    type: "Expense",
  },
  {
    name: "Transport",
    color: "#FF565E",
    icon: "🚕",
    type: "Expense",
  },
  {
    name: "Shopping",
    color: "#3CD3AD",
    icon: "🛍️",
    type: "Expense",
  },
  {
    name: "Groceries",
    color: "#4CDA64",
    icon: "🛒",
    type: "Expense",
  },
  {
    name: "Rent",
    color: "#279AF4",
    icon: "🏠",
    type: "Expense",
  },
  {
    name: "Subscriptions",
    color: "#EC7A58",
    icon: "🔒",
    type: "Expense",
  },
  {
    name: "Family",
    color: "#A6678A",
    icon: "👨‍👩‍👧",
    type: "Expense",
  },
  {
    name: "Healthcare",
    color: "#C56AF7",
    icon: "🏥",
    type: "Expense",
  },
  {
    name: "Entertainment",
    color: "#6E7BF1",
    icon: "🎬",
    type: "Expense",
  },
  {
    name: "Salary",
    color: "#F3BF56",
    icon: "💵",
    type: "Income",
  },
  {
    name: "Investment",
    color: "#ED80A2",
    icon: "💰",
    type: "Income",
  },
  {
    name: "Gifts",
    color: "#F6D24A",
    icon: "🎁",
    type: "Income",
  },
];

export interface ICategory {
  id: number;
  name: string;
  color: string;
  icon: string;
  type: string;
}

interface CategoryDraft extends Omit<ICategory, "id"> {
  isEmojiPickerOpen: boolean;
}

export type CategoriesListObservable = ObservableArray<Array<ICategory>>;

export class CategoryModel {
  category: ObservableObject<CategoryDraft>;
  categories: CategoriesListObservable;

  colors = new Array(6).fill("#fff").map(() => colorKit.randomRgbColor().hex());

  constructor() {
    this.category = observable({
      name: "",
      color: colorKit.randomRgbColor().hex(),
      icon: "",
      type: "Expense",
      isEmojiPickerOpen: false,
    });

    this.categories = observable([]);
  }

  // Views
  getCategoriesByType = computed(() => {
    const categories = this.categories.get()
    const incomeCategories = categories.filter((category) => category.type === "Income");
    const expenseCategories = categories.filter((category) => category.type === "Expense");
    return { incomeCategories, expenseCategories };
  });

  // Actions
  create = async () => {
    const { name, color, icon, type } = this.category.peek();
    const newCategory = await database
      .insert(categoriesRepo)
      .values({ name, color, icon, type })
      .returning();
    await this.getCategoriesList();
    return newCategory;
  };

  getCategoriesList = async () => {
    const result = await database.select().from(categoriesRepo);
    this.categories.set(result);
  };

  getCategoryByIdAsync = async (id: number) => {
    const category = await database
      .select()
      .from(categoriesRepo)
      .where(eq(categoriesRepo.id, id));

    if (category?.length > 0) {
      return category[0];
    }
  };

  deleteAllCategories = async () => {
    await database.delete(categoriesRepo);
  };

  deleteCategoryById = async (id: number) => {
    await database.delete(categoriesRepo).where(eq(categoriesRepo.id, id));
  };

  createDefaultCategories = async () => {
    await database.insert(categoriesRepo).values(DEFAULT_CATEGORIES).onConflictDoNothing({target: categoriesRepo.name}).returning();
  };
}
