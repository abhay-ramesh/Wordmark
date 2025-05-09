"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";

type Step = {
  title: string;
  description: string;
  target: string; // CSS selector for the target element
  position: "top" | "bottom" | "left" | "right";
};

// Global function to restart the onboarding process
export const restartOnboarding = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("wordmark-onboarding-complete");
    // Reload the page to trigger the onboarding again
    window.location.reload();
  }
};

const onboardingSteps: Step[] = [
  {
    title: "Choose Your Text",
    description:
      "Start by typing your brand name or tagline in the text editor.",
    target: '[data-tab="text"]',
    position: "right",
  },
  {
    title: "Select a Font",
    description:
      "Browse through fonts from multiple providers to find your perfect match.",
    target: ".font-selector",
    position: "right",
  },
  {
    title: "Customize Your Design",
    description:
      "Adjust colors, spacing, and styling to make your logo unique.",
    target: '[data-tab="card"]',
    position: "right",
  },
  {
    title: "Add an Icon",
    description: "Optionally, add an icon to complement your text.",
    target: '[data-tab="icon"]',
    position: "right",
  },
  {
    title: "Arrange Your Layout",
    description:
      "Choose how text and icon are positioned relative to each other.",
    target: '[data-tab="layout"]',
    position: "right",
  },
  {
    title: "Preview Your Design",
    description: "See how your logo looks in the preview panel.",
    target: "#display-card",
    position: "left",
  },
  {
    title: "Download Your Logo",
    description:
      "When you're happy with your design, download it in your preferred format.",
    target: '[name="Download"]',
    position: "left",
  },
];

