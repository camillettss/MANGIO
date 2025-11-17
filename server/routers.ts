import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Router per gestione alimenti
  foods: router({
    getAll: publicProcedure.query(async () => {
      const { getAllFoods } = await import('./db');
      return await getAllFoods();
    }),
    search: protectedProcedure
      .input(z.object({ searchTerm: z.string() }))
      .query(async ({ ctx, input }) => {
        const { searchFoodsByName } = await import('./db');
        return await searchFoodsByName(input.searchTerm, ctx.user.id);
      }),
    createCustom: protectedProcedure
      .input(z.object({
        name: z.string(),
        proteins: z.number(),
        carbs: z.number(),
        fats: z.number(),
        calories: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createCustomFood } = await import('./db');
        const foodId = await createCustomFood(
          ctx.user.id,
          input.name,
          input.proteins,
          input.carbs,
          input.fats,
          input.calories
        );
        return { id: foodId };
      }),
    getMyCustomFoods: protectedProcedure.query(async ({ ctx }) => {
      const { getUserCustomFoods } = await import('./db');
      return await getUserCustomFoods(ctx.user.id);
    }),
    deleteCustom: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteCustomFood } = await import('./db');
        await deleteCustomFood(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // Router per gestione barcode
  barcodes: router({
    associate: protectedProcedure
      .input(z.object({
        barcode: z.string(),
        foodId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { associateBarcode } = await import('./db');
        const barcodeId = await associateBarcode(input.barcode, input.foodId, ctx.user.id);
        return { id: barcodeId };
      }),

    findByBarcode: protectedProcedure
      .input(z.object({ barcode: z.string() }))
      .query(async ({ input }) => {
        const { findFoodByBarcode } = await import('./db');
        return await findFoodByBarcode(input.barcode);
      }),

    getMyBarcodes: protectedProcedure.query(async ({ ctx }) => {
      const { getUserBarcodes } = await import('./db');
      return await getUserBarcodes(ctx.user.id);
    }),

    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { removeBarcode } = await import('./db');
        await removeBarcode(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // Router per Open Food Facts
  openFoodFacts: router({
    fetchProduct: protectedProcedure
      .input(z.object({ barcode: z.string() }))
      .query(async ({ input }) => {
        const { fetchProductFromOpenFoodFacts } = await import('./db');
        return await fetchProductFromOpenFoodFacts(input.barcode);
      }),

    saveProduct: protectedProcedure
      .input(z.object({
        barcode: z.string(),
        name: z.string(),
        proteins: z.number(),
        carbs: z.number(),
        fats: z.number(),
        calories: z.number(),
        brand: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createFoodFromOpenFoodFacts } = await import('./db');
        const foodId = await createFoodFromOpenFoodFacts(ctx.user.id, {
          barcode: input.barcode,
          name: input.name,
          proteins: input.proteins,
          carbs: input.carbs,
          fats: input.fats,
          calories: input.calories,
          brand: input.brand,
        });
        return { foodId };
      }),
  }),

  // Router per gestione liste pasti
  mealLists: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        targetProteins: z.number().optional(),
        targetCarbs: z.number().optional(),
        targetFats: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createMealList } = await import('./db');
        const listId = await createMealList(ctx.user.id, input.name, {
          proteins: input.targetProteins,
          carbs: input.targetCarbs,
          fats: input.targetFats,
        });
        return { id: listId };
      }),

    getMyLists: protectedProcedure.query(async ({ ctx }) => {
      const { getUserMealLists } = await import('./db');
      return await getUserMealLists(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getMealListById } = await import('./db');
        return await getMealListById(input.id);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteMealList } = await import('./db');
        await deleteMealList(input.id);
        return { success: true };
      }),
  }),

  // Router per gestione items nelle liste
  mealListItems: router({
    add: protectedProcedure
      .input(z.object({
        mealListId: z.number(),
        foodId: z.number(),
        quantity: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { addItemToMealList } = await import('./db');
        const itemId = await addItemToMealList(input.mealListId, input.foodId, input.quantity);
        return { id: itemId };
      }),

    getByListId: protectedProcedure
      .input(z.object({ mealListId: z.number() }))
      .query(async ({ input }) => {
        const { getMealListItems } = await import('./db');
        return await getMealListItems(input.mealListId);
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { removeItemFromMealList } = await import('./db');
        await removeItemFromMealList(input.id);
        return { success: true };
      }),

    updateQuantity: protectedProcedure
      .input(z.object({ id: z.number(), quantity: z.number() }))
      .mutation(async ({ input }) => {
        const { updateItemQuantity } = await import('./db');
        await updateItemQuantity(input.id, input.quantity);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
