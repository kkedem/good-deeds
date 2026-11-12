"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Globe, MapPin, Minus, Plus, Share2, XCircle } from "lucide-react";
import ChipGroup from "@/components/ChipGroup";
import CategoryBadge from "@/components/CategoryBadge";
import PhotoPicker from "@/components/PhotoPicker";
import { CATEGORY_IMAGES } from "@/lib/opportunityImages";
import { Api, ApiError, type Category } from "@/lib/client/api";
import { SKILLS_LIST, showToast } from "@/lib/client/format";
import { shareOpportunity } from "@/lib/client/share";
import { useSession } from "@/lib/client/session";
import type { DecoratedOpportunity } from "@/lib/server/services";
import "./post.css";

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
  image_url: string;
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
  image_url: "",
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <div className="post-error" id={id} role="alert">
      <XCircle size={16} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

function Stepper({
  id,
  label,
  value,
  min,
  max,
  step,
  format,
  invalid,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  format: (n: number) => string;
  invalid?: boolean;
  onChange: (v: string) => void;
}) {
  const parsed = parseFloat(value);
  const n = Number.isFinite(parsed) ? parsed : min;
  const set = (next: number) => onChange(String(Math.min(max, Math.max(min, next))));
  return (
    <div className="post-stepper" id={id} aria-invalid={invalid || undefined}>
      <button
        type="button"
        className="post-stepper-btn"
        aria-label={`Decrease ${label}`}
        onClick={() => set(n - step)}
        disabled={n <= min}
      >
        <Minus size={20} />
      </button>
      <span className="post-stepper-value" aria-live="polite">
        {format(n)}
      </span>
      <button
        type="button"
        className="post-stepper-btn"
        aria-label={`Increase ${label}`}
        onClick={() => set(n + step)}
        disabled={n >= max}
      >
        <Plus size={20} />
      </button>
    </div>
  );
}

