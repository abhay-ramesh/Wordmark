"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TabsContent } from "@/components/ui/tabs";
import { ColorPicker } from "react-color-palette";
import { FontSelector } from "../../components/custom/FontSelector";
import { useAtom } from "jotai";
import { textAtom } from "@/lib/statemanager";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function TextTab() {
  const [textState, setTextState] = useAtom(textAtom);

  return (
    <TabsContent value="text" className="w-full space-y-5 overflow-y-auto p-3">
      <div className="grid w-full max-w-sm items-center gap-2">
        <Label htmlFor="business-name">Type your logo name</Label>
        <Input
          id="business-name"
          type="text"
          placeholder="Your Business Name"
          className="border-2 border-blue-500"
          value={textState.text}
          onChange={(e) =>
            setTextState((prev) => ({ ...prev, text: e.target.value }))
          }
          autoFocus
        />
      </div>

      {/* Set Font Size */}
      <div className="grid w-full max-w-sm items-center gap-2">
        <Label htmlFor="font-size">Set Font Size</Label>
        <Slider
          id="font-size"
          min={12}
          max={72}
          step={1}
          value={[textState.size]}
          onValueChange={(value) =>
            setTextState((prev) => ({ ...prev, size: value[0] }))
          }
          className="py-4"
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
      <div className="grid w-full max-w-sm items-center gap-2">
        <Label htmlFor="font-color-picker">Set Font Color</Label>
        {/* <input type="color" id="font-color-picker" className="" /> */}
        {/* <Popover>
          <PopoverTrigger asChild>
            <div>
              <Button
                variant="outline"
                className="flex items-center justify-between p-0 w-fit"
              >
                <span className="px-2">Pick Font Color</span>
                <div
                  className="inline-block h-full aspect-square rounded-r-md"
                  style={{ backgroundColor: textState.color.hex }}
                />
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-fit bg-primary-foreground"> */}
        <ColorPicker
          color={textState.color}
          onChange={(color) =>
            setTextState((prev) => ({ ...prev, color: color }))
          }
        />
        {/* </PopoverContent>
        </Popover> */}
      </div>

      {/* Pick Font */}
      <FontSelector />
    </TabsContent>
  );
}
