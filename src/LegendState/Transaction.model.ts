import { ObservableObject, observable } from "@legendapp/state";

export class TransactionModel {
  obs: ObservableObject<{ amount: string }>;

  constructor() {
    this.obs = observable({
      amount: "",
    });
  }

  setAmount = (text: string) => {
    const textString = text.toString();
    const amount = this.obs.amount.peek();

    if (textString.includes(".")) {
      if (amount.length === 0) {
        this.obs.amount.set("0.");
      } else if (amount.includes(".")) {
        return;
      } else {
        this.obs.amount.set((prev) => prev.concat(textString));
      }
    } else {
      this.obs.amount.set((prev) => prev.concat(textString));
    }
  };

  createTransaction = () => {};
}
