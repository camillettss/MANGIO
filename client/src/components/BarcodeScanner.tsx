import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Camera, Keyboard, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  onProductFound?: (product: any) => void;
}

export default function BarcodeScanner({ onScan, onClose, onProductFound }: BarcodeScannerProps) {
  const [mode, setMode] = useState<"camera" | "manual" | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startCameraScanning = async () => {
    try {
      setIsScanning(true);
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      const videoInputDevices = await codeReader.listVideoInputDevices();
      if (videoInputDevices.length === 0) {
        toast.error("Nessuna camera disponibile");
        setIsScanning(false);
        return;
      }

      // Usa la camera posteriore se disponibile (per mobile)
      const selectedDevice =
        videoInputDevices.find((device) => device.label.toLowerCase().includes("back")) ||
        videoInputDevices[0];

      if (videoRef.current) {
        await codeReader.decodeFromVideoDevice(
          selectedDevice.deviceId,
          videoRef.current,
          (result, error) => {
            if (result) {
              const barcode = result.getText();
              toast.success(`Barcode scansionato: ${barcode}`);
              if (onProductFound) {
                // Modalità con recupero dati OFF
                onProductFound({ barcode });
              } else {
                // Modalità semplice
                onScan(barcode);
              }
              stopScanning();
            }
          }
        );
      }
    } catch (error) {
      console.error("Errore nell'avvio della camera:", error);
      toast.error("Impossibile accedere alla camera. Verifica i permessi.");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      toast.error("Inserisci un codice barcode");
      return;
    }
    if (onProductFound) {
      // Modalità con recupero dati OFF
      onProductFound({ barcode: manualCode.trim() });
    } else {
      // Modalità semplice
      onScan(manualCode.trim());
    }
  };

  if (mode === null) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scansiona barcode</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Scegli come inserire il codice a barre dell'alimento
        </p>
        <div className="grid grid-cols-1 gap-3">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => {
              setMode("camera");
              startCameraScanning();
            }}
          >
            <Camera className="h-8 w-8" />
            <span>Scansiona con camera</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => setMode("manual")}
          >
            <Keyboard className="h-8 w-8" />
            <span>Inserisci manualmente</span>
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "camera") {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scansiona barcode</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              stopScanning();
              onClose();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: "4/3" }}>
          <video ref={videoRef} className="w-full h-full object-cover" />
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-primary w-64 h-32 rounded-lg"></div>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Inquadra il codice a barre del prodotto
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            stopScanning();
            setMode(null);
          }}
        >
          Cambia modalità
        </Button>
      </div>
    );
  }

  if (mode === "manual") {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Inserisci barcode</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="barcode">Codice a barre</Label>
          <Input
            id="barcode"
            placeholder="Es: 8001505005707"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleManualSubmit();
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            Inserisci il codice numerico presente sotto il barcode
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setMode(null);
              setManualCode("");
            }}
          >
            Indietro
          </Button>
          <Button className="flex-1" onClick={handleManualSubmit}>
            Cerca
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
