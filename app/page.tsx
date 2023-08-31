"use client";

import {
  LayoutVariants,
  Layouts,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LAYOUT_TYPES, Units } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Boxes,
  CaseSensitive,
  FoldHorizontal,
  FolderHeart,
  LayoutDashboard,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ColorPicker, useColor } from "react-color-palette";
import { IconGrid } from "../components/custom/IconGrid";
import { SelectedIcon } from "../components/custom/SelectedIcon";
import { GoogleFonts } from "./GoogleFonts";

type UnitType = (typeof Units)[number];

export default function Home() {
  const [logoName, setLogoName] = useState<string>("Wordmark.");
  const [icon, setIcon] = useState<string>("Boxes");
  const [layout, setLayout] = useState<Layouts>("ltr");
  const [bgColor, setBgColor] = useColor("#ffffff");
  const [textColor, setTextColor] = useColor("#000000");
  const [iconColor, setIconColor] = useColor("#4C5564");
  const [cardSize, setCardSize] = useState<{
    width: {
      value: number;
      unit: UnitType;
    };
    height: {
      value: number;
      unit: UnitType;
    };
  }>({
    width: {
      value: 400,
      unit: "px",
    },
    height: {
      value: 225,
      unit: "px",
    },
  });

  useEffect(() => {
    const isMobile = window.matchMedia(
      "only screen and (max-width: 768px)",
    ).matches;

    console.log("isMobile:", isMobile);

    if (isMobile) {
      setCardSize({
        width: {
          value: 300,
          unit: "px",
        },
        height: {
          value: 170,
          unit: "px",
        },
      });
    }
  }, []);

  return (
    <>
      <Credits isMobileViewVisible className="" />
      <aside className="flex flex-col w-full h-2/3 md:h-full md:max-h-full md:w-2/5">
        <div className="items-center justify-center flex-none hidden w-full h-20 space-x-2 text-center text-gray-600 border rounded-lg bg-primary-foreground md:flex">
          <Boxes size={32} className="" />
          <text className="w-fit text-center text-2xl font-semibold [text-wrap:balance]">
            Wordmark
          </text>
        </div>

        <Tabs
          orientation="vertical"
          defaultValue="text"
          className="flex flex-col w-full h-full mt-2 border rounded-lg md:max-h-full md:flex-1 md:flex-row md:overflow-auto"
        >
          <TabsList className="flex justify-start w-full overflow-x-auto rounded-r-none h-fit md:h-full md:w-fit md:flex-col md:overflow-x-visible">
            <TabsTrigger
              className="flex flex-col items-center justify-center w-full h-20 p-2 space-y-2 text-gray-600 aspect-square md:w-20"
              value="text"
            >
              <CaseSensitive size={32} />
              <text className="text-xs font-semibold text-gray-600">Text</text>
            </TabsTrigger>
            <Separator orientation="vertical" className="md:hidden" />
            <Separator orientation="horizontal" className="hidden md:block" />
            <TabsTrigger
              className="flex flex-col items-center justify-center w-full h-20 p-2 space-y-2 text-gray-600 aspect-square md:w-20"
              value="color"
            >
              <Palette size={32} />
              <text className="text-xs font-semibold text-gray-600">Color</text>
            </TabsTrigger>
            <Separator orientation="vertical" className="md:hidden" />
            <Separator orientation="horizontal" className="hidden md:block" />
            <TabsTrigger
              className="flex flex-col items-center justify-center w-full h-20 p-2 space-y-2 text-gray-600 aspect-square md:w-20"
              value="icon"
            >
              <FolderHeart size={32} />
              <text className="text-xs font-semibold text-gray-600">Icon</text>
            </TabsTrigger>
            <Separator orientation="vertical" className="md:hidden" />
            <Separator orientation="horizontal" className="hidden md:block" />
            <TabsTrigger
              className="flex flex-col items-center justify-center w-full h-20 p-2 space-y-2 text-gray-600 aspect-square md:w-20"
              value="space"
            >
              <FoldHorizontal size={32} />
              <text className="text-xs font-semibold text-gray-600">Space</text>
            </TabsTrigger>
            <Separator orientation="vertical" className="md:hidden" />
            <Separator orientation="horizontal" className="hidden md:block" />
            <TabsTrigger
              className="flex flex-col items-center justify-center w-full h-20 p-2 space-y-2 text-gray-600 aspect-square md:w-20"
              value="layout"
            >
              <LayoutDashboard size={32} />
              <text className="text-xs font-semibold text-gray-600">
                Layout
              </text>
            </TabsTrigger>
          </TabsList>
          <Separator orientation="vertical" className="hidden md:block" />
          <Separator orientation="horizontal" className="md:hidden" />
          {/* Text Tab Content */}
          <TabsContent
            value="text"
            className="w-full p-3 space-y-5 overflow-y-auto"
          >
            <div className="grid items-center w-full max-w-sm gap-2">
              <Label htmlFor="business-name">Type your logo name</Label>
              <Input
                id="business-name"
                type="text"
                placeholder="Your Business Name"
                value={logoName}
                onChange={(e) => setLogoName(e.target.value)}
              />
            </div>
            <div className="grid items-center w-full max-w-sm gap-2">
              <Label>Set Background Height</Label>
              <Slider
                min={100}
                max={500}
                defaultValue={[cardSize.height.value]}
                step={1}
                onValueChange={(value) =>
                  setCardSize((prev) => ({
                    ...prev,
                    height: { ...prev.height, value: value[0] },
                  }))
                }
                className="py-2"
              />
              <div className="flex space-x-2">
                <Input
                  id="business-height-value"
                  type="number"
                  placeholder="Height"
                  className=""
                  value={cardSize.height.value}
                  onChange={(e) =>
                    setCardSize((prev) => ({
                      ...prev,
                      height: {
                        ...prev.height,
                        value: Number(e.target.value),
                      },
                    }))
                  }
                />
                <Select
                  defaultValue={cardSize.height.unit}
                  onValueChange={(value) =>
                    setCardSize((prev) => ({
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
            <div className="grid items-center w-full max-w-sm gap-2">
              <Label>Set Background Width</Label>
              <Slider
                min={100}
                max={500}
                defaultValue={[cardSize.width.value]}
                step={1}
                onValueChange={(value) =>
                  setCardSize((prev) => ({
                    ...prev,
                    width: { ...prev.width, value: value[0] },
                  }))
                }
                className="py-2"
              />
              <div className="flex space-x-2">
                <Input
                  id="business-width-value"
                  type="number"
                  placeholder="Width"
                  className=""
                  value={cardSize.width.value}
                  onChange={(e) =>
                    setCardSize((prev) => ({
                      ...prev,
                      width: { ...prev.width, value: Number(e.target.value) },
                    }))
                  }
                />
                <Select
                  defaultValue={cardSize.width.unit}
                  onValueChange={(value) =>
                    setCardSize((prev) => ({
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
            <GoogleFonts />
          </TabsContent>
          {/* Color Tab Content */}
          <TabsContent
            value="color"
            className="w-full p-3 space-y-5 overflow-y-auto"
          >
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger className="w-full" value="text">
                  Text
                </TabsTrigger>
                <TabsTrigger className="w-full" value="icon">
                  Icon
                </TabsTrigger>
                <TabsTrigger className="w-full" value="background">
                  Background
                </TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                <div className="grid items-center w-full max-w-sm gap-2">
                  <text className="px-2 text-lg font-semibold text-gray-600">
                    Pick Color for Text
                  </text>
                  <ColorPicker color={textColor} onChange={setTextColor} />
                </div>
              </TabsContent>

              <TabsContent value="icon">
                <div className="grid items-center w-full max-w-sm gap-2">
                  <text className="px-2 text-lg font-semibold text-gray-600">
                    Pick Color for Icon
                  </text>
                  <ColorPicker color={iconColor} onChange={setIconColor} />
                </div>
              </TabsContent>
              <TabsContent value="background">
                <div className="grid items-center w-full max-w-sm gap-2">
                  <text className="px-2 text-lg font-semibold text-gray-600">
                    Pick Color for Background
                  </text>
                  <ColorPicker color={bgColor} onChange={setBgColor} />
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
          {/* Icon Tab Content */}
          <TabsContent
            value="icon"
            className="w-full p-3 space-y-2 overflow-y-auto"
          >
            <div className="grid items-center w-full max-w-sm gap-2 ">
              <Label htmlFor="business-icon">Pick an icon</Label>
              <Input
                id="business-icon"
                type="text"
                placeholder="Icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                disabled
              />
            </div>
            <SelectedIcon icon={icon} />
            {/* Icons */}
            <IconGrid icon={icon} setIcon={setIcon} />
          </TabsContent>
          {/* Layout Tab Content */}
          <TabsContent
            value="layout"
            className="w-full p-3 space-y-2 overflow-y-auto"
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
      <div className="relative flex items-center justify-center w-full p-4 border rounded-lg h-1/3 md:h-full">
        <Card
          className={cn(LayoutVariants({ layout }), "mx-auto my-4 shadow-2xl")}
          // add height and width
          style={{
            backgroundColor: bgColor.hex,
            height: cardSize.height.value + cardSize.height.unit,
            width: cardSize.width.value + cardSize.width.unit,
          }}
        >
          {layout !== "text" && (
            <SelectedIcon
              icon={icon}
              onlyIcon
              style={{ color: iconColor.hex }}
            />
          )}
          {layout !== "icon" && (
            <text
              className={cn(
                "w-fit text-center text-2xl font-semibold text-gray-600 [text-wrap:balance]",
              )}
              style={{ color: textColor.hex }}
            >
              {logoName}
            </text>
          )}
        </Card>
        <Credits isMobileViewVisible={false} />
      </div>
      <div className="flex items-center justify-center w-full h-20 space-x-2 text-center text-gray-600 border rounded-lg bg-primary-foreground md:hidden">
        <Boxes size={32} className="" />
        <text className="w-fit text-center text-2xl font-semibold [text-wrap:balance]">
          Wordmark
        </text>
      </div>
    </>
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
          href="https://github/abhay-ramesh"
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
