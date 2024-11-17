import { getProductListingsHistoryByProductId } from "@/src/database/Products/ProductListingsHistoryRepo";
import type { AsyncInterface } from "@/src/utils/async-interface";
import { observable } from "@legendapp/state";
import dayjs from "dayjs";
import { Effect, pipe } from "effect";
import Currency from "@coinify/currency";
import { rootStore } from "../index";

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
	graphData?: Record<string, any>[];
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
							rootStore.appModel.obs.currency.peek(),
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
			this.productsListingHistory.status.set("error");
			console.log("Error fetching product listings history", error);
		}
	};
}
