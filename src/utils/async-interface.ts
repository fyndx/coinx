export interface AsyncInterface {
	status: "idle" | "pending" | "success" | "error";
	error?: Error;
}
