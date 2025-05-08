"use client";

import { useHotkeys } from "@/lib/hooks/useHotkeys";
import { fontAtom, textAtom } from "@/lib/statemanager";
import { useAtom } from "jotai";
import { useCallback } from "react";

interface KeyboardShortcutsProps {
  onRandomFont: () => void;
  onOpenCommandPalette: () => void;
}

export function KeyboardShortcuts({
  onRandomFont,
  onOpenCommandPalette,
}: KeyboardShortcutsProps) {
  const [textState, setTextState] = useAtom(textAtom);
  const [_, setSelectedFont] = useAtom(fontAtom);

  // Font size adjustment
  const increaseFontSize = useCallback(() => {
    setTextState((prev) => ({ ...prev, size: Math.min(prev.size + 1, 72) }));
  }, [setTextState]);

  const decreaseFontSize = useCallback(() => {
    setTextState((prev) => ({ ...prev, size: Math.max(prev.size - 1, 12) }));
  }, [setTextState]);

  // Line height adjustment
  const increaseLineHeight = useCallback(() => {
    setTextState((prev) => ({
      ...prev,
      lineHeight: Math.min(prev.lineHeight + 0.1, 3),
    }));
  }, [setTextState]);

  const decreaseLineHeight = useCallback(() => {
    setTextState((prev) => ({
      ...prev,
      lineHeight: Math.max(prev.lineHeight - 0.1, 0.8),
    }));
  }, [setTextState]);

  // Letter spacing adjustment
  const increaseLetterSpacing = useCallback(() => {
    setTextState((prev) => ({
      ...prev,
      letterSpacing: Math.min(prev.letterSpacing + 0.5, 20),
    }));
  }, [setTextState]);

  const decreaseLetterSpacing = useCallback(() => {
    setTextState((prev) => ({
      ...prev,
      letterSpacing: Math.max(prev.letterSpacing - 0.5, -5),
    }));
  }, [setTextState]);

  // Register hotkeys
  useHotkeys({
    // Open command palette
    "mod+k": (e: KeyboardEvent) => {
      e.preventDefault();
      onOpenCommandPalette();
    },
    // Random font
    r: (e: KeyboardEvent) => {
      // Don't trigger when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      onRandomFont();
    },
    // Font size controls
    "mod+arrowup": (e: KeyboardEvent) => {
      e.preventDefault();
      increaseFontSize();
    },
    "mod+arrowdown": (e: KeyboardEvent) => {
      e.preventDefault();
      decreaseFontSize();
    },
    // Line height controls
    "mod+alt+arrowup": (e: KeyboardEvent) => {
      e.preventDefault();
      increaseLineHeight();
    },
    "mod+alt+arrowdown": (e: KeyboardEvent) => {
      e.preventDefault();
      decreaseLineHeight();
    },
    // Letter spacing controls
    "mod+shift+arrowup": (e: KeyboardEvent) => {
      e.preventDefault();
      increaseLetterSpacing();
    },
    "mod+shift+arrowdown": (e: KeyboardEvent) => {
      e.preventDefault();
      decreaseLetterSpacing();
    },
  });

  return null; // This component doesn't render anything
}
