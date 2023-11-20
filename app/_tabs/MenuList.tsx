"use client";
import { Separator } from "@/components/ui/separator";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Box,
  BoxSelect,
  CaseSensitive,
  CircuitBoard,
  FoldHorizontal,
  FolderHeart,
  LayoutDashboard,
  Palette,
} from "lucide-react";

const menuItems = [
  {
    name: "text",
    icon: <CaseSensitive size={32} />,
    label: "Text",
  },
  {
    name: "icon",
    icon: <FolderHeart size={32} />,
    label: "Icon",
  },
  {
    name: "card",
    icon: <CircuitBoard size={32} />,
    label: "Card",
  },
  // {
  //   name: "space",
  //   icon: <FoldHorizontal size={32} />,
  //   label: "Space",
  // },
  {
    name: "layout",
    icon: <LayoutDashboard size={32} />,
    label: "Layout",
  },
];

export const MenuList = () => {
  return (
    <TabsList className="flex h-fit w-full justify-start overflow-x-auto rounded-b-none sm:rounded-l-md sm:rounded-r-none md:h-full md:w-fit md:flex-col md:overflow-x-visible">
      {menuItems.map((item, id) => (
        <div key={id} className="w-full">
          <TabsTrigger
            className="flex aspect-square h-20 w-full flex-col items-center justify-center space-y-2 p-2 md:w-20"
            value={item.name}
          >
            {item.icon}
            <text className="text-xs font-semibold ">{item.label}</text>
          </TabsTrigger>

          <Separator orientation="vertical" className="md:hidden" />
          <Separator orientation="horizontal" className="hidden md:block" />
        </div>
      ))}
    </TabsList>
  );
};
