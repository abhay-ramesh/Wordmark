"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { TabsContent } from "@/components/ui/tabs";
import { Units } from "@/lib/constants";
import { useEffect } from "react";
import { ColorPicker } from "react-color-palette";
import { useAtom, useAtomValue } from "jotai";
import { cardAtom, layoutAtom } from "@/lib/statemanager";
import { UnitType } from "../page";

export function CardTab() {
  const [card, setCard] = useAtom(cardAtom);
  const layout = useAtomValue(layoutAtom);

  useEffect(() => {
    const isMobile = window.matchMedia(
      "only screen and (max-width: 768px)",
    ).matches;

    console.log("isMobile:", isMobile);

    if (isMobile) {
      if (layout === "icon" || layout === "circle") {
        updateCardDimensions(200, 200);
      } else {
        updateCardDimensions(170, 300);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to update card dimensions
  const updateCardDimensions = (height: number, width: number) => {
    setCard((prev) => ({
      ...prev,
      height: { ...prev.height, value: height },
      width: { ...prev.width, value: width },
    }));
  };

  // Function to handle dimension change with lock
  const handleDimensionChange = (
    dimension: "height" | "width",
    value: number,
  ) => {
    if (layout === "icon" || layout === "circle") {
      updateCardDimensions(value, value);
    } else {
      updateCardDimensions(
        dimension === "height" ? value : card.height.value,
        dimension === "width" ? value : card.width.value,
      );
    }
  };

  useEffect(() => {
    if (layout === "icon" || layout === "circle") {
      updateCardDimensions(card.height.value, card.height.value);
    } else {
      updateCardDimensions(card.height.value, card.width.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);
  return (
    <TabsContent value="card" className="w-full space-y-5 overflow-y-auto p-3">
      <div className="grid w-full max-w-sm items-center gap-2">
        <Label htmlFor="card-height-value">Set Background Height</Label>
        <Slider
          id="card-height-value"
          min={100}
          max={500}
          value={[card.height.value]}
          step={1}
          onValueChange={(value) => handleDimensionChange("height", value[0])}
          className="py-2"
        />
        <div className="flex space-x-2">
          <Input
            id="card-height-value"
            type="number"
            placeholder="Height"
            className=""
            value={card.height.value}
            onChange={(e) =>
              handleDimensionChange("height", Number(e.target.value))
            }
          />
          <Select
            value={card.height.unit}
            onValueChange={(value) =>
              setCard((prev) => ({
                ...prev,
                height: { ...prev.height, unit: value as UnitType },
              }))
            }
          >
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              {Units.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid w-full max-w-sm items-center gap-2">
        <Label htmlFor="card-width-value">Set Background Width</Label>
        <Slider
          id="card-width-value"
          min={100}
          max={500}
          step={1}
          value={[card.width.value]}
          onValueChange={(value) => handleDimensionChange("width", value[0])}
          className="py-2"
        />
        <div className="flex space-x-2">
          <Input
            id="card-width-value"
            type="number"
            placeholder="Width"
            className=""
            value={card.width.value}
            onChange={(e) =>
              handleDimensionChange("width", Number(e.target.value))
            }
          />
          <Select
            value={card.width.unit}
            onValueChange={(value) =>
              setCard((prev) => ({
                ...prev,
                width: { ...prev.width, unit: value as UnitType },
              }))
            }
          >
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              {Units.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid w-full max-w-sm gap-2">
        <Label htmlFor="card-color-picker">Set Background Color</Label>
        <ColorPicker
          color={card.color}
          onChange={(color) => setCard((prev) => ({ ...prev, color: color }))}
        />
      </div>
    </TabsContent>
  );
}
