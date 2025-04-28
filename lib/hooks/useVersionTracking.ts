"use client";

import {
  cardAtom,
  fontAtom,
  iconAtom,
  layoutAtom,
  textAtom,
} from "@/lib/statemanager";
import { addVersionAtom, createThumbnail } from "@/lib/versionHistory";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { useDebounceCallback } from "usehooks-ts";

// Properties that should be debounced due to frequent changes
const DEBOUNCE_DELAYS = {
  text: 1500, // Text content changes - increased for better typing experience
  color: 500, // Color picker changes
  dimensions: 500, // Width/height changes
  fontSize: 500, // Font size changes
  iconSize: 500, // Icon size changes
};

// Session storage key to track initialization state
const INIT_SESSION_KEY = "wordmark_initialized";

// Global module-level state to prevent duplicate version creation
// This ensures only one version is created even if the hook is mounted multiple times
let isProcessingVersion = false;
let lastVersionTimestamp = 0;
const VERSION_COOLDOWN = 500; // ms between allowed version creations

// Type for tracking changes
type ChangeType =
  | "text"
  | "size"
  | "card"
  | "icon"
  | "iconType"
  | "font"
  | "layout";

export function useVersionTracking() {
  const [card] = useAtom(cardAtom);
  const [text] = useAtom(textAtom);
  const [font] = useAtom(fontAtom);
  const [icon] = useAtom(iconAtom);
  const [layout] = useAtom(layoutAtom);
  const [, addVersion] = useAtom(addVersionAtom);
  const initializedRef = useRef(false);

  // Refs to store previous values for comparison
  const prevTextRef = useRef({ text: text.text, color: text.color.hex });
  const prevTextSizeRef = useRef(text.size);
  const prevCardRef = useRef({
    width: card.width,
    height: card.height,
    color: card.color.hex,
  });
  const prevIconStyleRef = useRef({ size: icon.size, color: icon.color.hex });
  const prevIconRef = useRef(icon.icon);
  const prevFontRef = useRef(font?.family);
  const prevLayoutRef = useRef(layout);

  // Function to create a version - using global lock and timestamp check
  const createVersion = useCallback(async () => {
    // Don't proceed if not initialized
    if (!initializedRef.current) return;

    // Check if we're already processing a version or if we're within cooldown period
    const now = Date.now();
    if (isProcessingVersion || now - lastVersionTimestamp < VERSION_COOLDOWN) {
      console.log("Version creation skipped - still in cooldown or processing");
      return;
    }

    // Set global lock
    isProcessingVersion = true;

    try {
      const thumbnail = await createThumbnail();
      addVersion(thumbnail);
      lastVersionTimestamp = Date.now();
      console.log(
        "Version created at",
        new Date(lastVersionTimestamp).toLocaleTimeString(),
      );
    } catch (error) {
      console.error("Error adding version:", error);
      addVersion(undefined);
      lastVersionTimestamp = Date.now();
    } finally {
      // Release lock after a short delay
      setTimeout(() => {
        isProcessingVersion = false;
      }, 200);
    }
  }, [addVersion]);

  // Debounced version creator for text changes
  const debouncedTextVersion = useDebounceCallback(
    createVersion,
    DEBOUNCE_DELAYS.text,
  );

  // Initialize on mount - runs only once
  useEffect(() => {
    // Check if already initialized in this session
    const checkSessionInitialized = () => {
      if (typeof window === "undefined") return false;
      return sessionStorage.getItem(INIT_SESSION_KEY) === "true";
    };

    const alreadyInitialized = checkSessionInitialized();

    // Small delay to ensure DOM is rendered
    const timer = setTimeout(() => {
      if (!initializedRef.current) {
        initializedRef.current = true;

        // Only create a new version if this is the first load in the session
        if (!alreadyInitialized) {
          createVersion();

          // Mark as initialized in session storage
          if (typeof window !== "undefined") {
            sessionStorage.setItem(INIT_SESSION_KEY, "true");
          }
        }
      }
    }, 500);

    // Cleanup when unmounting
    return () => {
      clearTimeout(timer);
    };
  }, [createVersion]);

  // Central change handler to manage all state changes
  const handleChange = useCallback(
    (changeType: ChangeType, hasChanged: boolean) => {
      if (!initializedRef.current || !hasChanged) return;

      // Use debounce for text changes only
      if (changeType === "text" || changeType === "size") {
        debouncedTextVersion();
      } else {
        // For other changes, create version immediately
        createVersion();
      }
    },
    [createVersion, debouncedTextVersion],
  );

  // Helper function to check if objects are different
  const isDifferent = (a: any, b: any): boolean => {
    if (typeof a !== typeof b) return true;
    if (a === null || b === null) return a !== b;
    if (typeof a === "object") {
      return JSON.stringify(a) !== JSON.stringify(b);
    }
    return a !== b;
  };

  // Track text content and color changes
  useEffect(() => {
    const currentText = { text: text.text, color: text.color.hex };
    const hasChanged = isDifferent(currentText, prevTextRef.current);

    if (hasChanged) {
      prevTextRef.current = currentText;
      handleChange("text", true);
    }
  }, [text.text, text.color.hex, handleChange]);

  // Track text size changes
  useEffect(() => {
    const hasChanged = text.size !== prevTextSizeRef.current;

    if (hasChanged) {
      prevTextSizeRef.current = text.size;
      handleChange("size", true);
    }
  }, [text.size, handleChange]);

  // Track card dimension and color changes
  useEffect(() => {
    const currentCard = {
      width: card.width,
      height: card.height,
      color: card.color.hex,
    };

    const hasChanged = isDifferent(currentCard, prevCardRef.current);

    if (hasChanged) {
      prevCardRef.current = currentCard;
      handleChange("card", true);
    }
  }, [card.width, card.height, card.color.hex, handleChange]);

  // Track icon style changes
  useEffect(() => {
    const currentIconStyle = {
      size: icon.size,
      color: icon.color.hex,
    };

    const hasChanged = isDifferent(currentIconStyle, prevIconStyleRef.current);

    if (hasChanged) {
      prevIconStyleRef.current = currentIconStyle;
      handleChange("icon", true);
    }
  }, [icon.size, icon.color.hex, handleChange]);

  // Track icon type changes
  useEffect(() => {
    const hasChanged = icon.icon !== prevIconRef.current;

    if (hasChanged) {
      prevIconRef.current = icon.icon;
      handleChange("iconType", true);
    }
  }, [icon.icon, handleChange]);

  // Track font changes
  useEffect(() => {
    const hasChanged = font?.family !== prevFontRef.current;

    if (hasChanged) {
      prevFontRef.current = font?.family;
      handleChange("font", true);
    }
  }, [font?.family, handleChange]);

  // Track layout changes
  useEffect(() => {
    const hasChanged = layout !== prevLayoutRef.current;

    if (hasChanged) {
      prevLayoutRef.current = layout;
      handleChange("layout", true);
    }
  }, [layout, handleChange]);
}
