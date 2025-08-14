import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Blockchain and wallet types
export type Chain = "eth" | "sol";

export interface WalletEvent {
  id: string;
  type: string;
  description: string;
  timestamp: number;
  hash: string;
  chain: Chain;
  amount?: number;
  token?: string;
  tokenSymbol?: string;
  tokenName?: string;
  contractAddress?: string;
  fromAddress?: string;
  toAddress?: string;
}

export interface WalletStats {
  totalSwaps: number;
  totalValue: number;
  miningRewards: number;
  pondProStatus: boolean;
  pondProExpiry: Date | null;
}

export interface UnifiedAccount {
  xHandle?: string;
  ethAddress?: string;
  solAddress?: string;
  pondProStatus: boolean;
  pondProExpiry?: Date;
}
