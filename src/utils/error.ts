import { Data } from "effect";

export class DrizzleError extends Data.TaggedError("DrizzleError")<{
	message: string;
}> {}
