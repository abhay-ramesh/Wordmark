"use client";
import { LAYOUT_TYPES } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

export type Layouts = (typeof LAYOUT_TYPES)[number];

export const LayoutVariants = cva(
  "flex justify-center items-center h-40 p-3 text-gray-600",
  {
    variants: {
      layout: {
        ltr: "flex-row w-full space-x-4",
        rtl: "flex-row-reverse w-full space-x-4 space-x-reverse",
        ttd: "flex-col w-full space-y-2",
        dtt: "flex-col-reverse w-full space-y-2 space-y-reverse",
        icon: "mx-auto border-dashed aspect-square",
        text: "w-full",
        circle: "mx-auto border-dashed aspect-square rounded-full",
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
        ( layout !== "circle" ? (
          <div className="w-16 h-16 rounded-md aspect-square bg-muted" />
        ) : (
          <div className="w-16 h-16 rounded-full aspect-square bg-muted" />
        ))}
      {layout !== "icon" && layout !== "circle" ? (
        <div className="h-10 rounded-md w-28 bg-muted" />
      ) : null}
    </Card>
  );
};
