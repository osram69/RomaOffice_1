import { boolean, integer, jsonb, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const orderStatus = pgEnum("order_status", ["pending", "paid", "filled", "signed", "cancelled"]);

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  lang: varchar("lang", { length: 2 }).notNull().default("it"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  consent: boolean("consent").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 64 }).notNull().unique(),
  email: text("email").notNull(),
  phone: text("phone"),
  service: text("service").notNull(),
  durationMonths: integer("duration_months").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("eur"),
  provider: varchar("provider", { length: 16 }),
  providerReference: text("provider_reference"),
  status: orderStatus("status").notNull().default("pending"),
  formData: jsonb("form_data"),
  signaturePath: text("signature_path"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const otpVerifications = pgTable("otp_verifications", {
  id: serial("id").primaryKey(),
  orderPublicId: varchar("order_public_id", { length: 64 }).notNull(),
  phone: text("phone").notNull(),
  codeHash: text("code_hash").notNull(),
  attempts: integer("attempts").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
