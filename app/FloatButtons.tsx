import { Button } from "@/components/ui/button";
import { DownloadButton } from "./DownloadButton";
import Link from "next/link";
import { ScrollText } from "lucide-react";
import { ModeToggle } from "@/components/ui/theme-button";

export function FloatButtons() {
  return (
    <div className="fixed bottom-5 right-5 z-20 flex flex-col items-center justify-end space-y-2">
      <ModeToggle />
      <DownloadButton />
      {/* <Link href="/feedback">
        <Button variant="outline" className="p-4 rounded-full h-fit w-fit">
          <ScrollText size={24} className="mr-2" />
          Feedback
        </Button>
      </Link> */}
    </div>
  );
}
