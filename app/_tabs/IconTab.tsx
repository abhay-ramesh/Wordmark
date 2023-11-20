"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TabsContent } from "@/components/ui/tabs";
import { ColorPicker } from "react-color-palette";
import { IconSelector } from "@/components/icons/IconSelector";
import { LucideIconType } from "@/components/icons/LucideIcons";
import { useAtom } from "jotai";
import { iconAtom } from "@/lib/statemanager";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function IconTab() {
  const [icon, setIcon] = useAtom(iconAtom);
  return (
    <TabsContent value="icon" className="w-full space-y-4 overflow-y-auto p-3">
      {/* Pick Icon Size */}
      <div className="grid w-full max-w-sm items-center gap-2">
        <Label htmlFor="icon-size">Set Icon Size</Label>
        <Slider
          id="icon-size"
          min={12}
          max={72}
          step={1}
          value={[icon.size]}
          onValueChange={(value) =>
            setIcon((prev) => ({ ...prev, size: value[0] }))
          }
          className="py-4"
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
      <div className="grid w-full max-w-sm items-center gap-2">
        <Label htmlFor="icon-color-picker">Set Icon Color</Label>
        {/* <Popover>
          <PopoverTrigger asChild id="icon-color-picker">
            <div>
              <Button
                variant="outline"
                className="flex items-center justify-between p-0 w-fit"
              >
                <span className="px-2">Pick Icon Color</span>
                <div
                  className="inline-block h-full aspect-square rounded-r-md"
                  style={{ backgroundColor: icon.color.hex }}
                />
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-fit bg-primary-foreground"> */}
        <ColorPicker
          color={icon.color}
          onChange={(color) => setIcon((prev) => ({ ...prev, color: color }))}
        />
        {/* </PopoverContent>
        </Popover> */}
      </div>

      {/* Pick Icon */}
      <div className="grid w-full max-w-sm items-center gap-2">
        <Label htmlFor="icon-picker">Pick Icon</Label>
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
