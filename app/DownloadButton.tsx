"use client";
import { Button } from "@/components/ui/button";
import { cardAtom } from "@/lib/statemanager";
import { toJpeg, toPng, toSvg } from "html-to-image";
import { useAtomValue } from "jotai";
import { Download } from "lucide-react";
import { event } from "nextjs-google-analytics";
import { forwardRef, useEffect, useImperativeHandle } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Options } from "html-to-image/lib/types";
import posthog from "posthog-js";

const formats = ["png", "svg", "jpeg"] as const;
export type DownloadFormat = (typeof formats)[number];

// Create a global handler for download functionality
export const downloadHandler = {
  downloadFn: null as ((format: DownloadFormat) => Promise<void>) | null,

  // Method to trigger download
  download: async (format: DownloadFormat = "png") => {
    if (downloadHandler.downloadFn) {
      await downloadHandler.downloadFn(format);
    } else {
      console.warn("Download function not initialized yet");
    }
  },

  // Method to register the download function
  register: (fn: (format: DownloadFormat) => Promise<void>) => {
    downloadHandler.downloadFn = fn;
  },
};

function toImage(format: DownloadFormat, node: HTMLElement, options?: Options) {
  switch (format) {
    case "png":
      return toPng(node, options);
    case "svg":
      return toSvg(node, options);
    case "jpeg":
      return toJpeg(node, options);
  }
}

interface DownloadButtonProps {
  id?: string;
  invisible?: boolean;
}

export const DownloadButton = forwardRef<
  { download: (format: DownloadFormat) => Promise<void> },
  DownloadButtonProps
>(({ id, invisible = false }, ref) => {
  const card = useAtomValue(cardAtom);

  const handleDownload = async (format: DownloadFormat) => {
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

  // Expose the download method via ref
  useImperativeHandle(ref, () => ({
    download: handleDownload,
  }));

  // Register the download function globally on component mount
  useEffect(() => {
    downloadHandler.register(handleDownload);
    // No cleanup needed as we want the function to remain available
  }, []);

  if (invisible) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id={id}
          variant="action"
          className="p-4 rounded-full h-fit w-fit"
          name="Download"
        >
          <Download size={24} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex flex-col gap-2 bg-transparent border-none shadow-none w-fit min-w-fit">
        {formats.map((format, idx) => (
          <DropdownMenuItem
            key={idx}
            className="flex justify-center p-2 w-full text-center rounded-full border aspect-square bg-popover hover:bg-gray-100"
            onClick={() => handleDownload(format)}
          >
            {format.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

// Display name for React DevTools
DownloadButton.displayName = "DownloadButton";
