import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { 
  Utensils, 
  Scan, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  Smartphone,
  Database,
  Zap
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Database,
      title: "Database Completo",
      description: "Oltre 60 alimenti italiani con valori nutrizionali accurati per 100g. Aggiungi i tuoi alimenti personalizzati."
    },
    {
      icon: Scan,
      title: "Barcode Scanner",
      description: "Scansiona i codici a barre dei prodotti e recupera automaticamente i dati da Open Food Facts."
    },
    {
      icon: Target,
      title: "Obiettivi Personalizzati",
      description: "Imposta i tuoi obiettivi di proteine, carboidrati e grassi per ogni pasto e raggiungili facilmente."
    },
    {
      icon: TrendingUp,
      title: "Calcolo in Tempo Reale",
      description: "Vedi i macronutrienti aggiornarsi live mentre aggiungi alimenti alla tua lista."
    },
    {
      icon: Utensils,
      title: "Liste Pasti Illimitate",
      description: "Crea quante liste vuoi per colazione, pranzo, cena o spuntini. Organizza la tua dieta come preferisci."
    },
    {
      icon: Smartphone,
      title: "Sempre Accessibile",
      description: "Usa l'app da qualsiasi dispositivo: smartphone, tablet o computer. I tuoi dati sono sempre sincronizzati."
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Crea una Lista",
      description: "Inizia creando una nuova lista pasto e imposta i tuoi obiettivi nutrizionali."
    },
    {
      number: "2",
      title: "Aggiungi Alimenti",
      description: "Cerca alimenti per nome o scansiona il barcode. Specifica la quantità desiderata."
    },
    {
      number: "3",
      title: "Raggiungi gli Obiettivi",
      description: "Guarda i totali aggiornarsi in tempo reale e aggiusta le quantità fino a raggiungere i tuoi macro."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">{APP_TITLE}</span>
          </div>
          <Button asChild>
            <a href={getLoginUrl()}>Accedi</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Zap className="h-4 w-4" />
            Gestisci la tua dieta in modo intelligente
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Crea diete personalizzate
            <span className="text-primary"> in pochi secondi</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Il modo più semplice per pianificare i tuoi pasti, calcolare i macronutrienti e raggiungere i tuoi obiettivi nutrizionali. Tutto in un'unica app.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg h-12 px-8" asChild>
              <a href={getLoginUrl()}>
                Inizia Gratis
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg h-12 px-8" asChild>
              <a href="#features">
                Scopri di più
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-20 bg-muted/30">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Tutto ciò che ti serve per una dieta perfetta
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Strumenti potenti e intuitivi per gestire la tua alimentazione
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Come funziona
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tre semplici passi per creare la tua dieta perfetta
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 bg-primary/5">
        <Card className="max-w-3xl mx-auto border-2 border-primary/20">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Pronto a iniziare?
            </h2>
            <p className="text-xl text-muted-foreground">
              Unisciti a migliaia di utenti che hanno già migliorato la loro alimentazione
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="text-lg h-12 px-8" asChild>
                <a href={getLoginUrl()}>
                  Crea il tuo Account
                </a>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Gratis per sempre
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Nessuna carta richiesta
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              <span className="font-semibold">{APP_TITLE}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 {APP_TITLE}. Gestisci la tua dieta in modo intelligente.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
