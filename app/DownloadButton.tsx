"use client";
import { Button } from "@/components/ui/button";
import { cardAtom, textAtom } from "@/lib/statemanager";
import { toJpeg, toPng, toSvg } from "html-to-image";
import { atom, useAtom, useAtomValue } from "jotai";
import { Download, Loader2 } from "lucide-react";
import { event } from "nextjs-google-analytics";
import { forwardRef, useEffect, useImperativeHandle } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { Options } from "html-to-image/lib/types";
import posthog from "posthog-js";

const formats = ["png", "svg", "jpeg"] as const;
export type DownloadFormat = (typeof formats)[number];

// Create download state with Jotai
interface DownloadState {
  isLoading: boolean;
  currentFormat: DownloadFormat | null;
}

const downloadStateAtom = atom<DownloadState>({
  isLoading: false,
  currentFormat: null,
});

export const useDownloadStore = () => {
  const [downloadState, setDownloadState] = useAtom(downloadStateAtom);

  const setLoading = (
    isLoading: boolean,
    format: DownloadFormat | null = null,
  ) => {
    setDownloadState({ isLoading, currentFormat: format });
  };

  return {
    ...downloadState,
    setLoading,
  };
};

// Create a global handler for download functionality
export const downloadHandler = {
  downloadFn: null as ((format: DownloadFormat) => Promise<void>) | null,

  // Method to trigger download
  download: async (format: DownloadFormat = "png") => {
    // Since we can't use hooks here, we'll use the toast directly
    // and let the component handle its own loading state
    toast({
      title: "Processing download",
      description: `Preparing your ${format.toUpperCase()} file...`,
    });

    try {
      if (downloadHandler.downloadFn) {
        await downloadHandler.downloadFn(format);
      } else {
        console.warn("Download function not initialized yet");
        toast({
          variant: "destructive",
          title: "Download failed",
          description: "There was an error preparing your download.",
        });
      }
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "There was an error generating your file.",
      });
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
  const textState = useAtomValue(textAtom);
  const { isLoading, currentFormat, setLoading } = useDownloadStore();

  const handleDownload = async (format: DownloadFormat) => {
    if (isLoading) return;

    setLoading(true, format);
    if (typeof window === "undefined") return;
    const node = document.getElementById("display-card");
    if (!node) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Unable to find the content to download.",
      });
      setLoading(false);
      return;
    }

    let dataUrl;

    try {
      dataUrl = await toImage(format, node, {
        cacheBust: true,
        pixelRatio: 6,
      });

      // Create a sanitized filename with the text content
      const timestamp = new Date().toISOString().replace(/:/g, "");
      const textContent = textState.text.trim();
      // Sanitize text for use in filename (remove invalid chars)
      const sanitizedText = textContent
        ? textContent.replace(/[/\\?%*:|"<>]/g, "-").substring(0, 30)
        : "wordmark";

      const filename = `${sanitizedText} - wordmark - ${timestamp}.${format}`;

      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();

      toast({
        title: "Download complete",
        description: `Your ${format.toUpperCase()} file has been downloaded.`,
      });

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
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "There was an error generating your file.",
      });
    } finally {
      setLoading(false);
    }
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
      <DropdownMenuTrigger asChild disabled={isLoading}>
        <Button
          id={id}
          variant="action"
          className="h-fit w-fit rounded-full p-4"
          name="Download"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <Download size={24} />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex w-fit min-w-fit flex-col gap-2 border-none bg-transparent shadow-none">
        {formats.map((format, idx) => (
          <DropdownMenuItem
            key={idx}
            className="flex aspect-square w-full justify-center rounded-full border bg-popover p-2 text-center hover:bg-gray-100"
            onClick={() => handleDownload(format)}
            disabled={isLoading}
          >
            {isLoading && currentFormat === format ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              format.toUpperCase()
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

// Display name for React DevTools
DownloadButton.displayName = "DownloadButton";
