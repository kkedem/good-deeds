"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Heart,
  Hourglass,
  LogOut,
  MapPin,
  Megaphone,
  Ticket,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ChipGroup from "@/components/ChipGroup";
import CategoryBadge from "@/components/CategoryBadge";
import { Api, type HistoryEntry, type Voucher } from "@/lib/client/api";
import { formatDate, showToast, SKILLS_LIST } from "@/lib/client/format";
import { takeUnseenConfirmation, useSession } from "@/lib/client/session";
import type { DecoratedOpportunity } from "@/lib/server/services";
import "./profile.css";

type Prefs = {
  indoor_outdoor: string;
  manual_pref: string;
  solo_group: string;
  skills: string[];
};

const STATUS: Record<string, { label: string; icon: LucideIcon }> = {
  joined: { label: "You're going", icon: CheckCircle2 },
  pending: { label: "Pending confirmation", icon: Hourglass },
  confirmed: { label: "Confirmed", icon: CheckCircle2 },
  completed: { label: "Completed", icon: CheckCircle2 },
  open: { label: "Open", icon: Clock3 },
  cancelled: { label: "Cancelled", icon: XCircle },
  verified: { label: "Verified ✓", icon: CheckCircle2 },
  unverified: { label: "Not verified", icon: XCircle },
};

function ProfileStatus({ status }: { status: string }) {
  const s = STATUS[status];
  const Icon = s?.icon;
  return (
    <span className={`profile-status profile-status--${s ? status : "other"}`}>
      {Icon && <Icon size={14} aria-hidden="true" />}
      {s?.label ?? status}
    </span>
  );
}

