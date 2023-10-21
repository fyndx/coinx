import { Database } from "@nozbe/watermelondb";
import Category from "../model/Category";

export class CategoryModel {
  constructor(private readonly database: Database) {
    this.database = database;
  }

  create = async ({
    name,
    color,
    icon,
  }: {
    name: string;
    color: string;
    icon: string;
  }) => {
    const category = await this.database.write(async () => {
      const newCategory = await this.database
        .get<Category>("categories")
        .create((categoryRecord) => {
          categoryRecord.name = name;
          categoryRecord.color = color;
          categoryRecord.icon = icon;
        });
      return newCategory;
    });

    return category;
  };

  get categoriesList() {
    const categories = this.database.collections.get("categories").query();

    return categories;
  }
}
