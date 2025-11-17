import { eq, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, foods, mealLists, mealListItems, foodBarcodes } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Query helpers per alimenti
export async function getAllFoods() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(foods);
}

export async function searchFoodsByName(searchTerm: string, userId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Cerca tra alimenti predefiniti e quelli personalizzati dell'utente
  const results = await db.select().from(foods).where(like(foods.name, `%${searchTerm}%`));
  
  // Filtra per mostrare solo alimenti predefiniti o quelli dell'utente corrente
  return results.filter(food => food.isCustom === 0 || food.userId === userId);
}

export async function getFoodById(foodId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(foods).where(eq(foods.id, foodId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Query helpers per liste pasti
export async function createMealList(userId: number, name: string, targets?: { proteins?: number; carbs?: number; fats?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(mealLists).values({
    userId,
    name,
    targetProteins: targets?.proteins,
    targetCarbs: targets?.carbs,
    targetFats: targets?.fats,
  });
  
  return Number(result[0].insertId);
}

export async function getUserMealLists(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(mealLists).where(eq(mealLists.userId, userId));
}

export async function getMealListById(listId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(mealLists).where(eq(mealLists.id, listId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteMealList(listId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Prima elimina tutti gli items della lista
  await db.delete(mealListItems).where(eq(mealListItems.mealListId, listId));
  // Poi elimina la lista
  await db.delete(mealLists).where(eq(mealLists.id, listId));
}

// Query helpers per items nelle liste
export async function addItemToMealList(mealListId: number, foodId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(mealListItems).values({
    mealListId,
    foodId,
    quantity,
  });
  
  return Number(result[0].insertId);
}

export async function getMealListItems(mealListId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Join con la tabella foods per ottenere i dettagli degli alimenti
  const result = await db
    .select({
      id: mealListItems.id,
      quantity: mealListItems.quantity,
      foodId: foods.id,
      foodName: foods.name,
      proteins: foods.proteins,
      carbs: foods.carbs,
      fats: foods.fats,
      calories: foods.calories,
    })
    .from(mealListItems)
    .innerJoin(foods, eq(mealListItems.foodId, foods.id))
    .where(eq(mealListItems.mealListId, mealListId));
  
  return result;
}

export async function removeItemFromMealList(itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(mealListItems).where(eq(mealListItems.id, itemId));
}

export async function updateItemQuantity(itemId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(mealListItems).set({ quantity }).where(eq(mealListItems.id, itemId));
}

// Query helpers per alimenti personalizzati
export async function createCustomFood(userId: number, name: string, proteins: number, carbs: number, fats: number, calories: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(foods).values({
    name,
    proteins,
    carbs,
    fats,
    calories,
    isCustom: 1,
    userId,
  });
  
  return Number(result[0].insertId);
}

export async function getUserCustomFoods(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(foods).where(eq(foods.userId, userId));
}

export async function deleteCustomFood(foodId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verifica che l'alimento appartenga all'utente e sia custom
  const food = await getFoodById(foodId);
  if (!food || food.isCustom === 0 || food.userId !== userId) {
    throw new Error("Non puoi eliminare questo alimento");
  }
  
  // Elimina prima tutti i riferimenti nelle liste
  await db.delete(mealListItems).where(eq(mealListItems.foodId, foodId));
  // Poi elimina l'alimento
  await db.delete(foods).where(eq(foods.id, foodId));
}

// Query helpers per barcode
export async function associateBarcode(barcode: string, foodId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verifica che l'alimento esista
  const food = await getFoodById(foodId);
  if (!food) {
    throw new Error("Alimento non trovato");
  }
  
  // Verifica se il barcode è già associato
  const existing = await db.select().from(foodBarcodes).where(eq(foodBarcodes.barcode, barcode)).limit(1);
  if (existing.length > 0) {
    throw new Error("Questo barcode è già associato a un altro alimento");
  }
  
  const result = await db.insert(foodBarcodes).values({
    barcode,
    foodId,
    userId,
  });
  
  return Number(result[0].insertId);
}

export async function findFoodByBarcode(barcode: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select({
      barcodeId: foodBarcodes.id,
      barcode: foodBarcodes.barcode,
      foodId: foods.id,
      foodName: foods.name,
      proteins: foods.proteins,
      carbs: foods.carbs,
      fats: foods.fats,
      calories: foods.calories,
      isCustom: foods.isCustom,
    })
    .from(foodBarcodes)
    .innerJoin(foods, eq(foodBarcodes.foodId, foods.id))
    .where(eq(foodBarcodes.barcode, barcode))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserBarcodes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select({
      id: foodBarcodes.id,
      barcode: foodBarcodes.barcode,
      foodId: foods.id,
      foodName: foods.name,
    })
    .from(foodBarcodes)
    .innerJoin(foods, eq(foodBarcodes.foodId, foods.id))
    .where(eq(foodBarcodes.userId, userId));
}

export async function removeBarcode(barcodeId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verifica che il barcode appartenga all'utente
  const barcode = await db.select().from(foodBarcodes).where(eq(foodBarcodes.id, barcodeId)).limit(1);
  if (barcode.length === 0 || barcode[0].userId !== userId) {
    throw new Error("Non puoi eliminare questo barcode");
  }
  
  await db.delete(foodBarcodes).where(eq(foodBarcodes.id, barcodeId));
}

// Helper per Open Food Facts
export interface OpenFoodFactsProduct {
  barcode: string;
  name: string;
  proteins: number;
  carbs: number;
  fats: number;
  calories: number;
  brand?: string;
  imageUrl?: string;
}

export async function fetchProductFromOpenFoodFacts(barcode: string): Promise<OpenFoodFactsProduct | null> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.status !== 1 || !data.product) return null;
    
    const product = data.product;
    const nutriments = product.nutriments || {};
    
    // Estrai i valori nutrizionali per 100g
    const proteins = Math.round(nutriments.proteins_100g || nutriments.proteins || 0);
    const carbs = Math.round(nutriments.carbohydrates_100g || nutriments.carbohydrates || 0);
    const fats = Math.round(nutriments.fat_100g || nutriments.fat || 0);
    const calories = Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0);
    
    return {
      barcode,
      name: product.product_name || product.product_name_it || 'Prodotto sconosciuto',
      proteins,
      carbs,
      fats,
      calories,
      brand: product.brands,
      imageUrl: product.image_url,
    };
  } catch (error) {
    console.error('Errore nel recupero dati da Open Food Facts:', error);
    return null;
  }
}

export async function createFoodFromOpenFoodFacts(
  userId: number,
  productData: OpenFoodFactsProduct
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Crea il nome includendo il brand se disponibile
  const foodName = productData.brand 
    ? `${productData.name} (${productData.brand})`
    : productData.name;
  
  // Crea l'alimento personalizzato
  const result = await db.insert(foods).values({
    name: foodName,
    proteins: productData.proteins,
    carbs: productData.carbs,
    fats: productData.fats,
    calories: productData.calories,
    isCustom: 1,
    userId,
  });
  
  const foodId = Number(result[0].insertId);
  
  // Associa automaticamente il barcode
  await db.insert(foodBarcodes).values({
    barcode: productData.barcode,
    foodId,
    userId,
  });
  
  return foodId;
}
