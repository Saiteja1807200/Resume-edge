import { pgTable, text, serial, timestamp, numeric, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  targetJobRole: text("target_job_role").notNull(),
  workExperience: text("work_experience").notNull(),
  additionalNotes: text("additional_notes"),
  servicePackage: text("service_package").notNull(),
  addOns: text("add_ons").array().notNull().default([]),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  resumeFileUrl: text("resume_file_url"),
  paymentScreenshotUrl: text("payment_screenshot_url"),
  transactionId: text("transaction_id"),
  status: text("status").notNull().default("pending_payment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
