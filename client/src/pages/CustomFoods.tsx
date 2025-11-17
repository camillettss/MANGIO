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
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function CustomFoods() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [proteins, setProteins] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [calories, setCalories] = useState("");

  const utils = trpc.useUtils();
  const { data: customFoods, isLoading } = trpc.foods.getMyCustomFoods.useQuery();

  const createMutation = trpc.foods.createCustom.useMutation({
    onSuccess: () => {
      utils.foods.getMyCustomFoods.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success("Alimento personalizzato creato!");
    },
    onError: (error) => {
      toast.error("Errore nella creazione: " + error.message);
    },
  });

  const deleteMutation = trpc.foods.deleteCustom.useMutation({
    onSuccess: () => {
      utils.foods.getMyCustomFoods.invalidate();
      toast.success("Alimento eliminato!");
    },
    onError: (error) => {
      toast.error("Errore nell'eliminazione: " + error.message);
    },
  });

  const resetForm = () => {
    setName("");
    setProteins("");
    setCarbs("");
    setFats("");
    setCalories("");
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Inserisci il nome dell'alimento");
      return;
    }

    const proteinsNum = parseInt(proteins);
    const carbsNum = parseInt(carbs);
    const fatsNum = parseInt(fats);
    const caloriesNum = parseInt(calories);

    if (isNaN(proteinsNum) || isNaN(carbsNum) || isNaN(fatsNum) || isNaN(caloriesNum)) {
      toast.error("Tutti i valori nutrizionali devono essere numeri validi");
      return;
    }

    if (proteinsNum < 0 || carbsNum < 0 || fatsNum < 0 || caloriesNum < 0) {
      toast.error("I valori nutrizionali non possono essere negativi");
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      proteins: proteinsNum,
      carbs: carbsNum,
      fats: fatsNum,
      calories: caloriesNum,
    });
  };

  const handleDelete = (id: number, foodName: string) => {
    if (confirm(`Eliminare "${foodName}"? Verrà rimosso anche da tutte le liste che lo contengono.`)) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla home
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">I miei alimenti personalizzati</h1>
          <p className="text-muted-foreground mt-1">
            Crea i tuoi alimenti custom con macronutrienti personalizzati
          </p>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Alimenti creati</h2>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo alimento
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Caricamento...</p>
          </div>
        ) : customFoods && customFoods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customFoods.map((food) => (
              <Card key={food.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{food.name}</CardTitle>
                      <CardDescription>Valori per 100g</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(food.id, food.name)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted p-2 rounded">
                      <span className="text-muted-foreground">Proteine</span>
                      <br />
                      <span className="font-semibold text-base">{food.proteins}g</span>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <span className="text-muted-foreground">Carboidrati</span>
                      <br />
                      <span className="font-semibold text-base">{food.carbs}g</span>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <span className="text-muted-foreground">Grassi</span>
                      <br />
                      <span className="font-semibold text-base">{food.fats}g</span>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <span className="text-muted-foreground">Calorie</span>
                      <br />
                      <span className="font-semibold text-base">{food.calories} kcal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Non hai ancora creato alimenti personalizzati
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crea il tuo primo alimento
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crea alimento personalizzato</DialogTitle>
            <DialogDescription>
              Inserisci i valori nutrizionali per 100g di alimento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome alimento *</Label>
              <Input
                id="name"
                placeholder="Es: Mix proteico casalingo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proteins">Proteine (g) *</Label>
                <Input
                  id="proteins"
                  type="number"
                  placeholder="0"
                  value={proteins}
                  onChange={(e) => setProteins(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">Carboidrati (g) *</Label>
                <Input
                  id="carbs"
                  type="number"
                  placeholder="0"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fats">Grassi (g) *</Label>
                <Input
                  id="fats"
                  type="number"
                  placeholder="0"
                  value={fats}
                  onChange={(e) => setFats(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calories">Calorie (kcal) *</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              * Tutti i campi sono obbligatori. Inserisci i valori per 100g di alimento.
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              Annulla
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creazione..." : "Crea alimento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
