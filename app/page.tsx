import { Separator } from "@/components/ui/separator";
import { Tabs } from "@/components/ui/tabs";
import { Units } from "@/lib/constants";
import { Boxes, DownloadCloud } from "lucide-react";
import { Credits } from "./Credits";
import { DisplayCard } from "./DisplayCard";
import { CardTab, IconTab, LayoutTab, MenuList, TextTab } from "./_tabs";
import { DownloadButton } from "./DownloadButton";

export type UnitType = (typeof Units)[number];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col-reverse justify-end space-y-2 space-y-reverse bg-muted p-4 md:h-screen md:flex-row md:space-x-2 md:space-y-0">
      <DownloadButton />
      <Credits isMobileViewVisible />
      <aside className="flex h-2/3 w-full flex-col md:h-full md:max-h-full md:w-2/5">
        <div className="hidden h-20 w-full flex-none items-center justify-center space-x-2 rounded-lg border bg-primary-foreground text-center text-gray-600 md:flex">
          <Boxes size={32} className="" />
          <text className="w-fit text-center text-2xl font-semibold [text-wrap:balance]">
            Wordmark.
          </text>
        </div>

        <Tabs
          orientation="vertical"
          defaultValue="text"
          className="mt-2 flex h-full w-full flex-col rounded-lg border md:max-h-full md:flex-1 md:flex-row md:overflow-auto"
        >
          <MenuList />
          <Separator orientation="vertical" className="hidden md:block" />
          <Separator orientation="horizontal" className="md:hidden" />
          {/* Text Tab Content */}
          <TextTab />
          {/* Color Tab Content */}
          <CardTab />
          {/* Icon Tab Content */}
          <IconTab />
          {/* Layout Tab Content */}
          <LayoutTab />
        </Tabs>
      </aside>
      <div className="relative flex h-1/3 w-full items-center justify-center rounded-lg border p-4 md:h-full">
        <DisplayCard />
        <Credits isMobileViewVisible={false} />
      </div>
      <div className="flex h-20 w-full items-center justify-center space-x-2 rounded-lg border bg-primary-foreground text-center text-gray-600 md:hidden">
        <Boxes size={32} className="" />
        <text className="w-fit text-center text-2xl font-semibold [text-wrap:balance]">
          Wordmark.
        </text>
      </div>
    </div>
  );
}
