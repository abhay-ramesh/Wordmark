"use client";
import { ColorPickerField } from "@/components/custom/ColorPickerField";
import { NumberInputWithSlider } from "@/components/custom/NumberInputWithSlider";
import { SectionHeader } from "@/components/custom/SectionHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { textAtom } from "@/lib/statemanager";
import { useAtom } from "jotai";
import { SlidersHorizontal, Type } from "lucide-react";
import FontSelector from "../../components/custom/FontSelector";

export function TextTab() {
  const [textState, setTextState] = useAtom(textAtom);

  const fontWeightOptions = [
    { value: "thin", label: "Thin (100)" },
    { value: "extralight", label: "Extra Light (200)" },
    { value: "light", label: "Light (300)" },
    { value: "regular", label: "Regular (400)" },
    { value: "medium", label: "Medium (500)" },
    { value: "semibold", label: "Semi Bold (600)" },
    { value: "bold", label: "Bold (700)" },
    { value: "extrabold", label: "Extra Bold (800)" },
    { value: "black", label: "Black (900)" },
  ];

  const textTransformOptions = [
    { value: "none", label: "None" },
    { value: "uppercase", label: "UPPERCASE" },
    { value: "lowercase", label: "lowercase" },
    { value: "capitalize", label: "Capitalize" },
  ];

  return (
    <TabsContent
      value="text"
      className="mt-0 h-full flex-1 overflow-y-auto p-0"
    >
      <div className="flex flex-col">
        <div className="flex flex-col gap-4 border-b p-4">
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

          <SectionHeader title="Typography" icon={Type} className="pt-2" />

          <div className="grid gap-4">
            <NumberInputWithSlider
              id="line-height"
              label="Line Height"
              min={0.8}
              max={3}
              step={0.1}
              value={textState.lineHeight}
              onChange={(value) =>
                setTextState((prev) => ({ ...prev, lineHeight: value }))
              }
            />

            <NumberInputWithSlider
              id="letter-spacing"
              label="Letter Spacing"
              min={-5}
              max={20}
              step={0.5}
              value={textState.letterSpacing}
              unit="px"
              onChange={(value) =>
                setTextState((prev) => ({ ...prev, letterSpacing: value }))
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Font Weight
                </Label>
                <Select
                  value={textState.fontWeight}
                  onValueChange={(value) =>
                    setTextState((prev) => ({ ...prev, fontWeight: value }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select weight" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontWeightOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Text Transform
                </Label>
                <Select
                  value={textState.textTransform}
                  onValueChange={(value) =>
                    setTextState((prev) => ({
                      ...prev,
                      textTransform: value as
                        | "none"
                        | "uppercase"
                        | "lowercase"
                        | "capitalize",
                    }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select transform" />
                  </SelectTrigger>
                  <SelectContent>
                    {textTransformOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-none border-b p-3">
            <SectionHeader
              title="Font Selection"
              description="Choose a font family to use in your design"
              icon={Type}
            />
          </div>
          <div className="flex-1 overflow-auto">
            <FontSelector className="max-h-96" />
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
