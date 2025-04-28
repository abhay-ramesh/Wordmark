import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs } from "@/components/ui/tabs";
import { Units } from "@/lib/constants";
import { Boxes } from "lucide-react";
import { CardTab, IconTab, LayoutTab, MenuList, TextTab } from "./_tabs";
import { Credits } from "./Credits";
import { DisplayCard } from "./DisplayCard";
import { FloatButtons } from "./FloatButtons";

export type UnitType = (typeof Units)[number];

export default function Home() {
  return (
    <div className="flex relative flex-col-reverse justify-end p-4 space-y-2 space-y-reverse min-h-screen md:h-screen md:space-y-0">
      <FloatButtons />
      <Credits isMobileViewVisible />

      {/* Desktop View - Resizable Layout */}
      <div className="hidden w-full md:block md:h-full">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full h-full rounded-lg border"
        >
          {/* Editor Panel */}
          <ResizablePanel defaultSize={40} minSize={30} className="h-full">
            <div className="flex flex-col w-full h-full">
              <div className="flex flex-none justify-center items-center space-x-2 w-full h-20 text-center text-gray-600 rounded-t-lg border-b bg-primary-foreground dark:text-gray-300">
                <Boxes size={32} className="" />
                <text className="w-fit text-center text-2xl font-semibold [text-wrap:balance]">
                  Wordmark.
                </text>
              </div>

              <Tabs
                orientation="vertical"
                defaultValue="text"
                className="flex h-[calc(100%-5rem)] w-full flex-col bg-muted/80 md:flex-row md:overflow-auto"
              >
                <MenuList />
                <Separator orientation="vertical" className="hidden md:block" />
                <Separator orientation="horizontal" className="md:hidden" />
                {/* Tab Contents */}
                <TextTab />
                <CardTab />
                <IconTab />
                <LayoutTab />
              </Tabs>
            </div>
          </ResizablePanel>

          {/* Resizable Handle */}
          <ResizableHandle withHandle />

          {/* Preview Panel */}
          <ResizablePanel defaultSize={60}>
            <div className="flex justify-center items-center p-4 w-full h-full bg-background">
              <DisplayCard />
              <Credits isMobileViewVisible={false} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile View - Stacked Layout */}
      <div className="flex flex-col w-full md:hidden">
        <aside className="flex flex-col w-full h-2/3">
          <Tabs
            orientation="vertical"
            defaultValue="text"
            className="flex flex-col mt-2 w-full h-full rounded-lg border bg-muted/80"
          >
            <MenuList />
            <Separator orientation="horizontal" />
            <TextTab />
            <CardTab />
            <IconTab />
            <LayoutTab />
          </Tabs>
        </aside>

        <div className="flex relative justify-center items-center p-4 mt-2 w-full h-1/3 rounded-lg border">
          <DisplayCard />
          <Credits isMobileViewVisible={false} />
        </div>

        <div className="flex justify-center items-center mt-2 space-x-2 w-full h-20 text-center rounded-lg border bg-primary-foreground">
          <Boxes size={32} className="" />
          <text className="w-fit text-center text-2xl font-semibold [text-wrap:balance]">
            Wordmark.
          </text>
        </div>
      </div>
    </div>
  );
}
