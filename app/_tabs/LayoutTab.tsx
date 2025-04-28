"use client";
import { SectionHeader } from "@/components/custom/SectionHeader";
import {
  Layouts,
  SelectableLayoutCard,
} from "@/components/custom/SelectableLayoutCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { LAYOUT_TYPES } from "@/lib/constants";
import { layoutAtom } from "@/lib/statemanager";
import { useAtom } from "jotai";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowRightToLine,
  Circle,
  Layout,
} from "lucide-react";
import { ReactElement } from "react";

// Layout descriptions for better user understanding
const layoutDescriptions: Record<Layouts, string> = {
  ltr: "Left to Right - Icon on left, text on right",
  rtl: "Right to Left - Icon on right, text on left",
  ttd: "Top to Down - Icon on top, text below",
  dtt: "Down to Top - Text on top, icon below",
  text: "Text Only - No icon, just text",
  icon: "Icon Only - No text, just icon",
  circle: "Circle - Icon in a circular container",
};

// Layout icons for visual representation
const layoutIcons: Record<Layouts, ReactElement> = {
  ltr: <ArrowRightToLine className="h-4 w-4" />,
  rtl: <ArrowLeftRight className="h-4 w-4" />,
  ttd: <ArrowDownToLine className="h-4 w-4" />,
  dtt: <ArrowDownToLine className="h-4 w-4 rotate-180 transform" />,
  text: <span className="text-xs font-bold">T</span>,
  icon: <span className="text-xs font-bold">I</span>,
  circle: <Circle className="h-4 w-4" />,
};

export function LayoutTab() {
  const [layout, setLayout] = useAtom(layoutAtom);
  return (
    <TabsContent
      id="layout"
      value="layout"
      className="w-full overflow-y-auto p-0"
    >
      <div className="border-b p-4">
        <SectionHeader
          title="Layout Selection"
          icon={Layout}
          badge={String(layout)}
          description="Choose how text and icon elements are arranged in your design"
          className="mb-2"
        />
      </div>

      <div className="p-4">
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-1">
          {LAYOUT_TYPES.map((layoutType) => (
            <Card
              key={layoutType}
              className="cursor-pointer p-3 transition-colors hover:bg-accent/10"
              onClick={() => setLayout(layoutType)}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {layoutIcons[layoutType]}
                    <span className="text-sm font-medium capitalize">
                      {layoutType}
                    </span>
                  </div>
                  {layoutType === layout && (
                    <Badge className="bg-primary text-xs">Selected</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {layoutDescriptions[layoutType]}
                </p>
                <div className="mt-2">
                  <SelectableLayoutCard
                    layout={layoutType}
                    isSelected={layoutType === layout}
                    onClick={() => setLayout(layoutType)}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </TabsContent>
  );
}
