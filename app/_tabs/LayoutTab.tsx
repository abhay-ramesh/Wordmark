"use client";
import { SelectableLayoutCard } from "@/components/custom/SelectableLayoutCard";
import { TabsContent } from "@/components/ui/tabs";
import { LAYOUT_TYPES } from "@/lib/constants";
import { useAtom } from "jotai";
import { layoutAtom } from "@/lib/statemanager";

export function LayoutTab() {
  const [layout, setLayout] = useAtom(layoutAtom);
  return (
    <TabsContent
      id="layout"
      value="layout"
      className="w-full overflow-y-auto p-3"
    >
      <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-1">
        {LAYOUT_TYPES.map((layoutType) => (
          <SelectableLayoutCard
            key={layoutType}
            layout={layoutType}
            isSelected={layoutType === layout}
            onClick={() => setLayout(layoutType)}
          />
        ))}
      </div>
    </TabsContent>
  );
}
