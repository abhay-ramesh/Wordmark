"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { TabsContent } from "@/components/ui/tabs";
import { textAtom } from "@/lib/statemanager";
import { useAtom } from "jotai";
import { Paintbrush } from "lucide-react";
import { ColorPicker } from "react-color-palette";
import FontSelector from "../../components/custom/FontSelector";

export function TextTab() {
  const [textState, setTextState] = useAtom(textAtom);

  return (
    <TabsContent value="text" className="w-full space-y-4 overflow-y-auto p-4">
      <div className="space-y-4 rounded-md border bg-card p-4 shadow-sm">
        <div className="grid w-full items-center gap-1.5">
          <Label
            htmlFor="business-name"
            className="text-sm text-muted-foreground"
          >
            Text
          </Label>
          <Input
            id="business-name"
            type="text"
            placeholder="Your Business Name"
            className="h-9"
            value={textState.text}
            onChange={(e) =>
              setTextState((prev) => ({ ...prev, text: e.target.value }))
            }
            autoFocus
          />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="font-size"
              className="text-sm text-muted-foreground"
            >
              Size
            </Label>
            <span className="text-xs text-muted-foreground">
              {textState.size}px
            </span>
          </div>
          <div className="flex gap-2">
            <Slider
              id="font-size"
              min={12}
              max={72}
              step={1}
              value={[textState.size]}
              onValueChange={(value) =>
                setTextState((prev) => ({ ...prev, size: value[0] }))
              }
              className="flex-1"
            />
            <Input
              id="font-size-input"
              type="number"
              className="h-8 w-16"
              value={textState.size}
              onChange={(e) => {
                const size = Number(e.target.value);
                if (size >= 12 && size <= 72) {
                  setTextState((prev) => ({
                    ...prev,
                    size,
                  }));
                }
              }}
            />
          </div>
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label
            htmlFor="font-color-picker"
            className="text-sm text-muted-foreground"
          >
            Color
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex h-9 w-full items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded-sm border"
                    style={{ backgroundColor: textState.color.hex }}
                  />
                  <span className="text-sm">{textState.color.hex}</span>
                </div>
                <Paintbrush className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-0">
              <ColorPicker
                color={textState.color}
                onChange={(color) =>
                  setTextState((prev) => ({ ...prev, color: color }))
                }
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="h-[calc(100%-12rem)]">
        <FontSelector />
      </div>
    </TabsContent>
  );
}
