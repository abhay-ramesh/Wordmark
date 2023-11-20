"use client";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toPng, toJpeg, toSvg } from "html-to-image";
import { useAtomValue } from "jotai";
import { cardAtom, layoutAtom } from "@/lib/statemanager";
import { event } from "nextjs-google-analytics";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Options } from "html-to-image/lib/types";
import posthog from "posthog-js";

const formats = ["png", "svg", "jpeg"] as const;

function toImage(
  format: (typeof formats)[number],
  node: HTMLElement,
  options?: Options,
) {
  switch (format) {
    case "png":
      return toPng(node, options);
    case "svg":
      return toSvg(node, options);
    case "jpeg":
      return toJpeg(node, options);
  }
}

export function DownloadButton() {
  const card = useAtomValue(cardAtom);

  const download = async (format: (typeof formats)[number]) => {
    if (typeof window === "undefined") return;
    const node = document.getElementById("display-card");
    if (!node) return;

    let dataUrl;

    dataUrl = await toImage(format, node, {
      cacheBust: true,
      pixelRatio: 6,
    });

    const link = document.createElement("a");
    link.download = `wordmark.${format}`;
    link.href = dataUrl;
    link.click();
    event("download", {
      category: "download",
      label: format,
      value: 1,
    });
    posthog.capture("download", {
      category: "download",
      format: format,
    });
    setTimeout(() => {
      node.classList.add("delayed-survey");
    }, 1000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="action"
          className="h-fit w-fit rounded-full p-4"
          name="Download"
        >
          <Download size={24} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex w-fit min-w-fit flex-col gap-2 border-none bg-transparent shadow-none">
        {formats.map((format, id) => (
          <DropdownMenuItem
            key={id}
            className="flex aspect-square w-full justify-center rounded-full border bg-popover p-2 text-center hover:bg-gray-100"
            onClick={() => download(format)}
          >
            {format.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
