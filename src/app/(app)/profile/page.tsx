"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChipGroup from "@/components/ChipGroup";
import { Api, type HistoryEntry, type Voucher } from "@/lib/client/api";
import { categoryIcon, formatDate, showToast, SKILLS_LIST } from "@/lib/client/format";
import { takeUnseenConfirmation, useSession } from "@/lib/client/session";
import type { DecoratedOpportunity } from "@/lib/server/services";

type Prefs = {
  indoor_outdoor: string;
  manual_pref: string;
  solo_group: string;
  skills: string[];
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout, refreshUser } = useSession();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [posts, setPosts] = useState<DecoratedOpportunity[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [prefs, setPrefs] = useState<Prefs | null>(null);

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
    try {
      const { user: updated } = await Api.updateUser(user!.id, prefs);
      setUser(updated);
      setEditingPrefs(false);
      showToast("Preferences saved");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <h1>{user.first_name}</h1>
        <button className="link-btn" onClick={handleLogout}>
          Log out
        </button>
      </div>

      <div className="card">
        <p className="opp-meta">
          {user.postcode_district} ·{" "}
          {user.id_verified ? (
            <span className="badge badge-verified">Verified ✓</span>
          ) : (
            <span className="opp-meta">Not verified</span>
          )}
        </p>
        {!user.id_verified && (
          <button className="link-btn" onClick={() => router.push("/verify")}>
            Verify now
          </button>
        )}
        {user.skills.length > 0 && (
          <p className="opp-meta" style={{ marginTop: 8 }}>
            Skills: {user.skills.join(", ")}
          </p>
        )}
        <p className="opp-meta">
          Preferences: {user.indoor_outdoor}, {user.manual_pref}, {user.solo_group}
        </p>
        <button className="link-btn" onClick={openPrefsEditor}>
          Edit preferences
        </button>
      </div>

      <div className="stat-row">
        <div className="stat-box">
          <div className="value">{user.confirmed_hours}</div>
          <div className="label">Confirmed hrs</div>
        </div>
        <div className="stat-box">
          <div className="value">{user.pending_hours}</div>
          <div className="label">Pending hrs</div>
        </div>
        <div className="stat-box">
          <div className="value">{user.points_balance}</div>
          <div className="label">Points</div>
        </div>
      </div>

      {editingPrefs && prefs && (
        <div className="card">
          <h2>Edit preferences</h2>
          <div className="field">
            <label>Indoor/outdoor</label>
            <ChipGroup
              options={["indoor", "outdoor", "either"]}
              value={prefs.indoor_outdoor}
              onChange={(v) => setPrefs({ ...prefs, indoor_outdoor: v as string })}
            />
          </div>
          <div className="field">
            <label>Manual/non-manual</label>
            <ChipGroup
              options={["manual", "non-manual", "either"]}
              value={prefs.manual_pref}
              onChange={(v) => setPrefs({ ...prefs, manual_pref: v as string })}
            />
          </div>
          <div className="field">
            <label>Solo/group</label>
            <ChipGroup
              options={["solo", "group", "either"]}
              value={prefs.solo_group}
              onChange={(v) => setPrefs({ ...prefs, solo_group: v as string })}
            />
          </div>
          <div className="field">
            <label>Skills</label>
            <ChipGroup
              options={SKILLS_LIST}
              value={prefs.skills}
              onChange={(v) => setPrefs({ ...prefs, skills: v as string[] })}
              multi
            />
          </div>
          <button className="btn btn-primary" onClick={savePrefs}>
            Save
          </button>
        </div>
      )}

      <h2>History</h2>
      <div className="card">
        {history.length ? (
          history.map((h) => (
            <div className="attendee-row" key={h.signup_id}>
              <div>
                <div>
                  {categoryIcon(h.category)} {h.title}
                </div>
                <div className="opp-meta">
                  {formatDate(h.date)} · {h.hours} hrs
                </div>
              </div>
              <span className={`badge badge-${h.status === "pending" ? "pending" : h.status}`}>
                {h.status === "pending" ? "Pending confirmation" : h.status}
              </span>
            </div>
          ))
        ) : (
          <p className="opp-meta">No opportunities joined yet.</p>
        )}
      </div>

      {posts.length > 0 && (
        <>
          <h2>My posts</h2>
          <div className="card" id="my-posts">
            {posts.map((p) => (
              <div
                className="attendee-row"
                key={p.id}
                style={{ cursor: "pointer" }}
                onClick={() => router.push(`/manage/${p.id}`)}
              >
                <div>
                  <div>
                    {categoryIcon(p.category)} {p.title}
                  </div>
                  <div className="opp-meta">{formatDate(p.date)}</div>
                </div>
                <span className={`badge badge-${p.status === "open" ? "joined" : "confirmed"}`}>{p.status}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {vouchers.length > 0 && (
        <>
          <h2>My vouchers</h2>
          <div className="card">
            {vouchers.map((v, i) => (
              <div className="attendee-row" key={i}>
                <div>
                  <div>{v.offer_title}</div>
                  <div className="opp-meta">{v.business_name}</div>
                </div>
                <strong>{v.code}</strong>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
