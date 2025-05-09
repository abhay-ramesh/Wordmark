"use client";
import { ColorPickerField } from "@/components/custom/ColorPickerField";
import { NumberInputWithSlider } from "@/components/custom/NumberInputWithSlider";
import { SectionHeader } from "@/components/custom/SectionHeader";
import { LucideIconType } from "@/components/icons";
import { IconSelector } from "@/components/icons/IconSelector";
import { TabsContent } from "@/components/ui/tabs";
import { iconAtom } from "@/lib/statemanager";
import { useAtom } from "jotai";
import { Image, SlidersHorizontal } from "lucide-react";

export function IconTab() {
  const [icon, setIcon] = useAtom(iconAtom);
  return (
    <TabsContent value="icon" className="w-full overflow-y-auto p-0">
      <div className="flex flex-col gap-6 border-b p-4">
        {/* Section Header */}
        <SectionHeader
          title="Size & Color"
          icon={SlidersHorizontal}
          badge={`${icon.size}px`}
          description="Customize the appearance of your icon"
        />

        {/* Pick Icon Size */}
        <div className="grid gap-4">
          <NumberInputWithSlider
            id="icon-size"
            label="Icon Size"
            min={12}
            max={72}
            step={1}
            value={icon.size}
            unit="px"
            onChange={(value) => setIcon((prev) => ({ ...prev, size: value }))}
          />

          {/* Set Icon Color */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Icon Color</label>
            <ColorPickerField
              color={icon.color}
              onChange={(color) =>
                setIcon((prev) => ({ ...prev, color: color }))
              }
            />
          </div>
        </div>
      </div>

      {/* Pick Icon */}
      <div className="p-4">
        <SectionHeader
          title="Icon Selection"
          icon={Image}
          badge={
            icon.icon
              ? String(icon.icon).charAt(0).toUpperCase() +
                String(icon.icon).slice(1)
              : "None"
          }
          description="Browse and select an icon to include in your design"
          className="mb-4"
        />

        <IconSelector
          id="icon-picker"
          value={icon.icon}
          onChange={(icon) =>
            setIcon((prev) => ({ ...prev, icon: icon as LucideIconType }))
          }
        />
      </div>
    </TabsContent>
  );
}
