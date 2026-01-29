import { db as database } from "@/db/client";
import { categories as categoriesRepo } from "@/db/schema";
import { generateUUID } from "@/src/utils/uuid";
import {
	type ObservableArray,
	type ObservableObject,
	computed,
	observable,
} from "@legendapp/state";
import { eq } from "drizzle-orm";
import { colorKit } from "reanimated-color-picker";

const DEFAULT_CATEGORIES = [
	{
		name: "Food",
		color: "#FFC542",
		icon: "🍔",
		type: "Expense" as const,
	},
	{
		name: "Transport",
		color: "#FF565E",
		icon: "🚕",
		type: "Expense" as const,
	},
	{
		name: "Shopping",
		color: "#3CD3AD",
		icon: "🛍️",
		type: "Expense" as const,
	},
	{
		name: "Groceries",
		color: "#4CDA64",
		icon: "🛒",
		type: "Expense" as const,
	},
	{
		name: "Rent",
		color: "#279AF4",
		icon: "🏠",
		type: "Expense" as const,
	},
	{
		name: "Subscriptions",
		color: "#EC7A58",
		icon: "🔒",
		type: "Expense" as const,
	},
	{
		name: "Family",
		color: "#A6678A",
		icon: "👨‍👩‍👧",
		type: "Expense" as const,
	},
	{
		name: "Healthcare",
		color: "#C56AF7",
		icon: "🏥",
		type: "Expense" as const,
	},
	{
		name: "Entertainment",
		color: "#6E7BF1",
		icon: "🎬",
		type: "Expense" as const,
	},
	{
		name: "Salary",
		color: "#F3BF56",
		icon: "💵",
		type: "Income" as const,
	},
	{
		name: "Investment",
		color: "#ED80A2",
		icon: "💰",
		type: "Income" as const,
	},
	{
		name: "Gifts",
		color: "#F6D24A",
		icon: "🎁",
		type: "Income" as const,
	},
];

export interface ICategory {
	id: string; // UUID
	name: string;
	color: string;
	icon: string;
	type: "Income" | "Expense";
}

interface ICategoryDraft extends Omit<ICategory, "id"> {
	isEmojiPickerOpen: boolean;
}

export type CategoriesListObservable = ObservableArray<Array<ICategory>>;

export class CategoryModel {
	category: ObservableObject<ICategoryDraft>;
	categories: CategoriesListObservable;

	colors = new Array(6).fill("#fff").map(() => colorKit.randomRgbColor().hex());

	constructor() {
		this.category = observable<ICategoryDraft>({
			name: "",
			color: colorKit.randomRgbColor().hex(),
			icon: "",
			type: "Expense" as const,
			isEmojiPickerOpen: false,
		});

		this.categories = observable([]);
	}

	// Views
	getCategoriesByType = computed(() => {
		const categories = this.categories.get();
		const incomeCategories = categories.filter(
			(category) => category.type === "Income",
		);
		const expenseCategories = categories.filter(
			(category) => category.type === "Expense",
		);
		return { incomeCategories, expenseCategories };
	});

	// Actions
	create = async () => {
		const { name, color, icon, type } = this.category.peek();
		const newCategory = await database
			.insert(categoriesRepo)
			.values({
				id: generateUUID(),
				name,
				color,
				icon,
				type,
				syncStatus: "pending",
			})
			.returning();
		await this.getCategoriesList({});
		return newCategory;
	};

	getCategoriesList = async ({ type }: { type?: "Income" | "Expense" }) => {
		let query = database.select().from(categoriesRepo);
		if (type) {
			query = query.where(eq(categoriesRepo.type, type));
		}

		const result = await query;
		this.categories.set(result);
	};

	getCategoryByIdAsync = async (id: string) => {
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

	deleteCategoryById = async (id: string) => {
		await database.delete(categoriesRepo).where(eq(categoriesRepo.id, id));
	};

	createDefaultCategories = async () => {
		// Generate fresh UUIDs for each category at insert time
		const categoriesWithIds = DEFAULT_CATEGORIES.map((cat) => ({
			...cat,
			id: generateUUID(),
			syncStatus: "pending" as const,
		}));

		await database
			.insert(categoriesRepo)
			.values(categoriesWithIds)
			.onConflictDoNothing({ target: categoriesRepo.name })
			.returning();
	};
}
