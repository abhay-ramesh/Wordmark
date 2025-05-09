"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportAllData,
  exportCurrentDesign,
  exportFavorites,
  exportHistory,
} from "@/lib/exportManager";
import { FileJson } from "lucide-react";
import { event } from "nextjs-google-analytics";
import posthog from "posthog-js";
import { useState } from "react";

export function ExportMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (type: string, exportFn: () => void) => {
    exportFn();

    // Track export event
    event("export", {
      category: "export",
      label: type,
      value: 1,
    });

    posthog.capture("export", {
      category: "export",
      type: type,
    });

    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 text-xs"
        >
          <FileJson className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          onClick={() => handleExport("current", exportCurrentDesign)}
          className="cursor-pointer"
        >
          Current Design
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExport("favorites", exportFavorites)}
          className="cursor-pointer"
        >
          All Favorites
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("history", exportHistory)}
          className="cursor-pointer"
        >
          Version History
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExport("all", exportAllData)}
          className="cursor-pointer"
        >
          All Data (Backup)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
