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
    icon: <Type size={20} />,
    label: "Text",
    description: "Customize your text content, font, size, and color",
  },
  {
    name: "icon",
    icon: <Image size={20} />,
    label: "Icon",
    description: "Choose and customize an icon for your design",
  },
  {
    name: "card",
    icon: <Square size={20} />,
    label: "Card",
    description: "Set background color and dimensions of your design",
  },
  {
    name: "layout",
    icon: <Layout size={20} />,
    label: "Layout",
    description: "Choose how text and icon are arranged in your design",
  },
];

export const MenuList = () => {
  return (
    <TabsList className="flex h-fit w-full flex-col justify-between rounded-none border-b bg-background/40 px-2 sm:rounded-l-md sm:rounded-r-none md:h-full md:w-fit md:border-b-0 md:border-r">
      {/* Main menu items */}
      <div className="flex w-full justify-evenly md:flex-col">
        <TooltipProvider delayDuration={300}>
          {menuItems.map((item, id) => (
            <div key={id} className="flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    className="flex h-14 w-full flex-col items-center justify-center gap-2 rounded-sm px-2 py-3 data-[state=active]:bg-accent/30 data-[state=active]:shadow-none md:h-16 md:w-16"
                    value={item.name}
                  >
                    <div className="flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-xs font-medium">{item.label}</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  align="center"
                  className="max-w-[200px]"
                >
                  {item.description}
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
        </TooltipProvider>
      </div>

      {/* Separator between main menu and utility buttons */}
      <Separator className="my-2 hidden md:block" />

      {/* Utility buttons */}
      <div className="hidden w-full md:flex md:flex-col">
        <TooltipProvider delayDuration={300}>
          {/* Theme toggle */}
          <div className="mb-2 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent/50">
                  <ModeToggle minimal />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="center"
                className="max-w-[200px]"
              >
                Toggle dark mode
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Feedback button */}
          <div className="mb-2 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://github.com/Abhay2611/wordmark/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent/50"
                >
                  <MessageCircle size={20} className="text-foreground" />
                </a>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="center"
                className="max-w-[200px]"
              >
                Give feedback
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Download button */}
          <div className="mb-2 flex justify-center">
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent/50">
                    <Download size={20} className="text-foreground" />
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  align="center"
                  className="max-w-[200px]"
                >
                  Download your design
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="center" side="right">
                <DropdownMenuItem
                  onClick={() => downloadHandler.download("png")}
                >
                  PNG
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => downloadHandler.download("svg")}
                >
                  SVG
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => downloadHandler.download("jpeg")}
                >
                  JPEG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* GitHub star button */}
          <div className="mb-2 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://github.com/Abhay2611/wordmark"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent/50"
                >
                  <Github size={20} className="text-foreground" />
                </a>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="center"
                className="max-w-[200px]"
              >
                Star on GitHub
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </TabsList>
  );
};
