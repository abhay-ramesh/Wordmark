"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Credits({
  className,
  isMobileViewVisible = false,
}: {
  className?: string;
  isMobileViewVisible: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-fit px-8 text-center text-xs text-slate-800 [text-wrap:balance]",
        {
          "block rounded-md border bg-gray-800 py-2 text-slate-100 md:hidden":
            isMobileViewVisible,
          "absolute bottom-4 hidden md:block": !isMobileViewVisible,
        },
        className,
      )}
    >
      Created by{" "}
      <Link
        href="https://github.com/abhay-ramesh"
        className="text-red-400 underline"
      >
        Abhay Ramesh
      </Link>
      . Source code available on{" "}
      <Link
        href="https://github.com/abhay-ramesh/wordmark"
        className="text-red-400 underline"
      >
        GitHub
      </Link>
      .
    </div>
  );
}
