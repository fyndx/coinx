declare module "@coinify/currency" {
	const Currency: {
		fromSmallestSubunit(amount: number, currencyCode: string): number;
		toSmallestSubunit(amount: number | string, currencyCode: string): number;
	};
	export default Currency;
}
