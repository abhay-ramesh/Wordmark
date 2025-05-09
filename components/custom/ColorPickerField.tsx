"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Paintbrush } from "lucide-react";
import { ColorPicker, IColor } from "react-color-palette";

interface ColorPickerFieldProps {
  color: IColor;
  onChange: (color: IColor) => void;
  label?: string;
  className?: string;
}

export function ColorPickerField({
  color,
  onChange,
  label,
  className,
}: ColorPickerFieldProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex h-9 w-full items-center justify-between border-muted",
            className,
          )}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-6 rounded-md border"
              style={{ backgroundColor: color.hex }}
            />
            <span className="text-sm">{color.hex}</span>
          </div>
          <Paintbrush className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-2" align="center">
        <Card className="border-dashed p-2">
          <div className="rcp-custom-wrapper">
            <ColorPicker color={color} onChange={onChange} />
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
