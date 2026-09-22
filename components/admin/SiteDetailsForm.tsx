"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import {
  defaultSiteContent,
  mergeSiteContent,
  type SiteContent,
} from "@/lib/site-content";

type Props = {
  onUnauthorized: () => void;
};

const inputCls =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[15px] text-zinc-900 outline-none transition focus:border-zinc-400";
const labelCls = "mb-1.5 block text-xs tracking-[0.14em] text-zinc-500 uppercase";

function Field({
  label,
  hint,
  value,
  onChange,
  multiline,
  rows = 3,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          rows={rows}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      )}
      {hint ? <span className="mt-1.5 block text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-[#FCFBF9] p-5 sm:p-6">
      <h2 className="font-display text-2xl text-zinc-900">{title}</h2>
      <p className="mt-1 mb-5 text-sm text-zinc-500">{description}</p>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function RowCard({
  onRemove,
  children,
}: {
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 pr-12">
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function AddRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-fit items-center gap-2 rounded-full border border-dashed border-zinc-300 px-4 py-2 text-sm text-zinc-600 transition hover:border-zinc-500 hover:text-zinc-900"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}

const linesToList = (s: string) =>
  s
    .split(/\r?\n|,/)
    .map((x) => x.trim())
    .filter(Boolean);

const paragraphs = (s: string) =>
  s
    .split(/\n\s*\n/)
    .map((x) => x.trim())
    .filter(Boolean);

export function SiteDetailsForm({ onUnauthorized }: Props) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Free-text mirrors for list fields so typing commas/newlines feels natural.
  const [phonesText, setPhonesText] = useState("");
  const [locationsText, setLocationsText] = useState("");
  const [aboutBodyText, setAboutBodyText] = useState("");

  const hydrate = useCallback((c: SiteContent) => {
    setContent(c);
    setPhonesText(c.contact.phones.join("\n"));
    setLocationsText(c.studio.locations.join(", "));
    setAboutBodyText(c.about.body.join("\n\n"));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/admin/content");
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      const data = await res.json();
      if (cancelled) return;
      const c = mergeSiteContent(data.content);
      hydrate(c);
      setSavedSnapshot(JSON.stringify(c));
    })().catch(() => setError("Could not load site details."));
    return () => {
      cancelled = true;
    };
  }, [hydrate, onUnauthorized]);

  const patch = useCallback(
    (fn: (draft: SiteContent) => void) => {
      setContent((prev) => {
        if (!prev) return prev;
        const draft = structuredClone(prev);
        fn(draft);
        return draft;
      });
    },
    []
  );

  const dirty = useMemo(
    () => (content ? JSON.stringify(content) !== savedSnapshot : false),
    [content, savedSnapshot]
  );

  const save = async () => {
    if (!content) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      const c = mergeSiteContent(data.content);
      hydrate(c);
      setSavedSnapshot(JSON.stringify(c));
      setMessage("Saved. The website is updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const resetToOriginal = () => {
    if (
      !confirm(
        "Replace everything in this form with the original launch text? Nothing is saved until you press Save."
      )
    )
      return;
    hydrate(structuredClone(defaultSiteContent));
  };

  if (!content) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-zinc-500">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const c = content;

  return (
    <div className="pb-28">
      {message ? (
        <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6">
        <Section
          title="Studio"
          description="Name, slogan and the numbers shown on the hero, footer and about page."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Studio name"
              value={c.studio.name}
              onChange={(v) => patch((d) => (d.studio.name = v))}
            />
            <Field
              label="Instagram handle"
              value={c.studio.handle}
              placeholder="jkphotographychennai"
              onChange={(v) => patch((d) => (d.studio.handle = v))}
            />
          </div>
          <Field
            label="Slogan / tagline"
            hint="Shown on the hero, footer and browser title."
            value={c.studio.tagline}
            onChange={(v) => patch((d) => (d.studio.tagline = v))}
          />
          <Field
            label="Hero sub-line"
            hint="Second sentence under the slogan on the home page."
            value={c.studio.heroLine}
            onChange={(v) => patch((d) => (d.studio.heroLine = v))}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Since (year)"
              value={c.studio.since}
              onChange={(v) => patch((d) => (d.studio.since = v))}
            />
            <Field
              label="Years"
              value={c.studio.years}
              placeholder="35+"
              onChange={(v) => patch((d) => (d.studio.years = v))}
            />
            <Field
              label="Weddings"
              value={c.studio.weddings}
              placeholder="30k+"
              onChange={(v) => patch((d) => (d.studio.weddings = v))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Locations"
              hint="Separate with commas."
              value={locationsText}
              onChange={(v) => {
                setLocationsText(v);
                patch((d) => (d.studio.locations = linesToList(v)));
              }}
            />
            <Field
              label="Travel line"
              value={c.studio.travel}
              placeholder="Travelling Worldwide"
              onChange={(v) => patch((d) => (d.studio.travel = v))}
            />
          </div>
        </Section>

        <Section
          title="Contact details"
          description="Phone numbers, WhatsApp, email, address and social links used across the site."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Phone numbers"
              hint="One per line. The first one is used for Call buttons."
              multiline
              rows={3}
              value={phonesText}
              onChange={(v) => {
                setPhonesText(v);
                patch((d) => (d.contact.phones = linesToList(v)));
              }}
            />
            <div className="grid gap-4">
              <Field
                label="WhatsApp number"
                hint="With country code, digits only. e.g. 919543313354"
                value={c.contact.whatsapp}
                onChange={(v) => patch((d) => (d.contact.whatsapp = v))}
              />
              <Field
                label="Email"
                value={c.contact.email}
                onChange={(v) => patch((d) => (d.contact.email = v))}
              />
            </div>
          </div>
          <Field
            label="Address"
            multiline
            rows={2}
            value={c.contact.address}
            onChange={(v) => patch((d) => (d.contact.address = v))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Google Maps link"
              value={c.contact.mapsUrl}
              onChange={(v) => patch((d) => (d.contact.mapsUrl = v))}
            />
            <Field
              label="Google Maps embed URL"
              hint="Used for the map on the Contact page."
              value={c.contact.mapsEmbed}
              onChange={(v) => patch((d) => (d.contact.mapsEmbed = v))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Instagram URL"
              value={c.contact.instagram}
              onChange={(v) => patch((d) => (d.contact.instagram = v))}
            />
            <Field
              label="YouTube channel URL"
              value={c.contact.youtube}
              onChange={(v) => patch((d) => (d.contact.youtube = v))}
            />
          </div>
        </Section>

        <Section
          title="Home page text"
          description="Headlines and paragraphs on the home page."
        >
          <Field
            label="“Why us” headline"
            value={c.home.whyHeadline}
            onChange={(v) => patch((d) => (d.home.whyHeadline = v))}
          />
          <Field
            label="“Why us” paragraph"
            multiline
            rows={4}
            value={c.home.whyText}
            onChange={(v) => patch((d) => (d.home.whyText = v))}
          />
          <div>
            <span className={labelCls}>Highlights (4 small blocks)</span>
            <div className="grid gap-3">
              {c.home.whyPoints.map((p, i) => (
                <RowCard
                  key={i}
                  onRemove={() => patch((d) => d.home.whyPoints.splice(i, 1))}
                >
                  <Field
                    label="Title"
                    value={p.title}
                    onChange={(v) => patch((d) => (d.home.whyPoints[i].title = v))}
                  />
                  <Field
                    label="Text"
                    multiline
                    rows={2}
                    value={p.text}
                    onChange={(v) => patch((d) => (d.home.whyPoints[i].text = v))}
                  />
                </RowCard>
              ))}
              <AddRow
                label="Add highlight"
                onClick={() =>
                  patch((d) => d.home.whyPoints.push({ title: "", text: "" }))
                }
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="“Our craft” headline"
              value={c.home.craftHeadline}
              onChange={(v) => patch((d) => (d.home.craftHeadline = v))}
            />
            <Field
              label="Closing call-to-action headline"
              value={c.home.ctaHeadline}
              onChange={(v) => patch((d) => (d.home.ctaHeadline = v))}
            />
          </div>
          <Field
            label="“Our craft” paragraph"
            multiline
            rows={3}
            value={c.home.craftText}
            onChange={(v) => patch((d) => (d.home.craftText = v))}
          />
          <Field
            label="Closing call-to-action text"
            multiline
            rows={2}
            value={c.home.ctaText}
            onChange={(v) => patch((d) => (d.home.ctaText = v))}
          />
        </Section>

        <Section
          title="Services"
          description="Listed on the About page; the first four also appear on the home page."
        >
          {c.services.map((s, i) => (
            <RowCard
              key={i}
              onRemove={() => patch((d) => d.services.splice(i, 1))}
            >
              <Field
                label="Service"
                value={s.title}
                onChange={(v) => patch((d) => (d.services[i].title = v))}
              />
              <Field
                label="Description"
                multiline
                rows={2}
                value={s.description}
                onChange={(v) => patch((d) => (d.services[i].description = v))}
              />
            </RowCard>
          ))}
          <AddRow
            label="Add service"
            onClick={() =>
              patch((d) => d.services.push({ title: "", description: "" }))
            }
          />
        </Section>

        <Section
          title="Packages"
          description="Pricing text on the Packages page."
        >
          <Field
            label="Headline"
            value={c.packages.headline}
            onChange={(v) => patch((d) => (d.packages.headline = v))}
          />
          <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
            <Field
              label="Starting from"
              value={c.packages.startingFrom}
              placeholder="₹1,00,000"
              onChange={(v) => patch((d) => (d.packages.startingFrom = v))}
            />
            <Field
              label="Intro note"
              value={c.packages.note}
              onChange={(v) => patch((d) => (d.packages.note = v))}
            />
          </div>
          <Field
            label="Pricing detail"
            multiline
            rows={3}
            value={c.packages.detail}
            onChange={(v) => patch((d) => (d.packages.detail = v))}
          />
        </Section>

        <Section
          title="Testimonials"
          description="Client quotes on the home page."
        >
          {c.testimonials.map((t, i) => (
            <RowCard
              key={i}
              onRemove={() => patch((d) => d.testimonials.splice(i, 1))}
            >
              <Field
                label="Quote"
                multiline
                rows={3}
                value={t.quote}
                onChange={(v) => patch((d) => (d.testimonials[i].quote = v))}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Client name"
                  value={t.name}
                  onChange={(v) => patch((d) => (d.testimonials[i].name = v))}
                />
                <Field
                  label="Detail"
                  placeholder="Wedding · Chennai"
                  value={t.detail}
                  onChange={(v) => patch((d) => (d.testimonials[i].detail = v))}
                />
              </div>
            </RowCard>
          ))}
          <AddRow
            label="Add testimonial"
            onClick={() =>
              patch((d) =>
                d.testimonials.push({ quote: "", name: "", detail: "" })
              )
            }
          />
        </Section>

        <Section
          title="About page"
          description="Your story and philosophy."
        >
          <Field
            label="Headline"
            value={c.about.headline}
            onChange={(v) => patch((d) => (d.about.headline = v))}
          />
          <Field
            label="Story"
            hint="Leave an empty line between paragraphs."
            multiline
            rows={8}
            value={aboutBodyText}
            onChange={(v) => {
              setAboutBodyText(v);
              patch((d) => (d.about.body = paragraphs(v)));
            }}
          />
          <div>
            <span className={labelCls}>Philosophy blocks</span>
            <div className="grid gap-3">
              {c.about.philosophy.map((p, i) => (
                <RowCard
                  key={i}
                  onRemove={() => patch((d) => d.about.philosophy.splice(i, 1))}
                >
                  <Field
                    label="Title"
                    value={p.title}
                    onChange={(v) => patch((d) => (d.about.philosophy[i].title = v))}
                  />
                  <Field
                    label="Text"
                    multiline
                    rows={2}
                    value={p.text}
                    onChange={(v) => patch((d) => (d.about.philosophy[i].text = v))}
                  />
                </RowCard>
              ))}
              <AddRow
                label="Add block"
                onClick={() =>
                  patch((d) => d.about.philosophy.push({ title: "", text: "" }))
                }
              />
            </div>
          </div>
        </Section>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-500">
            {dirty ? "You have unsaved changes." : "All changes saved."}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetToOriginal}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to original
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving || !dirty}
              className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
