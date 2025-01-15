import { getProductListingsHistoryByProductId } from "@/src/database/Products/ProductListingsHistoryRepo";
import type { AsyncInterface } from "@/src/utils/async-interface";
import Currency from "@coinify/currency";
import { computed, observable } from "@legendapp/state";
import dayjs from "dayjs";
import { Effect, pipe } from "effect";
import { appModel } from "../AppState/App.model";

interface ConsolidatedPriceData {
	[key: string]: {
		[key: string]: number | string;
		recordedAt: string;
		date: string;
	};
}

interface ProductListingHistoryData {
	productListingId: number;
	price: number;
	recordedAt: string;
	listingName: string;
}

interface ProductListingHistory extends AsyncInterface {
	data?: ProductListingHistoryData[];
	productListingNames?: string[];
	graphData?: Array<{
		[listingName: string]: number | string;
		recordedAt: string;
		date: string;
	}>;
	colors?: Record<string, string>;
}

export class ProductsListingHistoryModel {
	productsListingHistory;

	constructor() {
		this.productsListingHistory = observable<ProductListingHistory>({
			status: "pending",
			data: [],
			productListingNames: [],
			graphData: [],
			colors: {},
		});
	}

	onUnmount = () => {
		this.productsListingHistory.set({
			status: "pending",
			data: [],
			graphData: [],
			productListingNames: [],
			colors: {},
		});
	};

	getProductListingsHistoryByProductId = async (productId: number) => {
		this.productsListingHistory.status.set("pending");
		try {
			const productListingHistoryData = await Effect.runPromise(
				getProductListingsHistoryByProductId({ productId }),
			);
			console.log("product listing history", productListingHistoryData);

			const updatedProductListingHistoryData = productListingHistoryData.map(
				(listing) => {
					return {
						...listing,
						price: Currency.fromSmallestSubunit(
							listing.price,
							appModel.obs.currency.code.peek(),
						),
					};
				},
			);

			const consolidatedPriceData = updatedProductListingHistoryData.reduce(
				(acc: ConsolidatedPriceData, entry) => {
					const { listingName, price, recordedAt } = entry;
					const date = dayjs(recordedAt);
					const formattedDateWithYear = date.format("D MM YY");
					const formattedDate = date.format("D MMM");
					if (!acc[formattedDateWithYear]) {
						acc[formattedDateWithYear] = {
							recordedAt: formattedDate,
							date: formattedDateWithYear,
						};
					}
					acc[formattedDateWithYear][listingName] = price;
					return acc;
				},
				{},
			);

			const uniqueProductListings = [
				...new Set(
					updatedProductListingHistoryData.map((item) => item.listingName),
				),
			];

			const productListingColors = uniqueProductListings.reduce(
				(acc: Record<string, string>, cur, index) => {
					acc[cur] =
						`hsl(${(index * 360) / uniqueProductListings.length}, 70%, 50%)`;
					return acc;
				},
				{},
			);

			const productListingHistoryGraphData = Object.values(
				consolidatedPriceData,
			);

			this.productsListingHistory.set({
				status: "success",
				data: updatedProductListingHistoryData,
				graphData: Object.values(consolidatedPriceData),
				productListingNames: uniqueProductListings,
				colors: productListingColors,
			});
			console.log("groupedData", productListingHistoryGraphData);
		} catch (error) {
			console.error("Error fetching product listings history:", error);
			this.productsListingHistory.set({
				status: "error",
				data: [],
				graphData: [],
				productListingNames: [],
				colors: {},
			});
		}
	};

	getMinMaxPrice = computed(() => {
		const productListings = this.productsListingHistory?.data?.get();

		// Find raw min/max
		let minimum = Number.POSITIVE_INFINITY;
		let maximum = Number.NEGATIVE_INFINITY;
		for (const productListing of productListings) {
			if (productListing.price < minimum) {
				minimum = productListing.price;
			}
			if (productListing.price > maximum) {
				maximum = productListing.price;
			}
		}

		// Add padding
		const range = maximum - minimum;
		const paddingPercent = 0.1; // 10% padding

		// Calculate padded values
		const paddedMin = minimum - range * paddingPercent;
		const paddedMax = maximum + range * paddingPercent;

		// Get final values
		const finalMin = paddedMin;
		const finalMax = paddedMax;

		return { minimum: finalMin, maximum: finalMax };
	});
}
