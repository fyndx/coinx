import { db as database } from "@/db/client";
import { type ObservableObject, observable, type ObservableArray } from "@legendapp/state";
import { colorKit } from "reanimated-color-picker";
import { categories } from "@/db/schema";
import * as Crypto from 'expo-crypto';

export interface ICategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: string;
}

interface CategoryDraft extends Partial<ICategory> {
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

    this.categories = observable([])
  }

  create = async () => {
    const { name, color, icon, type } = this.category.peek();
    const newCategory = await database.insert(categories).values({id: `${Crypto.randomUUID()}`, name, color, icon, type}).returning();
    this.categories.push(newCategory[0])
    return newCategory;
  };

  async getCategoriesList() {
    const result = await database.select().from(categories);
    this.categories.set(result)
  }

  getCategoryByIdAsync = async (id: string) => {
    const category = await this.database.collections.get("categories").find(id);

    if (category) {
      return category._raw;
    }
  };

  deleteAllCategories = async () => {
    await this.database.write(async () => {
      const categories = await this.database.get("categories").query().fetch();

      const categoriesToDelete = categories.map((category) => {
        return category.prepareDestroyPermanently();
      });

      await this.database.batch(categoriesToDelete);
    });
  };

  deleteCategoryById = async (id) => {
    const category = await this.database.collections.get("categories").find(id);

    // Delete all transactions related to category before deleting category
    await this.database.write(async () => {
      // const transactions = await this.database
      //   .get("transactions")
      //   .query(Q.where("category_id", Q.eq(id)))
      //   .fetch();
      // const transactionsToDelete = transactions.map((transaction) => {
      //   return transaction.prepareDestroyPermanently();
      // });
      // await this.database.batch(transactionsToDelete);
    });

    await this.database.write(async () => {
      await category.destroyPermanently();
    });
  };
}
