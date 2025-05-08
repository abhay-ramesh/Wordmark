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
    <div className="relative flex min-h-screen flex-col-reverse justify-end space-y-2 space-y-reverse p-4 md:h-screen md:space-y-0">
      {/* Invisible DownloadButton to initialize the download handler */}
      <DownloadButton invisible />

      {/* Desktop View - Resizable Layout */}
      <div className="hidden w-full md:block md:h-full">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full w-full rounded-lg border"
        >
          {/* Editor Panel */}
          <ResizablePanel defaultSize={40} minSize={30} className="h-full">
            <div className="flex h-full w-full flex-col">
              <div className="flex h-20 w-full flex-none flex-col items-center justify-center rounded-t-lg border-b bg-primary-foreground text-center text-gray-600 dark:text-gray-300">
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
            <div className="flex h-full w-full flex-col items-center justify-center bg-background p-4">
              <div className="flex flex-1 items-center justify-center">
                <DisplayCard />
              </div>
              <VersionHistoryWrapper />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile View - Stacked Layout */}
      <div className="flex w-full flex-col md:hidden">
        <div className="flex h-20 w-full flex-col items-center justify-center rounded-lg border bg-primary-foreground text-center">
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

        <aside className="mt-2 flex h-2/3 w-full flex-col">
          <Tabs
            orientation="vertical"
            defaultValue="text"
            className="flex h-full w-full flex-col rounded-lg border bg-muted/80"
          >
            <MenuList />
            <Separator orientation="horizontal" />
            <TextTab />
            <CardTab />
            <IconTab />
            <LayoutTab />
          </Tabs>
        </aside>

        <div className="relative mt-2 flex h-1/3 w-full flex-col items-center justify-center rounded-lg border p-4">
          <div className="flex w-full flex-1 items-center justify-center">
            <DisplayCard />
          </div>
          <VersionHistoryWrapper />
        </div>

        {/* Mobile GitHub star link */}
        <div className="mt-2 flex flex-row items-center justify-center rounded-lg border px-4 py-3">
          <a
            href="https://github.com/abhay-ramesh/wordmark"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs"
          >
            <Github size={16} className="mr-1" />
            <span>Star on GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
}
