import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabella alimenti con macronutrienti per 100g
 */
export const foods = mysqlTable("foods", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  /** Proteine in grammi per 100g di alimento */
  proteins: int("proteins").notNull(),
  /** Carboidrati in grammi per 100g di alimento */
  carbs: int("carbs").notNull(),
  /** Grassi in grammi per 100g di alimento */
  fats: int("fats").notNull(),
  /** Calorie per 100g di alimento */
  calories: int("calories").notNull(),
  /** Flag per indicare se è un alimento personalizzato */
  isCustom: int("isCustom").default(0).notNull(),
  /** ID utente che ha creato l'alimento (null per alimenti predefiniti) */
  userId: int("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Food = typeof foods.$inferSelect;
export type InsertFood = typeof foods.$inferInsert;

/**
 * Tabella liste pasti create dagli utenti
 */
export const mealLists = mysqlTable("mealLists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  /** Obiettivo proteine in grammi (opzionale) */
  targetProteins: int("targetProteins"),
  /** Obiettivo carboidrati in grammi (opzionale) */
  targetCarbs: int("targetCarbs"),
  /** Obiettivo grassi in grammi (opzionale) */
  targetFats: int("targetFats"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MealList = typeof mealLists.$inferSelect;
export type InsertMealList = typeof mealLists.$inferInsert;

/**
 * Tabella alimenti aggiunti alle liste con quantità personalizzate
 */
export const mealListItems = mysqlTable("mealListItems", {
  id: int("id").autoincrement().primaryKey(),
  mealListId: int("mealListId").notNull(),
  foodId: int("foodId").notNull(),
  /** Quantità in grammi */
  quantity: int("quantity").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MealListItem = typeof mealListItems.$inferSelect;
export type InsertMealListItem = typeof mealListItems.$inferInsert;

/**
 * Tabella per associare barcode agli alimenti
 */
export const foodBarcodes = mysqlTable("foodBarcodes", {
  id: int("id").autoincrement().primaryKey(),
  barcode: varchar("barcode", { length: 255 }).notNull().unique(),
  foodId: int("foodId").notNull(),
  /** ID utente che ha creato l'associazione */
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FoodBarcode = typeof foodBarcodes.$inferSelect;
export type InsertFoodBarcode = typeof foodBarcodes.$inferInsert;