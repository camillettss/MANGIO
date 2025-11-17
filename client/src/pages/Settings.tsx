import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  LogOut, 
  Moon, 
  Sun, 
  Monitor, 
  Download, 
  Upload,
  User,
  Settings as SettingsIcon
} from "lucide-react";
import { useRef } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme, switchable } = useTheme();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Logout effettuato con successo");
      window.location.href = "/";
    },
    onError: () => {
      toast.error("Errore durante il logout");
    },
  });

  const { data: customFoods } = trpc.foods.getMyCustomFoods.useQuery();

  const handleLogout = () => {
    if (confirm("Sei sicuro di voler uscire?")) {
      logoutMutation.mutate();
    }
  };

  const handleExportDatabase = () => {
    if (!customFoods || customFoods.length === 0) {
      toast.error("Non hai alimenti personalizzati da esportare");
      return;
    }

    const dataStr = JSON.stringify(customFoods, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `diet-creator-alimenti-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Database esportato con successo!");
  };

  const handleImportDatabase = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        toast.error("Formato file non valido");
        return;
      }

      // Valida la struttura dei dati
      const isValid = data.every(
        (item) =>
          typeof item.name === "string" &&
          typeof item.proteins === "number" &&
          typeof item.carbs === "number" &&
          typeof item.fats === "number" &&
          typeof item.calories === "number"
      );

      if (!isValid) {
        toast.error("Struttura dati non valida");
        return;
      }

      toast.success(`Trovati ${data.length} alimenti. Importazione in corso...`);
      
      // TODO: Implementare l'importazione effettiva tramite API
      toast.info("Funzionalità di importazione in sviluppo");
    } catch (error) {
      toast.error("Errore nella lettura del file");
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "system":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = (themeValue: string) => {
    switch (themeValue) {
      case "light":
        return "Chiaro";
      case "dark":
        return "Scuro";
      case "system":
        return "Automatico";
      default:
        return "Automatico";
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
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Impostazioni</h1>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Account Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Account</CardTitle>
              </div>
              <CardDescription>Informazioni sul tuo account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base font-medium">Nome utente</Label>
                  <p className="text-sm text-muted-foreground mt-1">{user?.name}</p>
                </div>
              </div>
              {user?.email && (
                <div className="flex items-center justify-between py-2 border-t">
                  <div>
                    <Label className="text-base font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <Label className="text-base font-medium">Esci dall'account</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Disconnetti il tuo account da questo dispositivo
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {logoutMutation.isPending ? "Uscita..." : "Logout"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {getThemeIcon(theme)}
                <CardTitle>Aspetto</CardTitle>
              </div>
              <CardDescription>Personalizza l'aspetto dell'applicazione</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Tema</Label>
                  <p className="text-sm text-muted-foreground">
                    Scegli il tema dell'interfaccia
                  </p>
                </div>
                <Select
                  value={theme}
                  onValueChange={(value) => {
                    // Simula il toggle per raggiungere il tema desiderato
                    while (theme !== value) {
                      toggleTheme?.();
                    }
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {getThemeIcon(theme)}
                        <span>{getThemeLabel(theme)}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        <span>Chiaro</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        <span>Scuro</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        <span>Automatico</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Data Management Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                <CardTitle>Gestione Dati</CardTitle>
              </div>
              <CardDescription>Esporta o importa i tuoi alimenti personalizzati</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base font-medium">Esporta database</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scarica i tuoi alimenti personalizzati in formato JSON
                  </p>
                </div>
                <Button variant="outline" onClick={handleExportDatabase}>
                  <Download className="mr-2 h-4 w-4" />
                  Esporta
                </Button>
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <Label className="text-base font-medium">Importa database</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Carica alimenti da un file JSON precedentemente esportato
                  </p>
                </div>
                <Button variant="outline" onClick={handleImportDatabase}>
                  <Upload className="mr-2 h-4 w-4" />
                  Importa
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Info Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-sm text-muted-foreground space-y-1">
                <p>DIET CREATOR</p>
                <p>Versione 1.0.0</p>
                <p className="pt-2">Gestisci la tua dieta in modo intelligente</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
