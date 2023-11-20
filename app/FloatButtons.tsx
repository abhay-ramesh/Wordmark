import { DownloadButton } from "./DownloadButton";
import { ModeToggle } from "@/components/ui/theme-button";

export function FloatButtons() {
  return (
    <div className="fixed bottom-5 right-5 z-20 flex flex-col items-center justify-end space-y-2">
      <ModeToggle />
      <DownloadButton />
    </div>
  );
}
