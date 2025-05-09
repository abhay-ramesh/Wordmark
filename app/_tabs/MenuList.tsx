"use client";
import { downloadHandler, useDownloadStore } from "@/app/DownloadButton";
import { restartOnboarding } from "@/components/Onboarding";
import { ShortcutsHelp } from "@/components/ShortcutsHelp";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModeToggle } from "@/components/ui/theme-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Download,
  Github,
  HelpCircle,
  Image as ImageIcon,
  Keyboard,
  Layout,
  Loader2,
  MessageCircle,
  Square,
  Type,
} from "lucide-react";

// Main navigation items
const menuItems = [
  {
    name: "text",
    icon: <Type size={18} />,
    label: "Text",
    description: "Customize your text content, font, size, and color",
  },
  {
    name: "icon",
    icon: <ImageIcon size={18} />,
    label: "Icon",
    description: "Choose and customize an icon for your design",
  },
  {
    name: "card",
    icon: <Square size={18} />,
    label: "Card",
    description: "Set background color and dimensions of your design",
  },
  {
    name: "layout",
    icon: <Layout size={18} />,
    label: "Layout",
    description: "Choose how text and icon are arranged in your design",
  },
];

const utilityItems = [
  {
    icon: <ModeToggle minimal />,
    tooltip: "Toggle dark mode",
    action: "component",
  },
  {
    icon: <MessageCircle size={18} />,
    tooltip: "Give feedback",
    action: "link",
    href: "https://github.com/abhay-ramesh/wordmark/issues",
  },
  {
    icon: <Keyboard size={18} />,
    tooltip: "Keyboard shortcuts",
    action: "custom",
    component: <ShortcutsHelp />,
  },
  {
    icon: <Download size={18} />,
    tooltip: "Download your design",
    action: "dropdown",
  },
  {
    icon: <HelpCircle size={18} />,
    tooltip: "Show Tutorial",
    action: "function",
    onClick: restartOnboarding,
  },
  {
    icon: <Github size={18} />,
    tooltip: "Star on GitHub",
    action: "link",
    href: "https://github.com/abhay-ramesh/wordmark",
  },
];

export const MenuList = () => {
  const { isLoading, currentFormat } = useDownloadStore();

  return (
    <TabsList className="flex h-fit w-full flex-col justify-between rounded-none border-b bg-background/40 px-1 shadow-sm backdrop-blur-sm transition-all duration-300 sm:rounded-l-md sm:rounded-r-none md:h-full md:w-fit md:border-b-0 md:border-r">
      {/* Main menu items */}
      <div className="flex w-full justify-evenly py-1 md:flex-col md:space-y-1">
        <TooltipProvider delayDuration={200}>
          {menuItems.map((item, id) => (
            <div key={id} className="flex-1 md:py-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    className="flex h-12 w-full flex-col items-center justify-center gap-2 
                    rounded-lg px-2 py-2 transition-all duration-200 
                    hover:bg-accent/20 data-[state=active]:translate-x-[2px] 
                    data-[state=active]:bg-accent/40 data-[state=active]:shadow-sm 
                    md:h-14 md:w-14"
                    value={item.name}
                    data-tab={item.name}
                  >
                    <div
                      className="flex items-center justify-center 
                                    text-muted-foreground transition-colors
                                    duration-200 data-[state=active]:text-foreground"
                    >
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-medium opacity-80">
                      {item.label}
                    </span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  align="center"
                  className="max-w-[200px] bg-background/90 text-xs backdrop-blur-sm"
                >
                  {item.description}
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
        </TooltipProvider>
      </div>

      {/* Separator between main menu and utility buttons */}
      <Separator className="mx-auto my-1 hidden w-10 opacity-30 md:block" />

      {/* Utility buttons */}
      <div className="hidden w-full md:flex md:flex-col md:pb-2">
        <TooltipProvider delayDuration={200}>
          <div className="mt-1 flex flex-col items-center space-y-1">
            {utilityItems.map((item, idx) => (
              <div key={idx} className="flex w-full justify-center">
                {item.action === "dropdown" ? (
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-accent/20 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            item.icon
                          )}
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        align="center"
                        className="max-w-[200px] bg-background/90 text-xs backdrop-blur-sm"
                      >
                        {isLoading ? "Processing download..." : item.tooltip}
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent
                      align="center"
                      side="right"
                      className="bg-background/90 backdrop-blur-sm"
                    >
                      {["PNG", "SVG", "JPEG"].map((format, i) => (
                        <DropdownMenuItem
                          key={i}
                          onClick={() =>
                            downloadHandler.download(
                              format.toLowerCase() as any,
                            )
                          }
                          className="cursor-pointer px-3 py-1.5 text-xs transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isLoading}
                        >
                          {isLoading &&
                          currentFormat === format.toLowerCase() ? (
                            <Loader2 size={14} className="mr-1 animate-spin" />
                          ) : null}
                          {format}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {item.action === "link" ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-accent/20 hover:text-foreground"
                        >
                          {item.icon}
                        </a>
                      ) : item.action === "custom" ? (
                        item.component
                      ) : item.action === "function" ? (
                        <button
                          onClick={item.onClick}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-accent/20 hover:text-foreground"
                        >
                          {item.icon}
                        </button>
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-accent/20 hover:text-foreground">
                          {item.icon}
                        </div>
                      )}
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      align="center"
                      className="max-w-[200px] bg-background/90 text-xs backdrop-blur-sm"
                    >
                      {item.tooltip}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </TabsList>
  );
};
