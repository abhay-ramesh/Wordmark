"use client";
import { downloadHandler } from "@/app/DownloadButton";
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
  Image,
  Layout,
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
    icon: <Image size={18} />,
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
    href: "https://github.com/Abhay2611/wordmark/issues",
  },
  {
    icon: <Download size={18} />,
    tooltip: "Download your design",
    action: "dropdown",
  },
  {
    icon: <Github size={18} />,
    tooltip: "Star on GitHub",
    action: "link",
    href: "https://github.com/abhay-ramesh/wordmark",
  },
];

export const MenuList = () => {
  return (
    <TabsList className="flex flex-col justify-between px-1 w-full rounded-none border-b shadow-sm backdrop-blur-sm transition-all duration-300 h-fit bg-background/40 sm:rounded-l-md sm:rounded-r-none md:h-full md:w-fit md:border-b-0 md:border-r">
      {/* Main menu items */}
      <div className="flex justify-evenly py-1 w-full md:flex-col md:space-y-1">
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
      <Separator className="hidden mx-auto my-1 w-10 opacity-30 md:block" />

      {/* Utility buttons */}
      <div className="hidden w-full md:flex md:flex-col md:pb-2">
        <TooltipProvider delayDuration={200}>
          <div className="flex flex-col items-center mt-1 space-y-1">
            {utilityItems.map((item, idx) => (
              <div key={idx} className="flex justify-center w-full">
                {item.action === "dropdown" ? (
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger className="flex justify-center items-center w-9 h-9 rounded-lg transition-all duration-200 text-muted-foreground hover:bg-accent/20 hover:text-foreground">
                          {item.icon}
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        align="center"
                        className="max-w-[200px] bg-background/90 text-xs backdrop-blur-sm"
                      >
                        {item.tooltip}
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent
                      align="center"
                      side="right"
                      className="backdrop-blur-sm bg-background/90"
                    >
                      {["PNG", "SVG", "JPEG"].map((format, i) => (
                        <DropdownMenuItem
                          key={i}
                          onClick={() =>
                            downloadHandler.download(
                              format.toLowerCase() as any,
                            )
                          }
                          className="cursor-pointer px-3 py-1.5 text-xs transition-colors hover:bg-accent/20"
                        >
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
                          className="flex justify-center items-center w-9 h-9 rounded-lg transition-all duration-200 text-muted-foreground hover:bg-accent/20 hover:text-foreground"
                        >
                          {item.icon}
                        </a>
                      ) : (
                        <div className="flex justify-center items-center w-9 h-9 rounded-lg transition-all duration-200 text-muted-foreground hover:bg-accent/20 hover:text-foreground">
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
