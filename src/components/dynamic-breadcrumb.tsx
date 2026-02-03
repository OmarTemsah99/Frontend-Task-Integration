"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

const segmentLabels: Record<string, string> = {
  agents: "Agents",
  createAgent: "Create Agent",
  edit: "Edit",
  customers: "Customer List",
  campaigns: "Campaigns",
  createCampaign: "Create Campaign",
  recordings: "Recordings",
  settings: "Settings",
  dashboard: "Dashboard",
};

function isDynamicSegment(segment: string) {
  // Skip segments that look like IDs (UUIDs, numeric IDs, etc.)
  return /^[0-9a-f-]+$/i.test(segment) && segment.length > 3;
}

export function DynamicBreadcrumb() {
  const pathname = usePathname();

  // Remove leading slash and split into segments
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb items from segments, skipping dynamic IDs
  const items = segments
    .filter((segment) => !isDynamicSegment(segment))
    .map((segment) => ({
      label: segmentLabels[segment] || segment,
      segment,
    }));

  // Build hrefs for each item
  const hrefs: string[] = [];
  let currentPath = "";
  let itemIndex = 0;
  for (const segment of segments) {
    currentPath += `/${segment}`;
    if (!isDynamicSegment(segment)) {
      hrefs[itemIndex] = currentPath;
      itemIndex++;
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home link always first */}
        <BreadcrumbItem className="hidden md:block">
          {items.length === 0 ? (
            <BreadcrumbPage>Home</BreadcrumbPage>
          ) : (
            <BreadcrumbLink href="/agents">Home</BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={item.segment + index}>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className={index === 0 && !isLast ? "hidden md:block" : ""}>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={hrefs[index]}>
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
