"use client";
import { ColorPickerField } from "@/components/custom/ColorPickerField";
import { NumberInputWithSlider } from "@/components/custom/NumberInputWithSlider";
import { SectionHeader } from "@/components/custom/SectionHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import { Units } from "@/lib/constants";
import { cardAtom } from "@/lib/statemanager";
import { useAtom } from "jotai";
import { LockIcon, Maximize, Square, UnlockIcon } from "lucide-react";
import { ChangeEvent, useState } from "react";

// Define common aspect ratios
type AspectRatio = {
  name: string;
  ratio: number; // width:height
};

const COMMON_RATIOS: AspectRatio[] = [
  { name: "1:1", ratio: 1 },
  { name: "4:3", ratio: 4 / 3 },
  { name: "16:9", ratio: 16 / 9 },
  { name: "21:9", ratio: 21 / 9 },
  { name: "2:3", ratio: 2 / 3 },
  { name: "3:2", ratio: 3 / 2 },
];

export function CardTab() {
  const [cardState, setCardState] = useAtom(cardAtom);
  const [editting, setEditting] = useState(false);

  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      return;
    }

    const newWidth = parseInt(e.target.value);

    if (
      cardState.ratioLocked &&
      cardState.width.unit === cardState.height.unit
    ) {
      // Calculate aspect ratio
      const ratio = cardState.height.value / cardState.width.value;
      const newHeight = Math.round(newWidth * ratio);

      setCardState((prev) => ({
        ...prev,
        width: {
          ...prev.width,
          value: newWidth,
        },
        height: {
          ...prev.height,
          value: newHeight,
        },
      }));
    } else {
      setCardState((prev) => ({
        ...prev,
        width: {
          ...prev.width,
          value: newWidth,
        },
      }));
    }
  };

  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      return;
    }

    const newHeight = parseInt(e.target.value);

    if (
      cardState.ratioLocked &&
      cardState.width.unit === cardState.height.unit
    ) {
      // Calculate aspect ratio
      const ratio = cardState.width.value / cardState.height.value;
      const newWidth = Math.round(newHeight * ratio);

      setCardState((prev) => ({
        ...prev,
        height: {
          ...prev.height,
          value: newHeight,
        },
        width: {
          ...prev.width,
          value: newWidth,
        },
      }));
    } else {
      setCardState((prev) => ({
        ...prev,
        height: {
          ...prev.height,
          value: newHeight,
        },
      }));
    }
  };

  const toggleRatioLock = () => {
    setCardState((prev) => ({
      ...prev,
      ratioLocked: !prev.ratioLocked,
    }));
  };

  // Apply a specific aspect ratio
  const applyAspectRatio = (ratio: number) => {
    // Maintain the current width, adjust height based on the ratio
    const newHeight = Math.round(cardState.width.value / ratio);

    // Enable ratio locking automatically when a preset is selected
    setCardState((prev) => ({
      ...prev,
      height: {
        ...prev.height,
        value: newHeight,
      },
      ratioLocked: true,
    }));
  };

  // Calculate current aspect ratio
  const currentRatio = cardState.width.value / cardState.height.value;

  // Function to get aspect ratio name if it matches a preset
  const getCurrentRatioName = (): string => {
    // Check with a small tolerance for floating point comparison
    const tolerance = 0.01;
    for (const preset of COMMON_RATIOS) {
      if (Math.abs(currentRatio - preset.ratio) < tolerance) {
        return preset.name;
      }
    }

    // If it's close to a simple ratio but not exact, format it
    return `${currentRatio.toFixed(2)}:1`;
  };

  return (
    <TabsContent value="card" className="h-full flex-1 overflow-auto p-0">
      <div className="flex flex-col gap-6 border-b p-4">
        <SectionHeader
          title="Background"
          icon={Square}
          badge={cardState.color.hex}
          description="Set the background color of your design"
        />

        <ColorPickerField
          color={cardState.color}
          onChange={(color) =>
            setCardState((prev) => ({ ...prev, color: color }))
          }
        />
      </div>

      <div className="flex flex-col gap-6 p-4">
        <SectionHeader
          title="Dimensions"
          icon={Maximize}
          badge={`${cardState.width.value}${cardState.width.unit} × ${cardState.height.value}${cardState.height.unit}`}
          description="Set the width and height of your design container"
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Dimensions</Label>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="ratio-lock"
                className="text-xs text-muted-foreground"
              >
                Lock Ratio
              </Label>
              <Switch
                id="ratio-lock"
                checked={cardState.ratioLocked}
                onCheckedChange={toggleRatioLock}
              />
              {cardState.ratioLocked ? (
                <LockIcon size={16} className="text-primary" />
              ) : (
                <UnlockIcon size={16} className="text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Aspect Ratio Presets */}
          <div className="space-y-2">
            <Label className="text-sm">Aspect Ratio</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_RATIOS.map((ratioOption) => (
                <Button
                  key={ratioOption.name}
                  variant={
                    cardState.ratioLocked &&
                    Math.abs(currentRatio - ratioOption.ratio) < 0.01
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => applyAspectRatio(ratioOption.ratio)}
                >
                  {ratioOption.name}
                </Button>
              ))}
            </div>
            {cardState.ratioLocked && (
              <div className="text-xs text-muted-foreground">
                Current ratio: {getCurrentRatioName()}
              </div>
            )}
          </div>

          <div className="grid gap-4">
            {/* Width Controls */}
            <div className="space-y-2 rounded-md bg-muted/20 p-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="width" className="text-sm font-medium">
                  Width
                </Label>
                <div className="flex items-center">
                  <div className="flex h-8 items-center rounded bg-muted/30 pr-0">
                    <input
                      id="width"
                      type="number"
                      className="h-full w-16 bg-transparent pl-2 text-xs focus:outline-none"
                      min={1}
                      value={cardState.width.value}
                      onChange={handleWidthChange}
                      aria-label="Width value"
                    />
                    <Select
                      value={cardState.width.unit}
                      onValueChange={(value) => {
                        const newUnit = value as (typeof Units)[number];

                        // If ratio is locked, ensure both width and height use the same unit
                        if (cardState.ratioLocked) {
                          setCardState((prev) => ({
                            ...prev,
                            width: {
                              ...prev.width,
                              unit: newUnit,
                            },
                            height: {
                              ...prev.height,
                              unit: newUnit,
                            },
                          }));
                        } else {
                          setCardState((prev) => ({
                            ...prev,
                            width: {
                              ...prev.width,
                              unit: newUnit,
                            },
                          }));
                        }
                      }}
                    >
                      <SelectTrigger
                        className="h-8 w-14 border-0 bg-transparent pl-1 pr-1 text-xs focus:ring-0"
                        aria-label="Width unit"
                      >
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {Units.map((unit: string) => (
                          <SelectItem
                            key={unit}
                            value={unit}
                            className="text-xs"
                          >
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <NumberInputWithSlider
                id="width-slider"
                min={1}
                max={1000}
                step={1}
                value={cardState.width.value}
                onChange={(value) => {
                  if (
                    cardState.ratioLocked &&
                    cardState.width.unit === cardState.height.unit
                  ) {
                    // Calculate aspect ratio
                    const ratio =
                      cardState.height.value / cardState.width.value;
                    const newHeight = Math.round(value * ratio);

                    setCardState((prev) => ({
                      ...prev,
                      width: {
                        ...prev.width,
                        value: value,
                      },
                      height: {
                        ...prev.height,
                        value: newHeight,
                      },
                    }));
                  } else {
                    setCardState((prev) => ({
                      ...prev,
                      width: {
                        ...prev.width,
                        value: value,
                      },
                    }));
                  }
                }}
              />
              <div className="text-right text-xs text-muted-foreground">
                {cardState.width.unit === "px"
                  ? "Pixels"
                  : cardState.width.unit === "%"
                  ? "Percent"
                  : cardState.width.unit === "em"
                  ? "Font size units"
                  : cardState.width.unit === "rem"
                  ? "Root font size units"
                  : "Units"}
              </div>
            </div>

            {/* Height Controls */}
            <div className="space-y-2 rounded-md bg-muted/20 p-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="height" className="text-sm font-medium">
                  Height
                </Label>
                <div className="flex items-center">
                  <div className="flex h-8 items-center rounded bg-muted/30 pr-0">
                    <input
                      id="height"
                      type="number"
                      className="h-full w-16 bg-transparent pl-2 text-xs focus:outline-none"
                      min={1}
                      value={cardState.height.value}
                      onChange={handleHeightChange}
                      aria-label="Height value"
                    />
                    <Select
                      value={cardState.height.unit}
                      onValueChange={(value) => {
                        const newUnit = value as (typeof Units)[number];

                        // If ratio is locked, ensure both width and height use the same unit
                        if (cardState.ratioLocked) {
                          setCardState((prev) => ({
                            ...prev,
                            width: {
                              ...prev.width,
                              unit: newUnit,
                            },
                            height: {
                              ...prev.height,
                              unit: newUnit,
                            },
                          }));
                        } else {
                          setCardState((prev) => ({
                            ...prev,
                            height: {
                              ...prev.height,
                              unit: newUnit,
                            },
                          }));
                        }
                      }}
                    >
                      <SelectTrigger
                        className="h-8 w-14 border-0 bg-transparent pl-1 pr-1 text-xs focus:ring-0"
                        aria-label="Height unit"
                      >
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {Units.map((unit: string) => (
                          <SelectItem
                            key={unit}
                            value={unit}
                            className="text-xs"
                          >
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <NumberInputWithSlider
                id="height-slider"
                min={1}
                max={1000}
                step={1}
                value={cardState.height.value}
                onChange={(value) => {
                  if (
                    cardState.ratioLocked &&
                    cardState.width.unit === cardState.height.unit
                  ) {
                    // Calculate aspect ratio
                    const ratio =
                      cardState.width.value / cardState.height.value;
                    const newWidth = Math.round(value * ratio);

                    setCardState((prev) => ({
                      ...prev,
                      height: {
                        ...prev.height,
                        value: value,
                      },
                      width: {
                        ...prev.width,
                        value: newWidth,
                      },
                    }));
                  } else {
                    setCardState((prev) => ({
                      ...prev,
                      height: {
                        ...prev.height,
                        value: value,
                      },
                    }));
                  }
                }}
              />
              <div className="text-right text-xs text-muted-foreground">
                {cardState.height.unit === "px"
                  ? "Pixels"
                  : cardState.height.unit === "%"
                  ? "Percent"
                  : cardState.height.unit === "em"
                  ? "Font size units"
                  : cardState.height.unit === "rem"
                  ? "Root font size units"
                  : "Units"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
