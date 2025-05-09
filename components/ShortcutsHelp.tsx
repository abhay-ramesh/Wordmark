"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowDown,
  ArrowUp,
  Command,
  Keyboard,
  Maximize,
  Minimize,
  Shuffle,
  Type,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface ShortcutItem {
  keys: string[];
  description: string;
  icon?: React.ReactNode;
  category: string;
}

export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  const shortcuts: ShortcutItem[] = [
    // General
    {
      keys: ["⌘", "K"],
      description: "Open command palette",
      icon: <Command className="h-4 w-4" />,
      category: "General",
    },
    {
      keys: ["R"],
      description: "Random font",
      icon: <Shuffle className="h-4 w-4" />,
      category: "General",
    },

    // Typography
    {
      keys: ["⌘", "↑"],
      description: "Increase font size",
      icon: <Maximize className="h-4 w-4" />,
      category: "Typography",
    },
    {
      keys: ["⌘", "↓"],
      description: "Decrease font size",
      icon: <Minimize className="h-4 w-4" />,
      category: "Typography",
    },
    {
      keys: ["⌘", "Alt", "↑"],
      description: "Increase line height",
      icon: <ArrowUp className="h-4 w-4" />,
      category: "Typography",
    },
    {
      keys: ["⌘", "Alt", "↓"],
      description: "Decrease line height",
      icon: <ArrowDown className="h-4 w-4" />,
      category: "Typography",
    },
    {
      keys: ["⌘", "Shift", "↑"],
      description: "Increase letter spacing",
      icon: <Type className="h-4 w-4" />,
      category: "Typography",
    },
    {
      keys: ["⌘", "Shift", "↓"],
      description: "Decrease letter spacing",
      icon: <Type className="h-4 w-4" />,
      category: "Typography",
    },
  ];

  // Group shortcuts by category
  const categories = shortcuts.reduce<Record<string, ShortcutItem[]>>(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {},
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          aria-label="Keyboard shortcuts"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Boost your productivity with these shortcuts
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {Object.entries(categories).map(([category, categoryShortcuts]) => (
            <div key={category} className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">
                {category}
              </h3>
              <div className="rounded-md border">
                <div className="divide-y">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        {shortcut.icon}
                        <span className="text-sm">{shortcut.description}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex}>
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-xs text-muted-foreground">
                                +
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
