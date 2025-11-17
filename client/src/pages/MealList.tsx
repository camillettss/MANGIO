import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus, Search, Trash2, Edit, Scan } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import BarcodeScanner from "@/components/BarcodeScanner";

export default function MealList() {
  const params = useParams<{ id: string }>();
  const listId = parseInt(params.id || "0");

  const [isAddFoodDialogOpen, setIsAddFoodDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [quantity, setQuantity] = useState("");
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [openFoodFactsProduct, setOpenFoodFactsProduct] = useState<any>(null);
  const [isLoadingOFF, setIsLoadingOFF] = useState(false);

  const utils = trpc.useUtils();

  const { data: mealList } = trpc.mealLists.getById.useQuery({ id: listId });
  const { data: items, isLoading: isLoadingItems } = trpc.mealListItems.getByListId.useQuery({
    mealListId: listId,
  });
  const { data: searchResults } = trpc.foods.search.useQuery(
    { searchTerm },
    { enabled: searchTerm.length > 0 && !showBarcodeScanner }
  );

  const handleBarcodeSearch = async (scannedData: { barcode: string }) => {
    const { barcode } = scannedData;
    setIsLoadingOFF(true);
    
    try {
      // Prima cerca nel database locale
      const localData = await utils.client.barcodes.findByBarcode.query({ barcode });
      if (localData) {
        setSelectedFood({
          id: localData.foodId,
          name: localData.foodName,
          proteins: localData.proteins,
          carbs: localData.carbs,
          fats: localData.fats,
          calories: localData.calories,
        });
        setShowBarcodeScanner(false);
        setIsLoadingOFF(false);
        toast.success(`Alimento trovato: ${localData.foodName}`);
        return;
      }
      
      // Se non trovato localmente, cerca su Open Food Facts
      const offData = await utils.client.openFoodFacts.fetchProduct.query({ barcode });
      if (offData) {
        setOpenFoodFactsProduct(offData);
        setShowBarcodeScanner(false);
        setIsLoadingOFF(false);
        toast.success(`Prodotto trovato su Open Food Facts: ${offData.name}`);
      } else {
        setIsLoadingOFF(false);
        toast.error("Prodotto non trovato. Prova a cercarlo manualmente o crealo come alimento personalizzato.");
        setShowBarcodeScanner(false);
      }
    } catch (error) {
      setIsLoadingOFF(false);
      toast.error("Errore nella ricerca del barcode");
    }
  };

  const saveOFFProductMutation = trpc.openFoodFacts.saveProduct.useMutation({
    onSuccess: (data) => {
      // Dopo aver salvato il prodotto, selezionalo automaticamente
      if (openFoodFactsProduct) {
        setSelectedFood({
          id: data.foodId,
          name: openFoodFactsProduct.brand 
            ? `${openFoodFactsProduct.name} (${openFoodFactsProduct.brand})`
            : openFoodFactsProduct.name,
          proteins: openFoodFactsProduct.proteins,
          carbs: openFoodFactsProduct.carbs,
          fats: openFoodFactsProduct.fats,
          calories: openFoodFactsProduct.calories,
        });
        setOpenFoodFactsProduct(null);
        toast.success("Prodotto salvato nel database!");
      }
    },
    onError: () => {
      toast.error("Errore nel salvataggio del prodotto");
    },
  });

  const addItemMutation = trpc.mealListItems.add.useMutation({
    onSuccess: () => {
      utils.mealListItems.getByListId.invalidate({ mealListId: listId });
      setIsAddFoodDialogOpen(false);
      setSelectedFood(null);
      setQuantity("");
      setSearchTerm("");
      toast.success("Alimento aggiunto!");
    },
    onError: () => {
      toast.error("Errore nell'aggiunta dell'alimento");
    },
  });

  const removeItemMutation = trpc.mealListItems.remove.useMutation({
    onSuccess: () => {
      utils.mealListItems.getByListId.invalidate({ mealListId: listId });
      toast.success("Alimento rimosso!");
    },
    onError: () => {
      toast.error("Errore nella rimozione dell'alimento");
    },
  });

  const updateQuantityMutation = trpc.mealListItems.updateQuantity.useMutation({
    onSuccess: () => {
      utils.mealListItems.getByListId.invalidate({ mealListId: listId });
      setEditingItemId(null);
      setEditQuantity("");
      toast.success("Quantità aggiornata!");
    },
    onError: () => {
      toast.error("Errore nell'aggiornamento della quantità");
    },
  });

  const totals = useMemo(() => {
    if (!items) return { proteins: 0, carbs: 0, fats: 0, calories: 0 };

    return items.reduce(
      (acc, item) => {
        const multiplier = item.quantity / 100;
        return {
          proteins: acc.proteins + item.proteins * multiplier,
          carbs: acc.carbs + item.carbs * multiplier,
          fats: acc.fats + item.fats * multiplier,
          calories: acc.calories + item.calories * multiplier,
        };
      },
      { proteins: 0, carbs: 0, fats: 0, calories: 0 }
    );
  }, [items]);

  const handleAddFood = () => {
    if (!selectedFood) {
      toast.error("Seleziona un alimento");
      return;
    }
    if (!quantity || parseInt(quantity) <= 0) {
      toast.error("Inserisci una quantità valida");
      return;
    }

    addItemMutation.mutate({
      mealListId: listId,
      foodId: selectedFood.id,
      quantity: parseInt(quantity),
    });
  };

  const handleRemoveItem = (itemId: number, foodName: string) => {
    if (confirm(`Rimuovere "${foodName}" dalla lista?`)) {
      removeItemMutation.mutate({ id: itemId });
    }
  };

  const handleUpdateQuantity = (itemId: number) => {
    if (!editQuantity || parseInt(editQuantity) <= 0) {
      toast.error("Inserisci una quantità valida");
      return;
    }

    updateQuantityMutation.mutate({
      id: itemId,
      quantity: parseInt(editQuantity),
    });
  };

  const startEditingQuantity = (itemId: number, currentQuantity: number) => {
    setEditingItemId(itemId);
    setEditQuantity(currentQuantity.toString());
  };

  const getProgressColor = (current: number, target?: number | null) => {
    if (!target) return "bg-primary";
    const percentage = (current / target) * 100;
    if (percentage < 90) return "bg-yellow-500";
    if (percentage > 110) return "bg-red-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alle liste
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{mealList?.name}</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonna sinistra: Totali macronutrienti */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Totali Macronutrienti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Proteine</span>
                    <span className="text-lg font-bold">
                      {totals.proteins.toFixed(1)}g
                      {mealList?.targetProteins && (
                        <span className="text-sm text-muted-foreground ml-1">
                          / {mealList.targetProteins}g
                        </span>
                      )}
                    </span>
                  </div>
                  {mealList?.targetProteins && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(
                          totals.proteins,
                          mealList.targetProteins
                        )}`}
                        style={{
                          width: `${Math.min(
                            (totals.proteins / mealList.targetProteins) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Carboidrati</span>
                    <span className="text-lg font-bold">
                      {totals.carbs.toFixed(1)}g
                      {mealList?.targetCarbs && (
                        <span className="text-sm text-muted-foreground ml-1">
                          / {mealList.targetCarbs}g
                        </span>
                      )}
                    </span>
                  </div>
                  {mealList?.targetCarbs && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(
                          totals.carbs,
                          mealList.targetCarbs
                        )}`}
                        style={{
                          width: `${Math.min((totals.carbs / mealList.targetCarbs) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Grassi</span>
                    <span className="text-lg font-bold">
                      {totals.fats.toFixed(1)}g
                      {mealList?.targetFats && (
                        <span className="text-sm text-muted-foreground ml-1">
                          / {mealList.targetFats}g
                        </span>
                      )}
                    </span>
                  </div>
                  {mealList?.targetFats && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(
                          totals.fats,
                          mealList.targetFats
                        )}`}
                        style={{
                          width: `${Math.min((totals.fats / mealList.targetFats) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Calorie Totali</span>
                    <span className="text-2xl font-bold text-primary">
                      {totals.calories.toFixed(0)} kcal
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonna destra: Lista alimenti */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Alimenti</h2>
              <Button onClick={() => setIsAddFoodDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi alimento
              </Button>
            </div>

            {isLoadingItems ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : items && items.length > 0 ? (
              <div className="space-y-3">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{item.foodName}</h3>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {editingItemId === item.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={editQuantity}
                                  onChange={(e) => setEditQuantity(e.target.value)}
                                  className="w-24"
                                />
                                <span className="text-sm">g</span>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateQuantity(item.id)}
                                  disabled={updateQuantityMutation.isPending}
                                >
                                  Salva
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingItemId(null);
                                    setEditQuantity("");
                                  }}
                                >
                                  Annulla
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.quantity}g</span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={() => startEditingQuantity(item.id, item.quantity)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Proteine:</span>
                              <br />
                              <span className="font-semibold">
                                {((item.proteins * item.quantity) / 100).toFixed(1)}g
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Carbo:</span>
                              <br />
                              <span className="font-semibold">
                                {((item.carbs * item.quantity) / 100).toFixed(1)}g
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Grassi:</span>
                              <br />
                              <span className="font-semibold">
                                {((item.fats * item.quantity) / 100).toFixed(1)}g
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Calorie:</span>
                              <br />
                              <span className="font-semibold">
                                {((item.calories * item.quantity) / 100).toFixed(0)} kcal
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id, item.foodName)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Nessun alimento aggiunto a questa lista
                  </p>
                  <Button onClick={() => setIsAddFoodDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Aggiungi il primo alimento
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Dialog per aggiungere alimento */}
      <Dialog open={isAddFoodDialogOpen} onOpenChange={setIsAddFoodDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aggiungi alimento</DialogTitle>
            <DialogDescription>Cerca un alimento e specifica la quantità in grammi</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!showBarcodeScanner ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="search">Cerca alimento</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Es: pollo, pasta, riso..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowBarcodeScanner(true)}
                      title="Scansiona barcode"
                    >
                      <Scan className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <BarcodeScanner
                onScan={(barcode) => handleBarcodeSearch({ barcode })}
                onProductFound={handleBarcodeSearch}
                onClose={() => setShowBarcodeScanner(false)}
              />
            )}

            {isLoadingOFF && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Ricerca prodotto...</p>
              </div>
            )}

            {openFoodFactsProduct && !isLoadingOFF && (
              <Card className="bg-blue-50 dark:bg-blue-950">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400">🌍</span>
                    Prodotto trovato su Open Food Facts
                  </CardTitle>
                  <CardDescription>Salva questo prodotto per usarlo nelle tue liste</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-lg">{openFoodFactsProduct.name}</h4>
                    {openFoodFactsProduct.brand && (
                      <p className="text-sm text-muted-foreground">{openFoodFactsProduct.brand}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div className="bg-background p-2 rounded">
                      <span className="text-muted-foreground">Proteine</span>
                      <br />
                      <span className="font-semibold">{openFoodFactsProduct.proteins}g</span>
                    </div>
                    <div className="bg-background p-2 rounded">
                      <span className="text-muted-foreground">Carbo</span>
                      <br />
                      <span className="font-semibold">{openFoodFactsProduct.carbs}g</span>
                    </div>
                    <div className="bg-background p-2 rounded">
                      <span className="text-muted-foreground">Grassi</span>
                      <br />
                      <span className="font-semibold">{openFoodFactsProduct.fats}g</span>
                    </div>
                    <div className="bg-background p-2 rounded">
                      <span className="text-muted-foreground">Calorie</span>
                      <br />
                      <span className="font-semibold">{openFoodFactsProduct.calories} kcal</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setOpenFoodFactsProduct(null)}
                    >
                      Annulla
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        saveOFFProductMutation.mutate({
                          barcode: openFoodFactsProduct.barcode,
                          name: openFoodFactsProduct.name,
                          proteins: openFoodFactsProduct.proteins,
                          carbs: openFoodFactsProduct.carbs,
                          fats: openFoodFactsProduct.fats,
                          calories: openFoodFactsProduct.calories,
                          brand: openFoodFactsProduct.brand,
                        });
                      }}
                      disabled={saveOFFProductMutation.isPending}
                    >
                      {saveOFFProductMutation.isPending ? "Salvataggio..." : "Salva e usa"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {searchResults && searchResults.length > 0 && !openFoodFactsProduct && (
              <div className="max-h-60 overflow-y-auto border rounded-md">
                {searchResults.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food);
                      setSearchTerm("");
                    }}
                    className={`w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-b-0 ${
                      selectedFood?.id === food.id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="font-medium">{food.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      P: {food.proteins}g | C: {food.carbs}g | G: {food.fats}g | Cal:{" "}
                      {food.calories} kcal (per 100g)
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedFood && (
              <Card className="bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{selectedFood.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFood(null)}
                      className="h-6 px-2"
                    >
                      Cambia
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Proteine:</span>
                      <br />
                      <span className="font-semibold">{selectedFood.proteins}g</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Carbo:</span>
                      <br />
                      <span className="font-semibold">{selectedFood.carbs}g</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Grassi:</span>
                      <br />
                      <span className="font-semibold">{selectedFood.fats}g</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Calorie:</span>
                      <br />
                      <span className="font-semibold">{selectedFood.calories} kcal</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Valori per 100g</div>
                </CardContent>
              </Card>
            )}

            {selectedFood && (
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantità (grammi) *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Es: 150"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddFoodDialogOpen(false);
                setSelectedFood(null);
                setQuantity("");
                setSearchTerm("");
              }}
            >
              Annulla
            </Button>
            <Button onClick={handleAddFood} disabled={!selectedFood || addItemMutation.isPending}>
              {addItemMutation.isPending ? "Aggiunta..." : "Aggiungi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
