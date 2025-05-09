import { useEffect } from "react";

type KeyHandler = (event: KeyboardEvent) => void;

type KeyMap = {
  [key: string]: KeyHandler;
};

// Parse the key combination string (e.g., "ctrl+k", "alt+shift+p")
function parseKey(key: string): {
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
} {
  const parts = key.toLowerCase().split("+");
  const modifiers = {
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
  };

  let mainKey = "";

  parts.forEach((part) => {
    if (part === "ctrl" || part === "control") modifiers.ctrl = true;
    else if (part === "alt") modifiers.alt = true;
    else if (part === "shift") modifiers.shift = true;
    else if (
      part === "meta" ||
      part === "cmd" ||
      part === "command" ||
      part === "mod"
    )
      modifiers.meta = true;
    else mainKey = part;
  });

  return { key: mainKey, ...modifiers };
}

export function useHotkeys(keyMap: KeyMap) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      for (const keyCombo in keyMap) {
        const { key, ctrl, alt, shift, meta } = parseKey(keyCombo);

        // Check if the pressed key matches the configuration
        const isKeyMatch =
          event.key.toLowerCase() === key ||
          (key === "arrowup" && event.key === "ArrowUp") ||
          (key === "arrowdown" && event.key === "ArrowDown") ||
          (key === "arrowleft" && event.key === "ArrowLeft") ||
          (key === "arrowright" && event.key === "ArrowRight") ||
          (key === "escape" && event.key === "Escape") ||
          (key === "enter" && event.key === "Enter") ||
          (key === "space" && event.key === " ");

        // Check if all required modifiers are pressed
        const areModifiersMatch =
          ctrl === event.ctrlKey &&
          alt === event.altKey &&
          shift === event.shiftKey &&
          meta === event.metaKey;

        // If both the key and modifiers match, call the handler
        if (isKeyMatch && areModifiersMatch) {
          keyMap[keyCombo](event);
        }
      }
    }

    // Add the global event listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [keyMap]);
}
