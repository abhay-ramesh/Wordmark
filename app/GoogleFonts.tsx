"use client";
import { Aboreto } from "next/font/google";

export const GoogleFonts = () => {
  // const fontNames = Aboreto({
  //   weight: "400",
  // });

  // console.log(fontNames.className);

  return (
    <div className="grid w-full max-w-sm items-center gap-2">
      <div className="flex space-x-2">
        <label htmlFor="font">Font</label>
        {/* <select
          id="font"
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          {fontNames.map((fontName) => (
            <option
              key={fontName}
              value={fontName}
              // @ts-ignore
              className={gfonts[fontName].className ?? ""}
            >
              {fontName}
            </option>
          ))}
        </select> */}
      </div>
    </div>
  );
};
