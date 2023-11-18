"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TabsContent } from "@/components/ui/tabs";
import { ColorPicker } from "react-color-palette";
import { IconSelector } from "@/components/icons/IconSelector";
import { LucideIconType } from "@/components/icons";
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
    <TabsContent value="icon" className="w-full space-y-2 overflow-y-auto p-3">
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
            onChange={(color) => setIcon((prev) => ({ ...prev, color: color }))}
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
  );
}
