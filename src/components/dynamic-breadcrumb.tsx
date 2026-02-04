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
import { agents } from "@/data/agents";
import { customerLists } from "@/data/customer-contacts";
import { campaigns } from "@/data/campaigns";

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

function isKnownSegment(segment: string) {
  return segment in segmentLabels;
}

function resolveEntityName(parentSegment: string, id: string): string | null {
  switch (parentSegment) {
    case "agents": {
      const agent = agents.find((a) => a.id === id);
      return agent?.name ?? null;
    }
    case "customers": {
      const customer = customerLists.find((c) => c.id === id);
      return customer?.name ?? null;
    }
    case "campaigns": {
      const campaign = campaigns.find((c) => c.id === id);
      return campaign?.name ?? null;
    }
    default:
      return null;
  }
}

interface BreadcrumbEntry {
  label: string;
  href: string;
}

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // First segment is always the section
  const section = segments[0];
  const sectionLabel = section ? segmentLabels[section] : null;

  // Determine the second breadcrumb: entity name or known sub-action
  let secondLabel: string | null = null;
  if (segments.length >= 2) {
    const second = segments[1];
    if (isKnownSegment(second)) {
      // e.g. /agents/createAgent → "Create Agent"
      secondLabel = segmentLabels[second];
    } else if (section) {
      // Dynamic ID — resolve entity name from the section
      secondLabel = resolveEntityName(section, second);
    }
  }

  if (!sectionLabel) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {secondLabel ? (
            <BreadcrumbLink href={`/${section}`}>
              {sectionLabel}
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{sectionLabel}</BreadcrumbPage>
          )}
        </BreadcrumbItem>

        {secondLabel && (
          <>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{secondLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
