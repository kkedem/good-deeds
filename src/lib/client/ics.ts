import type { DecoratedOpportunity } from "@/lib/server/services";

export function downloadIcs(opportunity: DecoratedOpportunity) {
  const start = new Date(`${opportunity.date}T${opportunity.start_time}:00`);
  const end = new Date(start.getTime() + opportunity.hours * 60 * 60 * 1000);

  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Good Deeds//EN",
    "BEGIN:VEVENT",
    `UID:${opportunity.id}@good-deeds`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${opportunity.title}`,
    `DESCRIPTION:${(opportunity.description || "").replace(/\n/g, "\\n")}`,
    `LOCATION:${opportunity.postcode || "Brighton & Hove"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${opportunity.title.replace(/[^a-z0-9]/gi, "-")}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
