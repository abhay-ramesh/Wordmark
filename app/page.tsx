import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs } from "@/components/ui/tabs";
import { Units } from "@/lib/constants";
import { Boxes, Github } from "lucide-react";
import { CardTab, IconTab, LayoutTab, MenuList, TextTab } from "./_tabs";
import { DisplayCard } from "./DisplayCard";
import { DownloadButton } from "./DownloadButton";
import { VersionHistoryWrapper } from "./VersionHistoryWrapper";

export type UnitType = (typeof Units)[number];

export default function Home() {
  return (
    <div className="flex relative flex-col-reverse justify-end p-4 space-y-2 space-y-reverse min-h-screen md:h-screen md:space-y-0">
      {/* Invisible DownloadButton to initialize the download handler */}
      <DownloadButton invisible />

      {/* Desktop View - Resizable Layout */}
      <div className="hidden w-full md:block md:h-full">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full h-full rounded-lg border"
        >
          {/* Editor Panel */}
          <ResizablePanel defaultSize={40} minSize={30} className="h-full">
            <div className="flex flex-col w-full h-full">
              <div className="flex flex-col flex-none justify-center items-center w-full h-20 text-center text-gray-600 rounded-t-lg border-b bg-primary-foreground dark:text-gray-300">
                <div className="flex items-center">
                  <Boxes size={32} />
                  <span className="ml-2 text-center text-2xl font-semibold [text-wrap:balance]">
                    Wordmark.
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Created by{" "}
                  <a
                    href="https://github.com/abhay-ramesh"
                    className="text-primary hover:underline"
                  >
                    Abhay Ramesh
                  </a>
                </div>
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
            <div className="flex flex-col justify-center items-center p-4 w-full h-full bg-background">
              <div className="flex flex-1 justify-center items-center">
                <DisplayCard />
              </div>
              <VersionHistoryWrapper />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile View - Stacked Layout */}
      <div className="flex flex-col w-full md:hidden">
        <div className="flex flex-col justify-center items-center w-full h-20 text-center rounded-lg border bg-primary-foreground">
          <div className="flex items-center">
            <Boxes size={28} />
            <span className="ml-2 text-center text-xl font-semibold [text-wrap:balance]">
              Wordmark.
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Created by{" "}
            <a
              href="https://github.com/abhay-ramesh"
              className="text-primary hover:underline"
            >
              Abhay Ramesh
            </a>
          </div>
        </div>

        <aside className="flex flex-col mt-2 w-full h-2/3">
          <Tabs
            orientation="vertical"
            defaultValue="text"
            className="flex flex-col w-full h-full rounded-lg border bg-muted/80"
          >
            <MenuList />
            <Separator orientation="horizontal" />
            <TextTab />
            <CardTab />
            <IconTab />
            <LayoutTab />
          </Tabs>
        </aside>

        <div className="flex relative flex-col justify-center items-center p-4 mt-2 w-full h-1/3 rounded-lg border">
          <div className="flex flex-1 justify-center items-center w-full">
            <DisplayCard />
          </div>
          <VersionHistoryWrapper />
        </div>

        {/* Mobile GitHub star link */}
        <div className="flex flex-row justify-center items-center px-4 py-3 mt-2 rounded-lg border">
          <a
            href="https://github.com/Abhay2611/wordmark"
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-1 items-center text-xs"
          >
            <Github size={16} className="mr-1" />
            <span>Star on GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
}
