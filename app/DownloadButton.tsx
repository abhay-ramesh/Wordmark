import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DownloadButton() {
  return (
    <Button
      variant="action"
      className="fixed bottom-5 right-5 z-20 h-fit w-fit rounded-full p-4 "
    >
      <Download size={24} />
    </Button>
  );
}
