import data from "@/data/fonts.json";
import { ValueOf } from "next/dist/shared/lib/constants";
import GoogleFontLoader, {
  GoogleFontLoaderProps,
} from "react-google-font-loader";

export interface FontFiles {
  regular: string;
  italic?: string;
  bold?: string;
  // Add more variants as needed
}

export interface FontItem {
  family: string;
  variants: string[];
  subsets: string[];
  version: string;
  lastModified: string;
  files: FontFiles;
  category: string;
  kind: string;
  menu: string;
}

interface WebfontList {
  kind: string;
  items: FontItem[];
}

// Example usage:
const webfontList: WebfontList = data as WebfontList;

// Get the values of the `family` property of each item in the `items` array
type Fonts = Array<ValueOf<FontItem["family"]>>;

const FontLoader: React.FC<GoogleFontLoaderProps> = (props) => {
  // if window is undefined, we're on the server
  if (typeof window === "undefined") return null;
  return GoogleFontLoader(props);
};

export { FontLoader };

export const fontList = webfontList.items;
