"use client";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Image, Layout, Square, Type } from "lucide-react";

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
    <TabsList className="flex h-fit w-full justify-evenly rounded-none border-b bg-background/40 px-2 sm:rounded-l-md sm:rounded-r-none md:h-full md:w-fit md:flex-col md:border-b-0 md:border-r">
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
    </TabsList>
  );
};
