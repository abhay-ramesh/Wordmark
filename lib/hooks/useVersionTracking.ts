"use client";

import {
  cardAtom,
  fontAtom,
  iconAtom,
  layoutAtom,
  textAtom,
} from "@/lib/statemanager";
import { debounce } from "@/lib/utils";
import { addVersionAtom, createThumbnail } from "@/lib/versionHistory";
import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";

// Properties that should be debounced due to frequent changes
const DEBOUNCE_DELAYS = {
  text: 800, // Text content changes
  color: 500, // Color picker changes
  dimensions: 500, // Width/height changes
  fontSize: 500, // Font size changes
  iconSize: 500, // Icon size changes
};

export function useVersionTracking() {
  const [card] = useAtom(cardAtom);
  const [text] = useAtom(textAtom);
  const [font] = useAtom(fontAtom);
  const [icon] = useAtom(iconAtom);
  const [layout] = useAtom(layoutAtom);
  const [, addVersion] = useAtom(addVersionAtom);

  // Function to capture thumbnail and add version
  const captureAndAddVersion = useCallback(async () => {
    try {
      const thumbnail = await createThumbnail();
      addVersion(thumbnail);
    } catch (error) {
      console.error("Error adding version:", error);
      // Still add version even if thumbnail fails
      addVersion(undefined);
    }
  }, [addVersion]);

  // Create debounced version of capture function
  const debouncedCapture = useCallback(
    (delay: number) => {
      return debounce(captureAndAddVersion, delay);
    },
    [captureAndAddVersion],
  );

  // Track card dimension and color changes (debounced)
  useEffect(() => {
    const saveVersion = debouncedCapture(DEBOUNCE_DELAYS.dimensions);
    saveVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    card.width.value,
    card.width.unit,
    card.height.value,
    card.height.unit,
    card.color.hex,
  ]);

  // Track text content and color changes (debounced)
  useEffect(() => {
    const saveVersion = debouncedCapture(DEBOUNCE_DELAYS.text);
    saveVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text.text, text.color.hex]);

  // Track text size changes (debounced)
  useEffect(() => {
    const saveVersion = debouncedCapture(DEBOUNCE_DELAYS.fontSize);
    saveVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text.size]);

  // Track icon changes (debounced for size, immediate for icon type)
  useEffect(() => {
    const saveVersion = debouncedCapture(DEBOUNCE_DELAYS.iconSize);
    saveVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [icon.size, icon.color.hex]);

  // Track icon type (immediate, not debounced)
  useEffect(() => {
    captureAndAddVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [icon.icon]);

  // Track font changes (immediate, not debounced)
  useEffect(() => {
    captureAndAddVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [font?.family]);

  // Track layout changes (immediate, not debounced)
  useEffect(() => {
    captureAndAddVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  // Initialize with first version
  useEffect(() => {
    // Small delay to ensure DOM is rendered
    const timer = setTimeout(() => {
      captureAndAddVersion();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
