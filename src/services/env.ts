import { z } from "zod";

const envSchema = z.object({
	EXPO_PUBLIC_SUPABASE_URL: z
		.string()
		.url("EXPO_PUBLIC_SUPABASE_URL must be a valid URL"),
	EXPO_PUBLIC_SUPABASE_ANON_KEY: z
		.string()
		.min(1, "EXPO_PUBLIC_SUPABASE_ANON_KEY is required"),
	EXPO_PUBLIC_BACKEND_URL: z
		.string()
		.url("EXPO_PUBLIC_BACKEND_URL must be a valid URL"),
});

type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
	const result = envSchema.safeParse({
		EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
		EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
		EXPO_PUBLIC_BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL,
	});

	if (!result.success) {
		const errors = result.error.flatten().fieldErrors;
		const message = Object.entries(errors)
			.map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`)
			.join("\n");

		throw new Error(
			`Missing or invalid environment variables:\n${message}\n\nCopy .env.example to .env and fill in values.`,
		);
	}

	return result.data;
}

export const env = parseEnv();
