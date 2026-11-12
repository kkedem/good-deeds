import { showToast, formatDate, categoryIcon } from "./format";
import type { DecoratedOpportunity } from "@/lib/server/services";
import type { HistoryEntry } from "./api";

async function shareContent(title: string, text: string, url: string) {
  const fullText = `${text} ${url}`;
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch {
      // user cancelled or share failed - fall through to clipboard
    }
  }
  try {
    await navigator.clipboard.writeText(fullText);
    showToast("Copied – paste it anywhere");
  } catch {
    showToast(fullText, 5000);
  }
}

export function shareOpportunity(opp: DecoratedOpportunity) {
  const caption = `Join me for a ${opp.title} on ${formatDate(opp.date)}, ${opp.start_time} – ${opp.hours} hrs ${categoryIcon(opp.category)} #GoodDeeds #Brighton`;
  const url = `${window.location.origin}/opportunity/${opp.id}`;
  return shareContent(opp.title, caption, url);
}

export function shareCompletedDeed(historyItem: HistoryEntry) {
  const caption = `I just gave ${historyItem.hours} hours to a ${historyItem.title} with Good Deeds 💚 #GoodDeeds`;
  const url = `${window.location.origin}/opportunity/${historyItem.opportunity_id}`;
  return shareContent(historyItem.title, caption, url);
}
