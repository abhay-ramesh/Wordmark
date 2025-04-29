"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { importFromFile, importStatusAtom } from "@/lib/importManager";
import { useAtom } from "jotai";
import { FileUp, Upload } from "lucide-react";
import { event } from "nextjs-google-analytics";
import posthog from "posthog-js";
import { useRef, useState } from "react";

export function ImportDialog() {
  const [open, setOpen] = useState(false);
  const [importStatus] = useAtom(importStatusAtom);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to import",
        variant: "destructive",
      });
      return;
    }

    const success = await importFromFile(selectedFile, importMode);

    // Track import event
    event("import", {
      category: "import",
      label: importMode,
      value: success ? 1 : 0,
    });

    posthog.capture("import", {
      category: "import",
      mode: importMode,
      success,
    });

    if (success) {
      toast({
        title: "Import successful",
        description: importStatus.message,
      });
      setOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      toast({
        title: "Import failed",
        description: importStatus.message,
        variant: "destructive",
      });
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-2 flex items-center gap-2 text-xs"
        >
          <FileUp className="h-4 w-4" />
          <span>Import</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            Import your favorites and designs from a Wordmark export file.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div
            className="cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/20 p-8 text-center transition-colors hover:bg-accent/10"
            onClick={triggerFileInput}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={handleFileChange}
            />
            <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              {selectedFile
                ? selectedFile.name
                : "Click to select a file or drag and drop"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports .json files exported from Wordmark
            </p>
          </div>

          <div className="space-y-3">
            <Label>Import Mode</Label>
            <RadioGroup
              value={importMode}
              onValueChange={(value) =>
                setImportMode(value as "merge" | "replace")
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="merge" id="merge" />
                <Label htmlFor="merge" className="cursor-pointer font-normal">
                  Merge with existing data
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="replace" id="replace" />
                <Label htmlFor="replace" className="cursor-pointer font-normal">
                  Replace existing data
                </Label>
              </div>
            </RadioGroup>
            {importMode === "replace" && (
              <p className="text-xs text-destructive">
                Warning: This will delete all your existing favorites and
                history.
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || importStatus.isImporting}
          >
            {importStatus.isImporting ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
