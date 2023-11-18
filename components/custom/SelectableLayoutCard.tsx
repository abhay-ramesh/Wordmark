"use client";
import { LAYOUT_TYPES } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

export type Layouts = (typeof LAYOUT_TYPES)[number];

export const LayoutVariants = cva(
  "flex justify-center items-center p-3 text-gray-600",
  {
    variants: {
      layout: {
        ltr: "flex-row w-full space-x-4",
        rtl: "flex-row-reverse w-full space-x-4 space-x-reverse",
        ttd: "flex-col w-full space-y-2",
        dtt: "flex-col-reverse w-full space-y-2 space-y-reverse",
        text: "w-full",
        icon: "mx-auto border-dashed aspect-square w-fit",
        circle: "mx-auto border-dashed aspect-square rounded-full w-fit",
      },
      isSelected: {
        true: "ring-2 ring-blue-500 bg-blue-400 text-white",
        false: "",
      },
    },
    defaultVariants: {
      layout: "ltr",
      isSelected: false,
    },
  },
);

type SelectableLayoutCardProps = {
  layout: Layouts;
  isSelected: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export const SelectableLayoutCard = ({
  layout,
  isSelected,
  onClick,
}: SelectableLayoutCardProps) => {
  return (
    <Card
      className={cn(LayoutVariants({ layout, isSelected }))}
      onClick={onClick}
    >
      {layout !== "text" &&
        (layout !== "circle" ? (
          // Square
          <div className="aspect-square h-16 w-16 rounded-md bg-muted" />
        ) : (
          // Circle
          <div className="aspect-square h-16 w-16 rounded-full bg-muted" />
        ))}
      {layout !== "icon" && layout !== "circle" ? (
        // Rectangle
        <div className="h-10 w-28 rounded-md bg-muted" />
      ) : null}
    </Card>
  );
};
