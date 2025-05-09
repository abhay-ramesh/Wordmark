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
  ltr: <ArrowRightToLine className="w-4 h-4" />,
  rtl: <ArrowLeftRight className="w-4 h-4" />,
  ttd: <ArrowDownToLine className="w-4 h-4" />,
  dtt: <ArrowDownToLine className="w-4 h-4 transform rotate-180" />,
  text: <span className="text-xs font-bold">T</span>,
  icon: <span className="text-xs font-bold">I</span>,
  circle: <Circle className="w-4 h-4" />,
};

export function LayoutTab() {
  const [layout, setLayout] = useAtom(layoutAtom);
  return (
    <TabsContent
      id="layout"
      value="layout"
      className="overflow-y-auto p-0 mt-0 w-full"
    >
      <div className="p-4 border-b">
        <SectionHeader
          title="Layout Selection"
          icon={Layout}
          badge={String(layout)}
          description="Choose how text and icon elements are arranged in your design"
          className="mb-2"
        />
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 w-full sm:grid-cols-1">
          {LAYOUT_TYPES.map((layoutType) => (
            <Card
              key={layoutType}
              className="p-3 transition-colors cursor-pointer hover:bg-accent/10"
              onClick={() => setLayout(layoutType)}
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    {layoutIcons[layoutType]}
                    <span className="text-sm font-medium capitalize">
                      {layoutType}
                    </span>
                  </div>
                  {layoutType === layout && (
                    <Badge className="text-xs bg-primary">Selected</Badge>
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
