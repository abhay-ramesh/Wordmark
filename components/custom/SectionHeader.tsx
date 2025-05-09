"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  badge?: string;
  description?: string;
  className?: string;
  children?: ReactNode;
}

export function SectionHeader({
  title,
  icon: Icon,
  badge,
  description,
  className,
  children,
}: SectionHeaderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 pb-1 text-sm font-medium text-muted-foreground">
          {Icon && <Icon className="h-4 w-4" />}
          <span>{title}</span>
        </div>
        {badge && (
          <Badge variant="outline" className="text-xs font-normal">
            {badge}
          </Badge>
        )}
        {children}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