export default function PostPage() {
  const router = useRouter();
  const { user } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<DecoratedOpportunity | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      image_url: form.image_url,
    };

    setSubmitting(true);
    try {
      const { opportunity } = await Api.createOpportunity(payload);
      setCreated(opportunity);
      window.scrollTo(0, 0);
    } catch (err) {
      if (err instanceof ApiError && err.data.fields) {
        setErrors(err.data.fields as Record<string, string>);
      } else {
        showToast(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function postAnother() {
    setForm(INITIAL);
    setErrors({});
    setCreated(null);
    window.scrollTo(0, 0);
  }

  if (!user) return null;

  if (created) {
    return (
      <div className="post-screen">
        <div className="post-done">
          <span className="post-done-icon" aria-hidden="true">
            <CheckCircle2 size={40} />
          </span>
          <h1 className="post-done-title">Your good deed is live!</h1>
          <p className="post-done-body">
            <strong>{created.title}</strong> is now on the map for everyone nearby. We&apos;ll show sign-ups in
            My posts on your profile.
          </p>
          <div className="post-done-actions">
            <button type="button" className="cg-btn cg-btn--primary cg-btn--lg" onClick={() => shareOpportunity(created)}>
              <Share2 size={18} aria-hidden="true" />
              Share
            </button>
            <button
              type="button"
              className="cg-btn cg-btn--secondary cg-btn--lg"
              onClick={() => router.push(`/opportunity/${created.id}`)}
            >
              View post
            </button>
            <button type="button" className="cg-btn cg-btn--ghost" onClick={postAnother}>
              Post another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const errProps = (key: string) =>
    errors[key] ? { "aria-invalid": true as const, "aria-describedby": `p-${key}-err` } : {};

  return (
    <div className="post-screen">
      <h1 className="post-title">Post a good deed</h1>
      <p className="post-subtitle">Takes under a minute. It goes live for everyone straight away.</p>

      <form className="post-form" onSubmit={handleSubmit} noValidate>
        <div className="post-field">
          <label className="post-label" htmlFor="p-title">
            Title
          </label>
          <input
            id="p-title"
            className="post-input"
            maxLength={60}
            placeholder="e.g. Saturday beach clean"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            {...errProps("title")}
          />
          <span className="post-counter">{form.title.length}/60</span>
          <FieldError id="p-title-err" message={errors.title} />
        </div>

        <fieldset className="post-field">
          <legend className="post-legend">Category</legend>
          <div
            className="post-category-grid"
            role="radiogroup"
            aria-label="Category"
            aria-invalid={errors.category ? true : undefined}
            aria-describedby={errors.category ? "p-category-err" : undefined}
          >
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={form.category === c.id}
                className="post-category-chip"
                onClick={() => update("category", c.id)}
              >
                <CategoryBadge category={c.id} size={34} />
                {c.name}
              </button>
            ))}
          </div>
          <FieldError id="p-category-err" message={errors.category} />
        </fieldset>

        <div className="post-field">
          <span className="post-label">
            Photo <span className="post-optional">Optional</span>
          </span>
          <PhotoPicker
            userId={user.id}
            value={form.image_url}
            fallback={CATEGORY_IMAGES[form.category] || ""}
            onChange={(url) => update("image_url", url)}
          />
          <FieldError id="p-image_url-err" message={errors.image_url} />
        </div>

        <div className="post-field">
          <label className="post-label" htmlFor="p-description">
            Description
          </label>
          <textarea
            id="p-description"
            className="post-input"
            maxLength={500}
            placeholder="What will people do? What should they bring?"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            {...errProps("description")}
          />
          <span className="post-counter">{form.description.length}/500</span>
          <FieldError id="p-description-err" message={errors.description} />
        </div>

        <div className="post-row-2">
          <div className="post-field">
            <label className="post-label" htmlFor="p-date">
              Date
            </label>
            <input
              id="p-date"
              className="post-input"
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              {...errProps("date")}
            />
          </div>
          <div className="post-field">
            <label className="post-label" htmlFor="p-time">
              Start time
            </label>
            <input
              id="p-time"
              className="post-input"
              type="time"
              value={form.start_time}
              onChange={(e) => update("start_time", e.target.value)}
              {...errProps("start_time")}
            />
          </div>
        </div>
        {(errors.date || errors.start_time) && (
          <div style={{ marginTop: -14 }}>
            <FieldError id="p-date-err" message={errors.date} />
            <FieldError id="p-start_time-err" message={errors.start_time} />
          </div>
        )}

        <div className="post-field">
          <span className="post-label" id="p-hours-label">
            Hours required
          </span>
          <Stepper
            id="p-hours"
            label="hours required"
            value={form.hours}
            min={0.5}
            max={8}
            step={0.5}
            format={(n) => `${n} ${n === 1 ? "hour" : "hours"}`}
            invalid={!!errors.hours}
            onChange={(v) => update("hours", v)}
          />
          <FieldError id="p-hours-err" message={errors.hours} />
        </div>

        <fieldset className="post-field">
          <legend className="post-legend">Where is it?</legend>
          <div className="post-segmented" role="radiogroup" aria-label="Where is it?">
            <button
              type="button"
              role="radio"
              aria-checked={!form.online}
              onClick={() => update("online", false)}
            >
              <MapPin size={16} aria-hidden="true" /> In person
            </button>
            <button type="button" role="radio" aria-checked={form.online} onClick={() => update("online", true)}>
              <Globe size={16} aria-hidden="true" /> Online
            </button>
          </div>
          {form.online && <p className="post-hint">This is online (no location needed)</p>}
        </fieldset>

        {!form.online && (
          <div className="post-field">
            <label className="post-label" htmlFor="p-postcode">
              Location (Brighton &amp; Hove postcode)
            </label>
            <input
              id="p-postcode"
              className="post-input"
              placeholder="e.g. BN1 4JA"
              autoCapitalize="characters"
              value={form.postcode}
              onChange={(e) => update("postcode", e.target.value)}
              {...errProps("postcode")}
            />
            <FieldError id="p-postcode-err" message={errors.postcode} />
          </div>
        )}

        <fieldset className={`post-field post-pair${errors.indoor_outdoor ? " post-field-invalid" : ""}`}>
          <legend className="post-legend">Indoor or outdoor?</legend>
          <ChipGroup
            options={["indoor", "outdoor"]}
            value={form.indoor_outdoor}
            onChange={(v) => update("indoor_outdoor", v as string)}
          />
          <FieldError id="p-indoor_outdoor-err" message={errors.indoor_outdoor} />
        </fieldset>

        <fieldset className={`post-field post-pair${errors.manual ? " post-field-invalid" : ""}`}>
          <legend className="post-legend">Manual or non-manual?</legend>
          <ChipGroup
            options={["manual", "non-manual"]}
            value={form.manual}
            onChange={(v) => update("manual", v as string)}
          />
          <FieldError id="p-manual-err" message={errors.manual} />
        </fieldset>

        <fieldset className="post-field post-pair">
          <legend className="post-legend">Individual or group?</legend>
          <ChipGroup
            options={[
              { value: "individual", label: "Individual" },
              { value: "group", label: "Group" },
            ]}
            value={form.type}
            onChange={(v) => update("type", v as string)}
          />
        </fieldset>

        {form.type === "group" && (
          <div className="post-field">
            <span className="post-label">Group capacity</span>
            <Stepper
              id="p-capacity"
              label="group capacity"
              value={form.capacity}
              min={2}
              max={50}
              step={1}
              format={(n) => `${n} people`}
              invalid={!!errors.capacity}
              onChange={(v) => update("capacity", v)}
            />
            <FieldError id="p-capacity-err" message={errors.capacity} />
          </div>
        )}

        <fieldset className="post-field">
          <legend className="post-legend">
            Required skills <span className="post-optional">Optional</span>
          </legend>
          <ChipGroup options={SKILLS_LIST} value={form.skills} onChange={(v) => update("skills", v as string[])} multi />
        </fieldset>

        <button type="submit" className="cg-btn cg-btn--primary cg-btn--lg post-submit" disabled={submitting}>
          {submitting ? "Posting…" : "Post"}
        </button>
      </form>
    </div>
  );
}
