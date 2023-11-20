"use client";
import { Button } from "@/components/ui/button";
import { Banana } from "lucide-react";

export const GetFeedback = () => (
  <Button
    variant="outline"
    size="icon"
    className="relative z-10 rounded-full border-yellow-300 text-yellow-300 dark:border-yellow-300 dark:hover:border-yellow-300 dark:focus:border-yellow-300 dark:active:border-yellow-300"
    onClick={() => {
      if (typeof window === "undefined") return;
      const node = document.getElementById("display-card");
      if (!node) return;
      node.classList.add("delayed-survey");
    }}
  >
    <Banana className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
    <span className="sr-only">Feedback</span>
  </Button>
);
