"use client";
import { ColorPickerField } from "@/components/custom/ColorPickerField";
import { NumberInputWithSlider } from "@/components/custom/NumberInputWithSlider";
import { SectionHeader } from "@/components/custom/SectionHeader";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { textAtom } from "@/lib/statemanager";
import { useAtom } from "jotai";
import { SlidersHorizontal, Type } from "lucide-react";
import FontSelector from "../../components/custom/FontSelector";

export function TextTab() {
  const [textState, setTextState] = useAtom(textAtom);

  return (
    <TabsContent
      value="text"
      className="mt-0 h-full flex-1 overflow-hidden p-0"
    >
      <div className="flex h-full flex-col">
        {/* Text Content and Styling Section */}
        <div className="flex flex-none flex-col gap-4 border-b p-4">
          {/* Text Content Section */}
          <SectionHeader
            title="Text Content"
            icon={Type}
            badge={`${textState.text.length} characters`}
            description="This text will appear in your design based on the selected layout"
          />

          <Input
            id="text-content"
            type="text"
            placeholder="Enter your text here..."
            className="h-9 border-muted"
            value={textState.text}
            onChange={(e) =>
              setTextState((prev) => ({ ...prev, text: e.target.value }))
            }
            autoFocus
            aria-label="Text content for your design"
          />

          {/* Text Size & Color Section */}
          <SectionHeader
            title="Size & Color"
            icon={SlidersHorizontal}
            badge={`${textState.size}px`}
            className="pt-2"
          />

          <div className="grid gap-4">
            <NumberInputWithSlider
              id="font-size"
              label="Text Size"
              min={12}
              max={72}
              step={1}
              value={textState.size}
              unit="px"
              onChange={(value) =>
                setTextState((prev) => ({ ...prev, size: value }))
              }
            />

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                Text Color
              </label>
              <ColorPickerField
                color={textState.color}
                onChange={(color) =>
                  setTextState((prev) => ({ ...prev, color: color }))
                }
              />
            </div>
          </div>
        </div>

        {/* Font Selection Section */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-none border-b p-3">
            <SectionHeader
              title="Font Selection"
              description="Choose a font family to use in your design"
              icon={Type}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <FontSelector />
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
