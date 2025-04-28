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
      className="overflow-hidden flex-1 p-0 mt-0 h-full"
    >
      <div className="flex flex-col h-full">
        {/* Text Content and Styling Section */}
        <div className="flex flex-col flex-none gap-4 p-4 border-b">
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
        <div className="flex overflow-hidden flex-col flex-1 min-h-0">
          <div className="flex-none p-3 border-b">
            <SectionHeader
              title="Font Selection"
              description="Choose a font family from the available providers"
            />
          </div>
          <div className="overflow-hidden flex-1">
            <FontSelector />
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