export function Onboarding() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipDirection, setTooltipDirection] = useState<
    "top" | "bottom" | "left" | "right"
  >("right");

  useEffect(() => {
    // Check if this is the first visit
    const hasSeenOnboarding = localStorage.getItem(
      "wordmark-onboarding-complete",
    );

    if (!hasSeenOnboarding) {
      setShowWelcome(true);
    }
  }, []);

  const startTutorial = () => {
    setShowWelcome(false);
    setCurrentStep(0);
    positionTooltip(0);
  };

  const skipTutorial = () => {
    setShowWelcome(false);
    localStorage.setItem("wordmark-onboarding-complete", "true");
  };

  const nextStep = () => {
    if (currentStep === null) return;

    if (currentStep < onboardingSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      positionTooltip(nextStepIndex);
    } else {
      // Tutorial complete
      setCurrentStep(null);
      localStorage.setItem("wordmark-onboarding-complete", "true");
    }
  };

  const positionTooltip = (stepIndex: number) => {
    const step = onboardingSteps[stepIndex];
    const targetElement = document.querySelector(step.target);

    if (!targetElement) {
      // If target element isn't found, try again shortly
      setTimeout(() => positionTooltip(stepIndex), 100);
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    let top = 0;
    let left = 0;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Tooltip dimensions (approximate)
    const tooltipWidth = 256; // 64 * 4 = 256px (w-64)
    const tooltipHeight = 150; // approximate height

    // Position based on specified direction
    switch (step.position) {
      case "top":
        top = rect.top - 10;
        left = rect.left + rect.width / 2;
        break;
      case "bottom":
        top = rect.bottom + 10;
        left = rect.left + rect.width / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left - 10;
        break;
      case "right":
        top = rect.top + rect.height / 2;
        left = rect.right + 10;
        break;
    }

    // Check if tooltip would go outside viewport and adjust position
    let position = step.position;

    // Horizontal bounds checking
    if (
      left - tooltipWidth / 2 < 0 &&
      (position === "top" || position === "bottom")
    ) {
      // Too close to left edge
      left = tooltipWidth / 2 + 10;
    } else if (
      left + tooltipWidth / 2 > viewportWidth &&
      (position === "top" || position === "bottom")
    ) {
      // Too close to right edge
      left = viewportWidth - tooltipWidth / 2 - 10;
    }

    // If left positioned tooltip would go off left edge
    if (position === "left" && left - tooltipWidth < 0) {
      // Try to flip to right if there's room
      if (rect.right + tooltipWidth < viewportWidth) {
        position = "right";
        left = rect.right + 10;
      } else {
        // Otherwise adjust to fit on screen
        left = tooltipWidth + 10;
      }
    }

    // If right positioned tooltip would go off right edge
    if (position === "right" && left + tooltipWidth > viewportWidth) {
      // Try to flip to left if there's room
      if (rect.left - tooltipWidth > 0) {
        position = "left";
        left = rect.left - 10;
      } else {
        // Otherwise adjust to fit on screen
        left = viewportWidth - tooltipWidth - 10;
      }
    }

    // Vertical bounds checking
    if (
      top - tooltipHeight / 2 < 0 &&
      (position === "left" || position === "right")
    ) {
      // Too close to top edge
      top = tooltipHeight / 2 + 10;
    } else if (
      top + tooltipHeight / 2 > viewportHeight &&
      (position === "left" || position === "right")
    ) {
      // Too close to bottom edge
      top = viewportHeight - tooltipHeight / 2 - 10;
    }

    // If top positioned tooltip would go off top edge
    if (position === "top" && top - tooltipHeight < 0) {
      // Try to flip to bottom if there's room
      if (rect.bottom + tooltipHeight < viewportHeight) {
        position = "bottom";
        top = rect.bottom + 10;
      } else {
        // Otherwise adjust to fit on screen
        top = tooltipHeight + 10;
      }
    }

    // If bottom positioned tooltip would go off bottom edge
    if (position === "bottom" && top + tooltipHeight > viewportHeight) {
      // Try to flip to top if there's room
      if (rect.top - tooltipHeight > 0) {
        position = "top";
        top = rect.top - 10;
      } else {
        // Otherwise adjust to fit on screen
        top = viewportHeight - tooltipHeight - 10;
      }
    }

    setTooltipPosition({ top, left });
    setTooltipDirection(position as "top" | "bottom" | "left" | "right");

    // Highlight the target element
    targetElement.classList.add("onboarding-highlight");

    return () => {
      targetElement.classList.remove("onboarding-highlight");
    };
  };

  return (
    <>
      {/* Welcome Dialog */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Welcome to Wordmark!</DialogTitle>
            <DialogDescription>
              Create beautiful logos using fonts from multiple providers. No
              design skills needed—just your creativity.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <div className="flex flex-col items-center text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <span className="font-bold text-primary">1</span>
                </div>
                <p className="text-sm">Choose Text & Font</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <span className="font-bold text-primary">2</span>
                </div>
                <p className="text-sm">Customize Style</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <span className="font-bold text-primary">3</span>
                </div>
                <p className="text-sm">Download & Use</p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={skipTutorial}
              className="w-full sm:w-auto"
            >
              Skip Tutorial
            </Button>
            <Button onClick={startTutorial} className="w-full sm:w-auto">
              Show Me How
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Step-by-step tooltip */}
      {currentStep !== null && (
        <div
          className="fixed z-50 w-64 rounded-lg bg-popover p-4 text-popover-foreground shadow-lg"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform:
              tooltipDirection === "left"
                ? "translate(-100%, -50%)"
                : tooltipDirection === "right"
                ? "translate(0, -50%)"
                : tooltipDirection === "top"
                ? "translate(-50%, -100%)"
                : "translate(-50%, 0)",
          }}
        >
          <button
            className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setCurrentStep(null);
              localStorage.setItem("wordmark-onboarding-complete", "true");
            }}
          >
            <X size={16} />
          </button>

          <h3 className="mb-1 text-lg font-medium">
            {onboardingSteps[currentStep]?.title}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {onboardingSteps[currentStep]?.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {onboardingSteps.length}
            </span>
            <Button size="sm" onClick={nextStep} className="h-8">
              {currentStep < onboardingSteps.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="ml-1 h-3 w-3" />
                </>
              ) : (
                <>
                  Finish
                  <Check className="ml-1 h-3 w-3" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
