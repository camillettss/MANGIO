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
import { ArrowLeft, Plus, Trash2, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import BarcodeScanner from "@/components/BarcodeScanner";

export default function Barcodes() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  const utils = trpc.useUtils();
  const { data: barcodes, isLoading } = trpc.barcodes.getMyBarcodes.useQuery();
  const { data: searchResults } = trpc.foods.search.useQuery(
    { searchTerm },
    { enabled: searchTerm.length > 0 }
  );

  const createMutation = trpc.barcodes.associate.useMutation({
    onSuccess: () => {
      utils.barcodes.getMyBarcodes.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success("Barcode associato!");
    },
    onError: (error) => {
      toast.error("Errore: " + error.message);
    },
  });

  const deleteMutation = trpc.barcodes.remove.useMutation({
    onSuccess: () => {
      utils.barcodes.getMyBarcodes.invalidate();
      toast.success("Associazione rimossa!");
    },
    onError: (error) => {
      toast.error("Errore: " + error.message);
    },
  });

  const resetForm = () => {
    setBarcode("");
    setSearchTerm("");
    setSelectedFood(null);
    setShowBarcodeScanner(false);
  };

  const handleCreate = () => {
    if (!barcode.trim()) {
      toast.error("Inserisci un codice barcode");
      return;
    }
    if (!selectedFood) {
      toast.error("Seleziona un alimento");
      return;
    }

    createMutation.mutate({
      barcode: barcode.trim(),
      foodId: selectedFood.id,
    });
  };

  const handleDelete = (id: number, foodName: string, barcodeValue: string) => {
    if (confirm(`Rimuovere l'associazione tra "${barcodeValue}" e "${foodName}"?`)) {
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
          <h1 className="text-2xl font-bold text-foreground">Gestione Barcode</h1>
          <p className="text-muted-foreground mt-1">
            Associa codici a barre agli alimenti per un accesso rapido
          </p>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Barcode associati</h2>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuova associazione
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Caricamento...</p>
          </div>
        ) : barcodes && barcodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {barcodes.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.foodName}</CardTitle>
                      <CardDescription className="font-mono">{item.barcode}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id, item.foodName, item.barcode)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Non hai ancora associato nessun barcode
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crea la tua prima associazione
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Associa barcode ad alimento</DialogTitle>
            <DialogDescription>
              Scansiona o inserisci un codice a barre e seleziona l'alimento corrispondente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!showBarcodeScanner ? (
              <div className="space-y-2">
                <Label htmlFor="barcode">Codice a barre</Label>
                <div className="flex gap-2">
                  <Input
                    id="barcode"
                    placeholder="Es: 8001505005707"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBarcodeScanner(true)}
                  >
                    Scansiona
                  </Button>
                </div>
              </div>
            ) : (
              <BarcodeScanner
                onScan={(scannedBarcode) => {
                  setBarcode(scannedBarcode);
                  setShowBarcodeScanner(false);
                }}
                onClose={() => setShowBarcodeScanner(false)}
              />
            )}

            {!showBarcodeScanner && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="search">Cerca alimento da associare</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Es: pollo, pasta, riso..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {searchResults && searchResults.length > 0 && (
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
                          {food.calories} kcal
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
                    </CardContent>
                  </Card>
                )}
              </>
            )}
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
              {createMutation.isPending ? "Associazione..." : "Associa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
