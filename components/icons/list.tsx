import { LucideIconList } from "./LucideIcons";
import { TablerIconList } from "./TablerIcons";

// Now we make a json object with the icon name as key which is with 'Icon' and value without 'Icon'
const TablerIconListObject = TablerIconList.reduce(
  (obj, icon) => ({ ...obj, [icon]: icon.slice(4) }),
  {},
);

// Now we do the same for Lucide Icons
const LucideIconListObject = LucideIconList.reduce(
  (obj, icon) => ({ ...obj, [icon]: icon }),
  {},
);

// Now we merge the two objects
export const IconListUnsorted = {
  ...LucideIconListObject,
  ...TablerIconListObject,
};

// Now we sort the object by key alphabetically
export const IconList = Object.keys(IconListUnsorted)
  .sort()
  .reduce(
    (obj, key) => ({
      ...obj,
      // @ts-ignore
      [key]: IconListUnsorted[key],
    }),
    {},
  );
