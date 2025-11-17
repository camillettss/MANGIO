import { drizzle } from "drizzle-orm/mysql2";
import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import mysql from "mysql2/promise";

// Definizione inline della tabella foods
const foods = mysqlTable("foods", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  proteins: int("proteins").notNull(),
  carbs: int("carbs").notNull(),
  fats: int("fats").notNull(),
  calories: int("calories").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

const italianFoods = [
  // Carni
  { name: "Petto di pollo", proteins: 31, carbs: 0, fats: 4, calories: 165 },
  { name: "Manzo magro", proteins: 26, carbs: 0, fats: 8, calories: 180 },
  { name: "Tacchino", proteins: 29, carbs: 0, fats: 1, calories: 135 },
  { name: "Prosciutto crudo", proteins: 26, carbs: 0, fats: 12, calories: 224 },
  { name: "Bresaola", proteins: 32, carbs: 0, fats: 2, calories: 151 },
  
  // Pesce
  { name: "Salmone", proteins: 20, carbs: 0, fats: 13, calories: 208 },
  { name: "Tonno al naturale", proteins: 26, carbs: 0, fats: 1, calories: 116 },
  { name: "Merluzzo", proteins: 18, carbs: 0, fats: 1, calories: 82 },
  { name: "Orata", proteins: 20, carbs: 0, fats: 4, calories: 121 },
  { name: "Gamberi", proteins: 24, carbs: 0, fats: 1, calories: 106 },
  
  // Latticini
  { name: "Latte intero", proteins: 3, carbs: 5, fats: 4, calories: 64 },
  { name: "Latte scremato", proteins: 3, carbs: 5, fats: 0, calories: 34 },
  { name: "Yogurt greco", proteins: 10, carbs: 4, fats: 5, calories: 97 },
  { name: "Parmigiano Reggiano", proteins: 36, carbs: 4, fats: 26, calories: 392 },
  { name: "Mozzarella", proteins: 18, carbs: 2, fats: 20, calories: 280 },
  { name: "Ricotta", proteins: 11, carbs: 3, fats: 13, calories: 174 },
  
  // Uova
  { name: "Uova intere", proteins: 13, carbs: 1, fats: 11, calories: 155 },
  { name: "Albume d'uovo", proteins: 11, carbs: 1, fats: 0, calories: 52 },
  
  // Cereali e derivati
  { name: "Pasta di semola", proteins: 13, carbs: 75, fats: 2, calories: 371 },
  { name: "Pasta integrale", proteins: 13, carbs: 66, fats: 3, calories: 348 },
  { name: "Riso bianco", proteins: 7, carbs: 80, fats: 1, calories: 365 },
  { name: "Riso integrale", proteins: 8, carbs: 77, fats: 3, calories: 370 },
  { name: "Pane bianco", proteins: 9, carbs: 49, fats: 3, calories: 265 },
  { name: "Pane integrale", proteins: 9, carbs: 44, fats: 4, calories: 247 },
  { name: "Farro", proteins: 15, carbs: 67, fats: 3, calories: 357 },
  { name: "Quinoa", proteins: 14, carbs: 64, fats: 6, calories: 368 },
  { name: "Avena", proteins: 17, carbs: 66, fats: 7, calories: 389 },
  { name: "Fette biscottate", proteins: 11, carbs: 72, fats: 6, calories: 378 },
  
  // Legumi
  { name: "Ceci", proteins: 19, carbs: 61, fats: 6, calories: 364 },
  { name: "Lenticchie", proteins: 25, carbs: 60, fats: 1, calories: 353 },
  { name: "Fagioli borlotti", proteins: 23, carbs: 63, fats: 2, calories: 335 },
  { name: "Fagioli cannellini", proteins: 23, carbs: 60, fats: 2, calories: 333 },
  { name: "Piselli", proteins: 5, carbs: 14, fats: 0, calories: 81 },
  { name: "Fave", proteins: 5, carbs: 11, fats: 0, calories: 71 },
  
  // Verdure
  { name: "Spinaci", proteins: 3, carbs: 4, fats: 0, calories: 23 },
  { name: "Broccoli", proteins: 3, carbs: 7, fats: 0, calories: 34 },
  { name: "Zucchine", proteins: 1, carbs: 3, fats: 0, calories: 17 },
  { name: "Pomodori", proteins: 1, carbs: 4, fats: 0, calories: 18 },
  { name: "Insalata", proteins: 1, carbs: 3, fats: 0, calories: 15 },
  { name: "Carote", proteins: 1, carbs: 10, fats: 0, calories: 41 },
  { name: "Peperoni", proteins: 1, carbs: 6, fats: 0, calories: 31 },
  { name: "Melanzane", proteins: 1, carbs: 6, fats: 0, calories: 25 },
  { name: "Cavolfiore", proteins: 2, carbs: 5, fats: 0, calories: 25 },
  
  // Frutta
  { name: "Banana", proteins: 1, carbs: 23, fats: 0, calories: 89 },
  { name: "Mela", proteins: 0, carbs: 14, fats: 0, calories: 52 },
  { name: "Arancia", proteins: 1, carbs: 12, fats: 0, calories: 47 },
  { name: "Fragole", proteins: 1, carbs: 8, fats: 0, calories: 32 },
  { name: "Kiwi", proteins: 1, carbs: 15, fats: 1, calories: 61 },
  { name: "Pera", proteins: 0, carbs: 15, fats: 0, calories: 57 },
  { name: "Pesca", proteins: 1, carbs: 10, fats: 0, calories: 39 },
  { name: "Uva", proteins: 1, carbs: 18, fats: 0, calories: 69 },
  
  // Frutta secca
  { name: "Mandorle", proteins: 21, carbs: 22, fats: 50, calories: 579 },
  { name: "Noci", proteins: 15, carbs: 14, fats: 65, calories: 654 },
  { name: "Nocciole", proteins: 15, carbs: 17, fats: 61, calories: 628 },
  { name: "Pistacchi", proteins: 20, carbs: 28, fats: 45, calories: 562 },
  { name: "Arachidi", proteins: 26, carbs: 16, fats: 49, calories: 567 },
  
  // Oli e condimenti
  { name: "Olio extravergine d'oliva", proteins: 0, carbs: 0, fats: 100, calories: 884 },
  { name: "Olio di semi", proteins: 0, carbs: 0, fats: 100, calories: 900 },
  { name: "Burro", proteins: 1, carbs: 1, fats: 83, calories: 717 },
  
  // Dolci e snack
  { name: "Cioccolato fondente", proteins: 5, carbs: 61, fats: 30, calories: 546 },
  { name: "Biscotti secchi", proteins: 7, carbs: 75, fats: 12, calories: 416 },
  { name: "Miele", proteins: 0, carbs: 82, fats: 0, calories: 304 },
  { name: "Marmellata", proteins: 0, carbs: 60, fats: 0, calories: 250 },
];

async function seedFoods() {
  let connection;
  try {
    console.log("Connessione al database...");
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    const db = drizzle(connection);
    
    console.log("Inizio popolamento database con alimenti...");
    
    for (const food of italianFoods) {
      await db.insert(foods).values(food);
      console.log(`Inserito: ${food.name}`);
    }
    
    console.log(`\nCompletato! Inseriti ${italianFoods.length} alimenti nel database.`);
  } catch (error) {
    console.error("Errore durante il popolamento:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

seedFoods();
