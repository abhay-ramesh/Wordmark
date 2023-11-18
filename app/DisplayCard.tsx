"use client";
import { LayoutVariants } from "@/components/custom/SelectableLayoutCard";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIconStatic, LucideIconType } from "@/components/icons";
import { useAtomValue } from "jotai";
import {
  cardAtom,
  fontAtom,
  iconAtom,
  layoutAtom,
  textAtom,
} from "@/lib/statemanager";
import { FontLoader } from "@/lib/fonts";

export function DisplayCard() {
  const selectedFont = useAtomValue(fontAtom);
  const icon = useAtomValue(iconAtom);
  const layout = useAtomValue(layoutAtom);
  const card = useAtomValue(cardAtom);
  const textState = useAtomValue(textAtom);

  return (
    <div
      className={cn(
        LayoutVariants({ layout }),
        "m-0 h-fit w-fit max-w-full rounded-md bg-transparent p-0 shadow-2xl",
        {
          "rounded-full": layout === "circle",
        },
      )}
      style={{
        backgroundColor: card.color.hex,
      }}
    >
      <Card
        id="display-card"
        className={cn(
          LayoutVariants({ layout }),
          "m-0 h-full border-none shadow-none",
        )}
        // add height and width
        style={{
          backgroundColor: card.color.hex,
          height: card.height.value + card.height.unit,
          width: card.width.value + card.width.unit,
        }}
      >
        {layout !== "text" && (
          // <LucideIcon
          //   name={icon as LucideIconType}
          //   size={32}
          //   style={{ color: iconColor.hex }}
          // />
          <LucideIconStatic
            name={icon.icon as LucideIconType}
            size={icon.size}
            style={{ color: icon.color.hex }}
          />
        )}
        {layout !== "icon" && layout !== "circle" && (
          <>
            <text
              className={cn(
                "w-fit text-center text-2xl font-semibold text-gray-600 [text-wrap:balance]",
              )}
              style={{
                color: textState.color.hex,
                fontFamily: selectedFont?.family || undefined,
                fontSize: textState.size + "px",
              }}
            >
              {textState.text}
            </text>
            <FontLoader fonts={[{ font: selectedFont?.family || "" }]} />
          </>
        )}
      </Card>
    </div>
  );
}
