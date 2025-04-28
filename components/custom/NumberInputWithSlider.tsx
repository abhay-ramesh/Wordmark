"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface NumberInputWithSliderProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  className?: string;
}

export function NumberInputWithSlider({
  id,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  unit = "",
  className,
}: NumberInputWithSliderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        {label && (
          <Label htmlFor={id} className="text-xs text-muted-foreground">
            {label}
          </Label>
        )}
        <div className="flex h-6 w-16 items-center justify-center rounded border border-muted-foreground/20 bg-muted/50 text-xs">
          {value}
          {unit}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Slider
          id={`${id}-slider`}
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          className="flex-1"
          aria-label={label || id}
        />
        <Input
          id={id}
          type="number"
          className="h-8 w-20 text-xs"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label || id}
        />
      </div>
    </div>
  );
}
