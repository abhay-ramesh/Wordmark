"use client";
import { LayoutVariants } from "@/components/custom/SelectableLayoutCard";
import { LucideIconStatic, LucideIconType } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { FontLoader } from "@/lib/fonts";
import {
  cardAtom,
  fontAtom,
  iconAtom,
  layoutAtom,
  textAtom,
} from "@/lib/statemanager";
import { cn } from "@/lib/utils";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";

export function DisplayCard() {
  const selectedFont = useAtomValue(fontAtom);
  const icon = useAtomValue(iconAtom);
  const layout = useAtomValue(layoutAtom);
  const card = useAtomValue(cardAtom);
  const [textState, setTextState] = useAtom(textAtom);

  const [fontCSS, setFontCSS] = useState<string | null>(null);

  const fetchFont = async (url: string) => {
    const res = await fetch(url);
    const fontCss = await res.text();
    return fontCss;
  };

  useEffect(() => {
    if (selectedFont?.menu) {
      fetchFont(
        "https://fonts.googleapis.com/css?family=" +
          selectedFont.family.replace(" ", "+"),
      ).then((fontCss) => {
        setFontCSS(fontCss);
      });
    }
  }, [selectedFont]);

  return (
    <div
      className={cn(
        LayoutVariants({ layout }),
        "display-card m-0 h-fit w-fit max-w-full rounded-md bg-transparent p-0 shadow-2xl",
        {
          "rounded-full": layout === "circle",
        },
      )}
      style={{
        backgroundColor: layout !== "circle" ? card.color.hex : "transparent",
      }}
    >
      <Card
        id="display-card"
        className={cn(
          LayoutVariants({ layout }),
          "m-0 h-full border-none shadow-none",
        )}
        style={{
          font: selectedFont?.family || undefined,
          fontFamily: selectedFont?.family || undefined,
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
            <div
              className={cn(
                "w-fit text-center text-2xl font-semibold text-gray-600 [text-wrap:balance]",
              )}
              style={{
                color: textState.color.hex,
                fontFamily: selectedFont?.family || undefined,
                fontSize: textState.size + "px",
              }}
              onBlur={(e) => {
                setTextState((prev) => ({
                  ...prev,
                  text: e.currentTarget.textContent || "",
                }));
              }}
              contentEditable={true}
              suppressContentEditableWarning={true}
            >
              {textState.text}
            </div>
            <FontLoader fonts={[{ font: selectedFont?.family || "" }]} />
          </>
        )}
        {selectedFont?.family && <style>{fontCSS}</style>}
      </Card>
    </div>
  );
}
