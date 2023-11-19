import { Button } from "@/components/ui/button";
import { DownloadButton } from "./DownloadButton";
import Link from "next/link";
import { ScrollText } from "lucide-react";

export function FloatButtons() {
  return (
    <div className="fixed bottom-5 right-5 z-20 flex flex-col items-end justify-end space-y-2">
      <DownloadButton />
      <Link href="/feedback">
        <Button variant="outline" className="h-fit w-fit rounded-full p-4">
          <ScrollText size={24} className="mr-2" />
          Feedback
        </Button>
      </Link>
    </div>
  );
}
