import { Boxes } from "lucide-react";
import Link from "next/link";

export default function Feedback() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <div className="h-fit w-full px-4 pb-2 pt-4">
        <Link
          href="/"
          className="flex h-20 w-full max-w-sm items-center justify-center space-x-2 rounded-lg border bg-primary-foreground text-center text-gray-600"
        >
          <Boxes size={32} className="" />
          <text className="w-fit text-center text-2xl font-semibold [text-wrap:balance]">
            Wordmark.
          </text>
        </Link>
      </div>
      <iframe
        src="https://docs.google.com/forms/d/e/1FAIpQLScwcbwaTh_ziNESmAKKmflXsExTpU115_qknlTmL4fk_vz97g/viewform?embedded=true"
        // width="640"
        // height="3001"
        className="h-full w-full overflow-y-auto"
      >
        Loading…
      </iframe>
    </div>
  );
}
