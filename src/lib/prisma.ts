/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({
	log: ["query", "error"],

	adapter,
});
