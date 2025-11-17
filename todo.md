# Project TODO

## Database
- [x] Creare tabella alimenti con macronutrienti (proteine, carboidrati, grassi, calorie per 100g)
- [x] Creare tabella liste pasti degli utenti
- [x] Creare tabella alimenti nelle liste con quantità personalizzate
- [x] Popolare database con alimenti comuni italiani

## Backend API
- [x] API per cercare alimenti per nome
- [x] API per ottenere lista di tutti gli alimenti
- [x] API per creare nuova lista pasto
- [x] API per ottenere liste pasti dell'utente
- [x] API per aggiungere alimento a lista con quantità
- [x] API per rimuovere alimento da lista
- [x] API per aggiornare quantità alimento in lista
- [x] API per eliminare lista pasto
- [x] API per calcolare totali macronutrienti di una lista

## Frontend
- [x] Pagina principale con lista delle liste pasti
- [x] Interfaccia per creare nuova lista pasto
- [x] Interfaccia di ricerca alimenti con risultati in tempo reale
- [x] Modale per aggiungere alimento con input quantità
- [x] Visualizzazione alimenti nella lista con quantità
- [x] Contatore live dei macronutrienti totali (proteine, carboidrati, grassi, calorie)
- [x] Funzionalità per rimuovere alimenti dalla lista
- [x] Funzionalità per modificare quantità alimenti
- [x] Visualizzazione obiettivi nutrizionali (opzionale)
- [x] Design responsive e user-friendly

## Testing e Deployment
- [x] Test funzionalità complete
- [x] Verifica calcoli macronutrienti
- [x] Checkpoint finale per deployment

## Alimenti Personalizzati
- [x] Aggiungere campo userId alla tabella foods per distinguere alimenti custom
- [x] Aggiungere campo isCustom alla tabella foods
- [x] API per creare alimento personalizzato
- [x] API per ottenere alimenti personalizzati dell'utente
- [x] API per eliminare alimento personalizzato
- [x] Interfaccia per creare nuovo alimento personalizzato
- [x] Mostrare alimenti personalizzati nella ricerca
- [x] Permettere eliminazione solo dei propri alimenti custom
- [x] Test funzionalità alimenti personalizzati
- [x] Checkpoint finale con nuova feature

## Barcode Scanner
- [x] Creare tabella foodBarcodes per associare barcode agli alimenti
- [x] API per associare barcode a un alimento
- [x] API per cercare alimento tramite barcode
- [x] API per rimuovere associazione barcode
- [x] Installare libreria barcode scanner per frontend
- [x] Interfaccia scanner con accesso camera
- [x] Interfaccia per inserimento manuale codice barcode
- [x] Integrazione scanner nel dialog aggiungi alimento
- [x] Gestione permessi camera
- [x] Test scansione e inserimento manuale
- [x] Checkpoint finale con barcode scanner

## Integrazione Open Food Facts
- [x] API backend per recuperare dati prodotto da Open Food Facts
- [x] Parsing e conversione dati nutrizionali da OFF
- [x] Gestione prodotti non trovati
- [x] Interfaccia per mostrare dati recuperati da OFF
- [x] Opzione per salvare prodotto OFF come alimento personalizzato
- [x] Associazione automatica barcode dopo salvataggio
- [x] Test recupero dati da API esterna
- [x] Checkpoint finale con integrazione OFF

## Modalità Notte
- [x] Configurare ThemeProvider per supportare tema sistema
- [x] Testare adattamento automatico al tema dispositivo
- [x] Checkpoint finale con modalità notte

## Landing Page Professionale
- [x] Design hero section con titolo e CTA
- [x] Sezione features con icone e descrizioni
- [x] Sezione come funziona con step
- [x] Footer con informazioni
- [x] Animazioni e transizioni fluide
- [x] Responsive design per mobile
- [ ] Test su diversi dispositivi
- [ ] Checkpoint finale con landing page

## Pagina Impostazioni
- [ ] Creare pagina Impostazioni
- [ ] Aggiungere pulsante logout
- [ ] Aggiungere switch tema (chiaro/scuro/automatico)
- [ ] Funzione esportazione database alimenti
- [ ] Funzione importazione database alimenti
- [ ] Link alla pagina Impostazioni nell'header
- [ ] Test tutte le funzionalità
- [ ] Checkpoint finale con pagina Impostazioni
