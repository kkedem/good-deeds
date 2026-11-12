"use client";

import { useRouter } from "next/navigation";
import { categoryIcon, categoryLabel, formatDate } from "@/lib/client/format";
import type { DecoratedOpportunity } from "@/lib/server/services";

export default function OpportunityCard({ opportunity }: { opportunity: DecoratedOpportunity }) {
  const router = useRouter();

  return (
    <div className="card opp-card" onClick={() => router.push(`/opportunity/${opportunity.id}`)}>
      <div className="opp-card-top">
        <div>
          <div className="opp-title">
            {categoryIcon(opportunity.category)} {opportunity.title}
          </div>
          <div className="opp-meta">
            {categoryLabel(opportunity.category)} · {formatDate(opportunity.date)}, {opportunity.start_time}
          </div>
        </div>
        {opportunity.distance_miles != null && <div className="opp-meta">{opportunity.distance_miles} mi</div>}
      </div>
      <div className="opp-tags">
        <span className="tag">{opportunity.hours} hrs</span>
        <span className="tag">{opportunity.type === "group" ? "Group" : "Individual"}</span>
        <span className="tag">{opportunity.spaces_left} spaces left</span>
      </div>
    </div>
  );
}
