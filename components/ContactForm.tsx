"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { brand } from "@/lib/data";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "");
    const phone = String(form.get("phone") || "");
    const eventDate = String(form.get("eventDate") || "");
    const eventType = String(form.get("eventType") || "");
    const message = String(form.get("message") || "");

    const text = encodeURIComponent(
      `Hello JK Photography,\n\nName: ${name}\nPhone: ${phone}\nEvent: ${eventType}\nDate: ${eventDate}\n\n${message}`
    );

    window.open(`https://wa.me/${brand.whatsapp}?text=${text}`, "_blank");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-zinc-800" />
        <h3 className="font-display text-3xl text-zinc-900">Inquiry ready</h3>
        <p className="mt-3 text-zinc-600">
          WhatsApp should open with your details. If it did not, message us on{" "}
          <a
            className="underline underline-offset-4"
            href={`https://wa.me/${brand.whatsapp}`}
          >
            +91 {brand.phones[0]}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(24,24,27,0.05)] md:p-10"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm text-zinc-700">
          <span className="mb-2 block text-[11px] tracking-[0.18em] uppercase">
            Full Name
          </span>
          <input
            required
            name="name"
            className="w-full rounded-2xl border border-zinc-200 bg-[#FAFAF8] px-4 py-3.5 outline-none transition focus:border-zinc-400"
            placeholder="Your name"
          />
        </label>
        <label className="block text-sm text-zinc-700">
          <span className="mb-2 block text-[11px] tracking-[0.18em] uppercase">
            Phone
          </span>
          <input
            required
            name="phone"
            type="tel"
            className="w-full rounded-2xl border border-zinc-200 bg-[#FAFAF8] px-4 py-3.5 outline-none transition focus:border-zinc-400"
            placeholder="+91"
          />
        </label>
        <label className="block text-sm text-zinc-700">
          <span className="mb-2 block text-[11px] tracking-[0.18em] uppercase">
            Event Type
          </span>
          <select
            name="eventType"
            className="w-full rounded-2xl border border-zinc-200 bg-[#FAFAF8] px-4 py-3.5 outline-none transition focus:border-zinc-400"
            defaultValue="Wedding"
          >
            <option>Wedding</option>
            <option>Pre-Wedding</option>
            <option>Engagement</option>
            <option>Reception</option>
            <option>Destination</option>
            <option>Other</option>
          </select>
        </label>
        <label className="block text-sm text-zinc-700">
          <span className="mb-2 block text-[11px] tracking-[0.18em] uppercase">
            Event Date
          </span>
          <input
            name="eventDate"
            type="date"
            className="w-full rounded-2xl border border-zinc-200 bg-[#FAFAF8] px-4 py-3.5 outline-none transition focus:border-zinc-400"
          />
        </label>
      </div>

      <label className="mt-5 block text-sm text-zinc-700">
        <span className="mb-2 block text-[11px] tracking-[0.18em] uppercase">
          Message
        </span>
        <textarea
          name="message"
          rows={5}
          className="w-full resize-y rounded-2xl border border-zinc-200 bg-[#FAFAF8] px-4 py-3.5 outline-none transition focus:border-zinc-400"
          placeholder="Venue, city, guest count, film + photo needs..."
        />
      </label>

      <button
        type="submit"
        className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 py-4 text-[12px] font-medium tracking-[0.18em] text-white uppercase transition hover:bg-zinc-800 md:w-auto"
      >
        <Send className="h-4 w-4" />
        Send via WhatsApp
      </button>
    </form>
  );
}
