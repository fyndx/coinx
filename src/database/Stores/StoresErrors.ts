import { Data } from "effect";

export class InvalidIdError extends Data.TaggedError("InvalidIdError")<{
	message: string;
}> {}
