import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Transaction } from "../Transaction";
import { RootProvider } from "@/src/Providers/RootProvider";

const mockTransaction = {
	amount: 100,
	category_color: "#ff0000",
	category_icon: "🍔",
	category_name: "Food",
	note: "Lunch",
	transactionTime: new Date(),
	transactionType: "Expense",
	category_type: "Expense",
	id: 1,
	categoryId: 1,
	createdAt: "",
	updatedAt: "",
};

test("renders transaction details correctly", () => {
	render(<Transaction transaction={mockTransaction} />, {
		wrapper: RootProvider,
	});

	const categoryIcon = screen.getByText("🍔");
	const transactionNote = screen.getByText("Lunch");
	const transactionTime = screen.getByText("12:00 PM");
	const transactionAmount = screen.getByText("100");

	expect(categoryIcon).toBeInTheDocument();
	expect(transactionNote).toBeInTheDocument();
	expect(transactionTime).toBeInTheDocument();
	expect(transactionAmount).toBeInTheDocument();
	expect(transactionAmount).toHaveStyle("color: red");
});

test("renders category name when note is not provided", () => {
	const transactionWithoutNote = { ...mockTransaction, note: undefined };
	render(<Transaction transaction={transactionWithoutNote} />);

	const transactionName = screen.getByText("Food");
	expect(transactionName).toBeInTheDocument();
});

test("renders income transaction with green color", () => {
	const incomeTransaction = { ...mockTransaction, transactionType: "Income" };
	render(<Transaction transaction={incomeTransaction} />);

	const transactionAmount = screen.getByText("100");
	expect(transactionAmount).toHaveStyle("color: green");
});
