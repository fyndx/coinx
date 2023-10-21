import { database } from "../database/WaterMelon";
import { CategoryModel } from "./Category.model";

export const rootStore = {
  categoryModel: new CategoryModel(database),
};
