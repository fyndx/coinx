import { Database } from "@nozbe/watermelondb";
import Category from "../model/Category";
import { ObservableObject, observable } from "@legendapp/state";
import { colorKit } from "reanimated-color-picker";

export class CategoryModel {
  obs: ObservableObject<{
    name: string;
    color: string;
    icon: string;
    type: string;
    isEmojiPickerOpen: boolean;
  }>;

  colors = new Array(6).fill("#fff").map(() => colorKit.randomRgbColor().hex());

  constructor(private readonly database: Database) {
    this.database = database;
    this.obs = observable({
      name: "",
      color: colorKit.randomRgbColor().hex(),
      icon: "",
      type: "Expense",
      isEmojiPickerOpen: false,
    });
  }

  create = async () => {
    const { name, color, icon, type } = this.obs.peek();
    const category = await this.database.write(async () => {
      const newCategory = await this.database
        .get<Category>("categories")
        .create((categoryRecord) => {
          categoryRecord.name = name;
          categoryRecord.color = color;
          categoryRecord.icon = icon;
          categoryRecord.type = type;
        });
      return newCategory;
    });

    return category;
  };

  get categoriesList() {
    const categories = this.database.collections.get("categories").query();

    return categories;
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
}
