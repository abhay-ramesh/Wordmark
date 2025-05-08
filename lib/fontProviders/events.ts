/**
 * Simple event system for font provider updates
 */

// Event types
export type FontProviderEventType = "fontSourceUpdated" | "fontProviderUpdated";

// Callback type for events
type EventCallback = (data?: any) => void;

// Event listeners storage
const listeners: Record<FontProviderEventType, EventCallback[]> = {
  fontSourceUpdated: [],
  fontProviderUpdated: [],
};

/**
 * Register a listener for a specific event
 */
export const onFontProviderEvent = (
  eventType: FontProviderEventType,
  callback: EventCallback,
): (() => void) => {
  listeners[eventType].push(callback);

  // Return unsubscribe function
  return () => {
    const index = listeners[eventType].indexOf(callback);
    if (index !== -1) {
      listeners[eventType].splice(index, 1);
    }
  };
};

/**
 * Emit an event to all registered listeners
 */
export const emitFontProviderEvent = (
  eventType: FontProviderEventType,
  data?: any,
): void => {
  // Execute all callbacks for this event type
  listeners[eventType].forEach((callback) => {
    try {
      callback(data);
    } catch (error) {
      console.error(
        `Error in font provider event listener for ${eventType}:`,
        error,
      );
    }
  });
};
