"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChipGroup from "@/components/ChipGroup";
import { Api, ApiError, type Category } from "@/lib/client/api";
import { SKILLS_LIST, showToast } from "@/lib/client/format";
import { shareOpportunity } from "@/lib/client/share";
import { useSession } from "@/lib/client/session";
import type { DecoratedOpportunity } from "@/lib/server/services";

type FormState = {
  title: string;
  category: string;
  description: string;
  date: string;
  start_time: string;
  hours: string;
  online: boolean;
  postcode: string;
  indoor_outdoor: string;
  manual: string;
  type: string;
  capacity: string;
  skills: string[];
};

const INITIAL: FormState = {
  title: "",
  category: "",
  description: "",
  date: "",
  start_time: "",
  hours: "2",
  online: false,
  postcode: "",
  indoor_outdoor: "",
  manual: "",
  type: "individual",
  capacity: "10",
  skills: [],
};

export default function PostPage() {
  const router = useRouter();
  const { user } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<DecoratedOpportunity | null>(null);

  useEffect(() => {
    Api.getCategories()
      .then((res) => setCategories(res.categories))
      .catch(() => setCategories([]));
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setErrors({});

    const payload = {
      poster_id: user.id,
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      date: form.date,
      start_time: form.start_time,
      hours: form.hours,
      online: form.online,
      postcode: form.online ? "" : form.postcode.trim(),
      indoor_outdoor: form.indoor_outdoor,
      manual: form.manual,
      type: form.type,
      capacity: form.capacity,
      skills: form.skills,
    };

    try {
      const { opportunity } = await Api.createOpportunity(payload);
      setCreated(opportunity);
    } catch (err) {
      if (err instanceof ApiError && err.data.fields) {
        setErrors(err.data.fields as Record<string, string>);
      } else {
        showToast(err instanceof Error ? err.message : "Something went wrong");
      }
    }
  }

  if (!user) return null;

  if (created) {
    return (
      <div className="screen">
        <h1>Post a good deed</h1>
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "2rem" }}>🎉</p>
          <p>Your good deed is live!</p>
          <button className="btn btn-primary" onClick={() => shareOpportunity(created)}>
            Share
          </button>
          <button className="btn btn-secondary" onClick={() => router.push(`/opportunity/${created.id}`)}>
            View post
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <h1>Post a good deed</h1>
      <p className="subtitle">Takes under a minute. It goes live for everyone straight away.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="p-title">Title</label>
          <input id="p-title" maxLength={60} value={form.title} onChange={(e) => update("title", e.target.value)} />
          <div className="field-error">{errors.title}</div>
        </div>

        <div className="field">
          <label htmlFor="p-category">Category</label>
          <select id="p-category" value={form.category} onChange={(e) => update("category", e.target.value)}>
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
          <div className="field-error">{errors.category}</div>
        </div>

        <div className="field">
          <label htmlFor="p-description">Description</label>
          <textarea
            id="p-description"
            maxLength={500}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
          <div className="field-error">{errors.description}</div>
        </div>

        <div className="field">
          <label htmlFor="p-date">Date</label>
          <input id="p-date" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
          <div className="field-error">{errors.date}</div>
        </div>

        <div className="field">
          <label htmlFor="p-time">Start time</label>
          <input
            id="p-time"
            type="time"
            value={form.start_time}
            onChange={(e) => update("start_time", e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="p-hours">Hours required</label>
          <input
            id="p-hours"
            type="number"
            min="0.5"
            max="8"
            step="0.5"
            value={form.hours}
            onChange={(e) => update("hours", e.target.value)}
          />
          <div className="field-error">{errors.hours}</div>
        </div>

        <div className="field">
          <label className="checkbox-row">
            <input type="checkbox" checked={form.online} onChange={(e) => update("online", e.target.checked)} />
            <span>This is online (no location needed)</span>
          </label>
        </div>

        {!form.online && (
          <div className="field">
            <label htmlFor="p-postcode">Location (Brighton &amp; Hove postcode)</label>
            <input
              id="p-postcode"
              placeholder="e.g. BN1 4JA"
              value={form.postcode}
              onChange={(e) => update("postcode", e.target.value)}
            />
            <div className="field-error">{errors.postcode}</div>
          </div>
        )}

        <div className="field">
          <label>Indoor or outdoor?</label>
          <ChipGroup
            options={["indoor", "outdoor"]}
            value={form.indoor_outdoor}
            onChange={(v) => update("indoor_outdoor", v as string)}
          />
          <div className="field-error">{errors.indoor_outdoor}</div>
        </div>

        <div className="field">
          <label>Manual or non-manual?</label>
          <ChipGroup
            options={["manual", "non-manual"]}
            value={form.manual}
            onChange={(v) => update("manual", v as string)}
          />
          <div className="field-error">{errors.manual}</div>
        </div>

        <div className="field">
          <label>Individual or group?</label>
          <ChipGroup
            options={[
              { value: "individual", label: "Individual" },
              { value: "group", label: "Group" },
            ]}
            value={form.type}
            onChange={(v) => update("type", v as string)}
          />
        </div>

        {form.type === "group" && (
          <div className="field">
            <label htmlFor="p-capacity">Group capacity</label>
            <input
              id="p-capacity"
              type="number"
              min="2"
              max="50"
              value={form.capacity}
              onChange={(e) => update("capacity", e.target.value)}
            />
            <div className="field-error">{errors.capacity}</div>
          </div>
        )}

        <div className="field">
          <label>Required skills (optional)</label>
          <ChipGroup options={SKILLS_LIST} value={form.skills} onChange={(v) => update("skills", v as string[])} multi />
        </div>

        <button type="submit" className="btn btn-primary">
          Post
        </button>
      </form>
    </div>
  );
}
