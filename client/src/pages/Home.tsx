import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, ChevronRight, Utensils, Scan } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
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
import { toast } from "sonner";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [targetProteins, setTargetProteins] = useState("");
  const [targetCarbs, setTargetCarbs] = useState("");
  const [targetFats, setTargetFats] = useState("");

  const utils = trpc.useUtils();
  const { data: mealLists, isLoading: isLoadingLists } = trpc.mealLists.getMyLists.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const createMutation = trpc.mealLists.create.useMutation({
    onSuccess: () => {
      utils.mealLists.getMyLists.invalidate();
      setIsCreateDialogOpen(false);
      setNewListName("");
      setTargetProteins("");
      setTargetCarbs("");
      setTargetFats("");
      toast.success("Lista pasto creata con successo!");
    },
    onError: () => {
      toast.error("Errore nella creazione della lista");
    },
  });

  const deleteMutation = trpc.mealLists.delete.useMutation({
    onSuccess: () => {
      utils.mealLists.getMyLists.invalidate();
      toast.success("Lista eliminata con successo!");
    },
    onError: () => {
      toast.error("Errore nell'eliminazione della lista");
    },
  });

  const handleCreateList = () => {
    if (!newListName.trim()) {
      toast.error("Inserisci un nome per la lista");
      return;
    }

    createMutation.mutate({
      name: newListName,
      targetProteins: targetProteins ? parseInt(targetProteins) : undefined,
      targetCarbs: targetCarbs ? parseInt(targetCarbs) : undefined,
      targetFats: targetFats ? parseInt(targetFats) : undefined,
    });
  };

  const handleDeleteList = (id: number, name: string) => {
    if (confirm(`Sei sicuro di voler eliminare "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white px-4">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">{APP_TITLE}</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Crea le tue diete personalizzate in modo semplice e veloce. Cerca alimenti, aggiungi
            quantità e monitora i tuoi macronutrienti in tempo reale.
          </p>
          <div className="space-y-4">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <a href={getLoginUrl()}>Accedi per iniziare</a>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Database completo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Oltre 60 alimenti italiani con macronutrienti precisi per 100g
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Calcolo automatico</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  I macronutrienti si aggiornano in tempo reale mentre aggiungi alimenti
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Facile da usare</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Interfaccia intuitiva per creare pasti bilanciati rapidamente
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">{APP_TITLE}</h1>
          <div className="flex items-center gap-4">
            <Link href="/custom-foods">
              <Button variant="outline" size="sm">
                <Utensils className="mr-2 h-4 w-4" />
                I miei alimenti
              </Button>
            </Link>
            <Link href="/barcodes">
              <Button variant="outline" size="sm">
                <Scan className="mr-2 h-4 w-4" />
                Barcode
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground">Ciao, {user?.name}</span>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Le tue liste pasti</h2>
            <p className="text-muted-foreground mt-1">
              Crea e gestisci le tue diete personalizzate
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Nuova lista
          </Button>
        </div>

        {isLoadingLists ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Caricamento liste...</p>
          </div>
        ) : mealLists && mealLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealLists.map((list) => (
              <Card key={list.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{list.name}</CardTitle>
                      <CardDescription>
                        Creata il {new Date(list.createdAt).toLocaleDateString("it-IT")}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteList(list.id, list.name)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {(list.targetProteins || list.targetCarbs || list.targetFats) && (
                    <div className="mb-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium mb-2">Obiettivi:</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {list.targetProteins && (
                          <div>
                            <span className="text-muted-foreground">Proteine:</span>
                            <br />
                            <span className="font-semibold">{list.targetProteins}g</span>
                          </div>
                        )}
                        {list.targetCarbs && (
                          <div>
                            <span className="text-muted-foreground">Carbo:</span>
                            <br />
                            <span className="font-semibold">{list.targetCarbs}g</span>
                          </div>
                        )}
                        {list.targetFats && (
                          <div>
                            <span className="text-muted-foreground">Grassi:</span>
                            <br />
                            <span className="font-semibold">{list.targetFats}g</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <Link href={`/meal-list/${list.id}`}>
                    <Button variant="outline" className="w-full">
                      Apri lista
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">Non hai ancora creato nessuna lista pasto</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crea la tua prima lista
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crea nuova lista pasto</DialogTitle>
            <DialogDescription>
              Dai un nome alla tua lista e imposta obiettivi nutrizionali opzionali
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome lista *</Label>
              <Input
                id="name"
                placeholder="Es: Colazione, Pranzo, Cena..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Obiettivi (opzionali)</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="proteins" className="text-xs">
                    Proteine (g)
                  </Label>
                  <Input
                    id="proteins"
                    type="number"
                    placeholder="0"
                    value={targetProteins}
                    onChange={(e) => setTargetProteins(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="carbs" className="text-xs">
                    Carboidrati (g)
                  </Label>
                  <Input
                    id="carbs"
                    type="number"
                    placeholder="0"
                    value={targetCarbs}
                    onChange={(e) => setTargetCarbs(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fats" className="text-xs">
                    Grassi (g)
                  </Label>
                  <Input
                    id="fats"
                    type="number"
                    placeholder="0"
                    value={targetFats}
                    onChange={(e) => setTargetFats(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleCreateList} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creazione..." : "Crea lista"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
