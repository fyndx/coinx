// @ts-nocheck
import { Model } from "@nozbe/watermelondb";
import { field, text, date, relation } from "@nozbe/watermelondb/decorators";

export default class Transaction extends Model {
  static table = "transactions";

  @date("transaction_time") transactionTime;
  @text("type") type;
  @field("amount") amount;
  @text("note") note;

  @relation("categories", "category_id") category;
}
