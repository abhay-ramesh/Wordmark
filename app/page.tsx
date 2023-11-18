"use client";

import {
  LayoutVariants,
  SelectableLayoutCard,
} from "@/components/custom/SelectableLayoutCard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { LAYOUT_TYPES, Units } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Boxes } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ColorPicker } from "react-color-palette";
import { FontSelector } from "../components/custom/FontSelector";
import { IconSelector } from "@/components/icons/IconSelector";
import { LucideIconStatic, LucideIconType } from "@/components/icons";
import { useAtom, useAtomValue } from "jotai";
import {
  cardAtom,
  fontAtom,
  iconAtom,
  layoutAtom,
  textAtom,
} from "@/lib/statemanager";
import { MenuList } from "./MenuList";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { FontLoader } from "@/lib/fonts";

type UnitType = (typeof Units)[number];

export default function Home() {
  const selectedFont = useAtomValue(fontAtom);
  const [icon, setIcon] = useAtom(iconAtom);
  const [layout, setLayout] = useAtom(layoutAtom);
  const [card, setCard] = useAtom(cardAtom);
  const [lockDimensions, setLockDimensions] = useState(false);

  const [textState, setTextState] = useAtom(textAtom);

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
    <div className="flex min-h-screen flex-col-reverse justify-end space-y-2 space-y-reverse bg-muted p-4 md:h-screen md:flex-row md:space-x-2 md:space-y-0">
      <Credits isMobileViewVisible className="" />
      <aside className="flex h-2/3 w-full flex-col md:h-full md:max-h-full md:w-2/5">
        <div className="hidden h-20 w-full flex-none items-center justify-center space-x-2 rounded-lg border bg-primary-foreground text-center text-gray-600 md:flex">
          <Boxes size={32} className="" />
          <text className="w-fit text-center text-2xl font-semibold [text-wrap:balance]">
            Wordmark
          </text>
        </div>

        <Tabs
          orientation="vertical"
          defaultValue="text"
          className="mt-2 flex h-full w-full flex-col rounded-lg border md:max-h-full md:flex-1 md:flex-row md:overflow-auto"
        >
          <MenuList />
          <Separator orientation="vertical" className="hidden md:block" />
          <Separator orientation="horizontal" className="md:hidden" />
          {/* Text Tab Content */}
          <TabsContent
            value="text"
            className="w-full space-y-5 overflow-y-auto p-3"
          >
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="business-name">Type your logo name</Label>
              <Input
                id="business-name"
                type="text"
                placeholder="Your Business Name"
                value={textState.text}
                onChange={(e) =>
                  setTextState((prev) => ({ ...prev, text: e.target.value }))
                }
              />
            </div>

            {/* Set Font Size */}
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="font-size">Set Font Size</Label>
              <Slider
                min={12}
                max={72}
                step={1}
                value={[textState.size]}
                onValueChange={(value) =>
                  setTextState((prev) => ({ ...prev, size: value[0] }))
                }
                className="py-2"
              />
              <Input
                id="font-size"
                type="number"
                placeholder="Font Size"
                className=""
                value={textState.size}
                onChange={(e) => {
                  setTextState((prev) => ({
                    ...prev,
                    size: Number(e.target.value),
                  }));
                }}
              />
            </div>

            {/* Pick Font Color */}
            <Popover>
              <PopoverTrigger asChild>
                <div>
                  <Button
                    variant="outline"
                    className="flex w-fit items-center justify-between p-0"
                  >
                    <span className="px-2">Pick Font Color</span>
                    <div
                      className="inline-block aspect-square h-full rounded-r-md"
                      style={{ backgroundColor: textState.color.hex }}
                    />
                  </Button>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-fit bg-primary-foreground">
                <ColorPicker
                  color={textState.color}
                  onChange={(color) =>
                    setTextState((prev) => ({ ...prev, color: color }))
                  }
                />
              </PopoverContent>
            </Popover>

            {/* Pick Font */}
            <FontSelector />
          </TabsContent>
          {/* Color Tab Content */}
          <TabsContent
            value="card"
            className="w-full space-y-5 overflow-y-auto p-3"
          >
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label>Set Background Height</Label>
              <Slider
                min={100}
                max={500}
                value={[card.height.value]}
                step={1}
                onValueChange={(value) =>
                  handleDimensionChange("height", value[0])
                }
                className="py-2"
              />
              <div className="flex space-x-2">
                <Input
                  id="business-height-value"
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
              <Label>Set Background Width</Label>
              <Slider
                min={100}
                max={500}
                step={1}
                value={[card.width.value]}
                onValueChange={(value) =>
                  handleDimensionChange("width", value[0])
                }
                className="py-2"
              />
              <div className="flex space-x-2">
                <Input
                  id="business-width-value"
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
              <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Pick Background Color
              </span>
              <ColorPicker
                color={card.color}
                onChange={(color) =>
                  setCard((prev) => ({ ...prev, color: color }))
                }
              />
            </div>
          </TabsContent>
          {/* Icon Tab Content */}
          <TabsContent
            value="icon"
            className="w-full space-y-2 overflow-y-auto p-3"
          >
            {/* Pick Icon Size */}
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="icon-size">Set Icon Size</Label>
              <Slider
                min={12}
                max={72}
                step={1}
                value={[icon.size]}
                onValueChange={(value) =>
                  setIcon((prev) => ({ ...prev, size: value[0] }))
                }
                className="py-2"
              />
              <Input
                id="icon-size"
                type="number"
                placeholder="Icon Size"
                className=""
                value={icon.size}
                onChange={(e) => {
                  setIcon((prev) => ({
                    ...prev,
                    size: Number(e.target.value),
                  }));
                }}
              />
            </div>

            {/* Set Icon Color */}
            <Popover>
              <PopoverTrigger asChild>
                <div>
                  <Button
                    variant="outline"
                    className="flex w-fit items-center justify-between p-0"
                  >
                    <span className="px-2">Pick Icon Color</span>
                    <div
                      className="inline-block aspect-square h-full rounded-r-md"
                      style={{ backgroundColor: icon.color.hex }}
                    />
                  </Button>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-fit bg-primary-foreground">
                <ColorPicker
                  color={icon.color}
                  onChange={(color) =>
                    setIcon((prev) => ({ ...prev, color: color }))
                  }
                />
              </PopoverContent>
            </Popover>

            <IconSelector
              value={icon.icon}
              onChange={(icon) =>
                setIcon((prev) => ({ ...prev, icon: icon as LucideIconType }))
              }
            />
          </TabsContent>

          {/* Space Tab Content */}
          <TabsContent
            value="space"
            className="w-full space-y-2 overflow-y-auto p-3"
          ></TabsContent>
          {/* Layout Tab Content */}
          <TabsContent
            value="layout"
            className="w-full space-y-2 overflow-y-auto p-3"
          >
            {LAYOUT_TYPES.map((layoutType) => (
              <SelectableLayoutCard
                key={layoutType}
                layout={layoutType}
                isSelected={layoutType === layout}
                onClick={() => setLayout(layoutType)}
              />
            ))}
          </TabsContent>
        </Tabs>
      </aside>
      <div className="relative flex h-1/3 w-full items-center justify-center rounded-lg border p-4 md:h-full">
        <Card
          className={cn(LayoutVariants({ layout }), "mx-auto my-4 shadow-2xl")}
          // add height and width
          style={{
            backgroundColor: card.color.hex,
            height: card.height.value + card.height.unit,
            width: card.width.value + card.width.unit,
          }}
        >
          {layout !== "text" && (
            // <LucideIcon
            //   name={icon as LucideIconType}
            //   size={32}
            //   style={{ color: iconColor.hex }}
            // />
            <LucideIconStatic
              name={icon.icon as LucideIconType}
              size={icon.size}
              style={{ color: icon.color.hex }}
            />
          )}
          {layout !== "icon" && layout !== "circle" && (
            <>
              <text
                className={cn(
                  "w-fit text-center text-2xl font-semibold text-gray-600 [text-wrap:balance]",
                )}
                style={{
                  color: textState.color.hex,
                  fontFamily: selectedFont?.family || undefined,
                  fontSize: textState.size + "px",
                }}
              >
                {textState.text}
              </text>
              <FontLoader fonts={[{ font: selectedFont?.family || "" }]} />
            </>
          )}
        </Card>
        <Credits isMobileViewVisible={false} />
      </div>
      <div className="flex h-20 w-full items-center justify-center space-x-2 rounded-lg border bg-primary-foreground text-center text-gray-600 md:hidden">
        <Boxes size={32} className="" />
        <text className="w-fit text-center text-2xl font-semibold [text-wrap:balance]">
          Wordmark
        </text>
      </div>
    </div>
  );

  function Credits({
    className,
    isMobileViewVisible = false,
  }: {
    className?: string;
    isMobileViewVisible: boolean;
  }) {
    return (
      <div
        className={cn(
          "mx-auto w-fit px-8 text-center text-xs text-slate-800 [text-wrap:balance]",
          {
            "block rounded-md border bg-gray-800 py-2 text-slate-100 md:hidden":
              isMobileViewVisible,
            "absolute bottom-4 hidden md:block": !isMobileViewVisible,
          },
          className,
        )}
      >
        Created by{" "}
        <Link
          href="https://github.com/abhay-ramesh"
          className="text-red-400 underline"
        >
          Abhay Ramesh
        </Link>
        . Source code available on{" "}
        <Link
          href="https://github.com/abhay-ramesh/wordmark"
          className="text-red-400 underline"
        >
          GitHub
        </Link>
        .
      </div>
    );
  }
}
