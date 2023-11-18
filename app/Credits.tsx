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
        "mx-auto flex w-fit flex-col items-center justify-center gap-4 space-y-4 px-8 text-center text-xs text-slate-800 [text-wrap:balance] sm:py-0",
        {
          "block rounded-md border bg-gray-800 py-2 text-slate-100 md:hidden":
            isMobileViewVisible,
          "absolute bottom-4 hidden md:block": !isMobileViewVisible,
        },
        className,
      )}
    >
      <Link
        href="https://www.producthunt.com/posts/wordmark-7584b39f-f3da-41d9-aedf-18c59cf1228e?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-wordmark&#0045;7584b39f&#0045;f3da&#0045;41d9&#0045;aedf&#0045;18c59cf1228e"
        target="_blank"
        className="flex w-full justify-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=425883&theme=light"
          alt="Wordmark&#0046; - Google&#0032;font&#0032;logo&#0032;maker | Product Hunt"
          style={{ width: "250px", height: "54px" }}
          width="250"
          height="54"
        />
      </Link>
      <div>
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
    </div>
  );
}
