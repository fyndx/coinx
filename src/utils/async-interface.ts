export interface AsyncInterface {
	status: "pending" | "success" | "error";
	error?: Error;
}
