import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  inviteId: text("invite_id").notNull(),
  targetAmount: integer("target_amount").notNull(),
  currentAmount: integer("current_amount").notNull(),
  daysLeft: integer("days_left").notNull(),
});

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  name: text("name").notNull(),
  totalDeposited: integer("total_deposited").notNull(),
  avatarUrl: text("avatar_url"),
  isMe: boolean("is_me").default(false),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  memberName: text("member_name").notNull(),
  amount: integer("amount").notNull(),
  depositType: text("deposit_type").notNull(), // daily, weekly, monthly
  proofText: text("proof_text").notNull(),
  date: timestamp("date").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, date: true });

export type Group = typeof groups.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type DashboardData = {
  group: Group;
  myTotal: number;
  recentTransactions: Transaction[];
};
