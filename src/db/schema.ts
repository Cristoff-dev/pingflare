import { pgTable, serial, text, integer, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  isActive: boolean("is_active").default(true),
  intervalMins: integer("interval_mins").default(5),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pings = pgTable("pings", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  status: integer("status").notNull(),
  responseTimeMs: integer("response_time_ms"),
  isUp: boolean("is_up").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => {
  return {
    // Crucial index for optimizing time-series aggregations on uptime calculations
    serviceTimeIdx: index("service_time_idx").on(table.serviceId, table.timestamp),
  };
});

export const servicesRelations = relations(services, ({ many }) => ({
  pings: many(pings),
}));

export const pingsRelations = relations(pings, ({ one }) => ({
  service: one(services, {
    fields: [pings.serviceId],
    references: [services.id],
  }),
}));