function fmtHours(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout, refreshUser } = useSession();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [posts, setPosts] = useState<DecoratedOpportunity[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    refreshUser();
    (async () => {
      try {
        const [h, p, v] = await Promise.all([
          Api.getHistory(user.id),
          Api.getPosts(user.id),
          Api.getVouchers(user.id),
        ]);
        setHistory(h.history);
        setPosts(p.posts);
        setVouchers(v.vouchers);

        const celebration = takeUnseenConfirmation(h.history);
        if (celebration) {
          showToast(`+${celebration.points} points — confirmed 🎉`, 4000);
        }
      } catch {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) return null;

  function handleLogout() {
    logout();
    router.push("/login");
  }

  function openPrefsEditor() {
    setPrefs({
      indoor_outdoor: user!.indoor_outdoor,
      manual_pref: user!.manual_pref,
      solo_group: user!.solo_group,
      skills: [...user!.skills],
    });
    setEditingPrefs(true);
  }

  async function savePrefs() {
    if (!prefs) return;
    setSaving(true);
    try {
      const { user: updated } = await Api.updateUser(user!.id, prefs);
      setUser(updated);
      setEditingPrefs(false);
      showToast("Preferences saved");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const confirmedCount = history.filter((h) => h.status === "confirmed").length;

  return (
    <div className="profile-screen">
      <header className="profile-header">
        <span className="profile-avatar" aria-hidden="true">
          {user.first_name.charAt(0).toUpperCase()}
        </span>
        <div className="profile-header-body">
          <h1 className="profile-name">{user.first_name}</h1>
          <p className="profile-district">
            <MapPin size={15} aria-hidden="true" />
            {user.postcode_district}
          </p>
          <div className="profile-verify-row">
            {user.id_verified ? (
              <ProfileStatus status="verified" />
            ) : (
              <>
                <ProfileStatus status="unverified" />
                <button type="button" className="profile-link" onClick={() => router.push("/verify")}>
                  Verify now
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="profile-stats">
        <div className="profile-stat profile-stat--signal">
          <span className="profile-stat-value">{fmtHours(user.confirmed_hours)}</span>
          <span className="profile-stat-label">Confirmed hrs</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-value">{fmtHours(user.pending_hours)}</span>
          <span className="profile-stat-label">Pending hrs</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-value">{user.points_balance}</span>
          <span className="profile-stat-label">Points</span>
        </div>
      </div>

      {confirmedCount > 0 && (
        <div className="profile-impact">
          <Heart size={20} aria-hidden="true" />
          <span>
            You&apos;ve given {fmtHours(user.confirmed_hours)} {user.confirmed_hours === 1 ? "hour" : "hours"} across{" "}
            {confirmedCount} good {confirmedCount === 1 ? "deed" : "deeds"}. Thank you.
          </span>
        </div>
      )}

      <section className="profile-section" aria-labelledby="profile-prefs-title">
        <div className="profile-section-head">
          <h2 className="profile-section-title" id="profile-prefs-title">
            {editingPrefs ? "Edit preferences" : "Preferences"}
          </h2>
          {!editingPrefs && (
            <button type="button" className="profile-link" onClick={openPrefsEditor}>
              Edit preferences
            </button>
          )}
        </div>

        {editingPrefs && prefs ? (
          <div className="profile-card profile-prefs">
            <div className="profile-edit-field">
              <span className="profile-edit-label">Indoor/outdoor</span>
              <ChipGroup
                options={["indoor", "outdoor", "either"]}
                value={prefs.indoor_outdoor}
                onChange={(v) => setPrefs({ ...prefs, indoor_outdoor: v as string })}
              />
            </div>
            <div className="profile-edit-field">
              <span className="profile-edit-label">Manual/non-manual</span>
              <ChipGroup
                options={["manual", "non-manual", "either"]}
                value={prefs.manual_pref}
                onChange={(v) => setPrefs({ ...prefs, manual_pref: v as string })}
              />
            </div>
            <div className="profile-edit-field">
              <span className="profile-edit-label">Solo/group</span>
              <ChipGroup
                options={["solo", "group", "either"]}
                value={prefs.solo_group}
                onChange={(v) => setPrefs({ ...prefs, solo_group: v as string })}
              />
            </div>
            <div className="profile-edit-field">
              <span className="profile-edit-label">Skills</span>
              <ChipGroup
                options={SKILLS_LIST}
                value={prefs.skills}
                onChange={(v) => setPrefs({ ...prefs, skills: v as string[] })}
                multi
              />
            </div>
            <div className="profile-edit-actions">
              <button
                type="button"
                className="cg-btn cg-btn--secondary"
                onClick={() => setEditingPrefs(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button type="button" className="cg-btn cg-btn--primary" onClick={savePrefs} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-card profile-prefs">
            <div className="profile-pref-group">
              <p className="profile-pref-label">Preferences</p>
              <div className="profile-tags">
                <span className="profile-tag">{user.indoor_outdoor}</span>
                <span className="profile-tag">{user.manual_pref}</span>
                <span className="profile-tag">{user.solo_group}</span>
              </div>
            </div>
            <div className="profile-pref-group">
              <p className="profile-pref-label">Skills</p>
              <div className="profile-tags">
                {user.skills.length > 0 ? (
                  user.skills.map((s) => (
                    <span key={s} className="profile-tag profile-tag--line">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="profile-tag profile-tag--line">None added</span>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="profile-section" aria-labelledby="profile-history-title">
        <div className="profile-section-head">
          <h2 className="profile-section-title" id="profile-history-title">
            History
          </h2>
        </div>
        <div className="profile-card">
          {history.length ? (
            <ul className="profile-list">
              {history.map((h) => (
                <li key={h.signup_id}>
                  <div className="profile-row">
                    <CategoryBadge category={h.category} size={40} />
                    <span className="profile-row-body">
                      <span className="profile-row-title">{h.title}</span>
                      <span className="profile-row-meta">
                        {formatDate(h.date)} · {h.hours} hrs
                      </span>
                    </span>
                    <ProfileStatus status={h.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="profile-empty">No opportunities joined yet.</p>
          )}
        </div>
      </section>

      {posts.length > 0 && (
        <section className="profile-section" aria-labelledby="profile-posts-title">
          <div className="profile-section-head">
            <h2 className="profile-section-title" id="profile-posts-title">
              My posts
            </h2>
          </div>
          <div className="profile-card" id="my-posts">
            <ul className="profile-list">
              {posts.map((p) => (
                <li key={p.id}>
                  <button type="button" className="profile-row" onClick={() => router.push(`/manage/${p.id}`)}>
                    <span className="profile-row-icon" aria-hidden="true">
                      <Megaphone size={18} />
                    </span>
                    <span className="profile-row-body">
                      <span className="profile-row-title">{p.title}</span>
                      <span className="profile-row-meta">{formatDate(p.date)}</span>
                    </span>
                    <ProfileStatus status={p.status} />
                    <ChevronRight size={18} className="profile-row-chevron" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {vouchers.length > 0 && (
        <section className="profile-section" aria-labelledby="profile-vouchers-title">
          <div className="profile-section-head">
            <h2 className="profile-section-title" id="profile-vouchers-title">
              My vouchers
            </h2>
          </div>
          <div className="profile-card">
            <ul className="profile-list">
              {vouchers.map((v, i) => (
                <li key={i}>
                  <div className="profile-row">
                    <span className="profile-row-icon" aria-hidden="true">
                      <Ticket size={18} />
                    </span>
                    <span className="profile-row-body">
                      <span className="profile-row-title">{v.offer_title}</span>
                      <span className="profile-row-meta">{v.business_name}</span>
                    </span>
                    <span className="profile-code">{v.code}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="profile-section" aria-label="Account">
        <div className="profile-card">
          <ul className="profile-list">
            <li>
              <Link href="/terms" className="profile-row" style={{ textDecoration: "none" }}>
                <span className="profile-row-icon" aria-hidden="true">
                  <FileText size={18} />
                </span>
                <span className="profile-row-body">
                  <span className="profile-row-title">Terms &amp; Conditions</span>
                </span>
                <ChevronRight size={18} className="profile-row-chevron" aria-hidden="true" />
              </Link>
            </li>
            <li>
              <button type="button" className="profile-row profile-logout" onClick={handleLogout}>
                <span className="profile-row-icon" aria-hidden="true">
                  <LogOut size={18} />
                </span>
                <span className="profile-row-body">
                  <span className="profile-row-title">Log out</span>
                </span>
              </button>
            </li>
          </ul>
        </div>
        <p className="profile-email">{user.email}</p>
      </section>
    </div>
  );
}
