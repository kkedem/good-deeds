const LABELS: Record<string, string> = {
  joined: "You're going ✓",
  pending: "Pending confirmation",
  confirmed: "Confirmed ✓",
  cancelled: "Cancelled",
  verified: "Verified ✓",
};

export default function StatusBadge({ status }: { status: string }) {
  return <span className={`badge badge-${status}`}>{LABELS[status] || status}</span>;
}
