// @ts-nocheck
import { Model } from "@nozbe/watermelondb";
import { text, children } from "@nozbe/watermelondb/decorators";

export default class Category extends Model {
  static table = "categories";
  static associations = {
    transactions: { type: "has_many", foreign_key: "category_id" },
  };

  @text("name") name;
  @text("icon") icon;
  @text("color") color;
  @text("type") type; // income or expense

  @children("transactions") transactions;

  async markAsDeleted(): Promise<void> {
    await this.transactions.destroyAllPermanently();
    await super.markAsDeleted();
  }
}
