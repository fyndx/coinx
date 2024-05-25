import { observable } from "@legendapp/state";

export class TransactionsScreenModel {
	obs;
	constructor() {
		this.obs = observable({
			duration: "this month",
		});
	}

	transactionsList = async () => {
		// Get transactions group by date
		// Query to get transactions json like this
		// [
		//   {
		//     "transaction_time": "2021-11-10",
		//     "transactions": [
		//       {
		//         "id": "1",
		//         "amount": "1000",
		//         "transaction_time": "2021-11-10",
		//         "transaction_type": "expense",
		//         "transaction_category": "food",
		//         "transaction_note": "test",
		//       }
		//     ]
		// ]
		// const transactions = await this.database.collections
		//   .get("transactions")
		//   .query(
		//     Q.unsafeSqlQuery(
		//       `select strftime('%d-%m-%Y', transaction_time, 'unixepoch') as transaction_day, json_group_array(json_object('amount', amount, 'note', note, 'transaction_time', transaction_time, 'category_id', category_id, 'category_name', categories.name, 'category_icon', categories.icon, 'category_color', categories.color)) as transactions_list from transactions inner join categories on transactions.category_id = categories.id group by strftime('%d-%m-%Y', transaction_time, 'unixepoch') order by transaction_time desc`
		//     )
		//   )
		//   .unsafeFetchRaw();
		// console.log({ transactions: transactions });
		// return transactions;
	};
}
