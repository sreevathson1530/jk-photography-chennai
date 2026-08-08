"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, LogOut, Trash2, Video } from "lucide-react";

type Photo = {
  id: string;
  src: string;
  jpg: string;
  category: string;
  title: string;
};

type VideoItem = {
  id: string;
  poster: string;
  subtitle: string;
  title: string;
};

const CATEGORIES = [
  { id: "wedding", label: "Wedding" },
  { id: "prewed", label: "Pre-Wedding" },
  { id: "bride", label: "Bride" },
  { id: "bts", label: "Behind the Scenes" },
] as const;

export function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<"photos" | "videos">("photos");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [category, setCategory] = useState("wedding");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMedia = useCallback(async () => {
    const res = await fetch("/api/admin/media");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    setPhotos(data.photos || []);
    setVideos(data.videos || []);
    setAuthed(true);
  }, []);

  useEffect(() => {
    loadMedia().finally(() => setChecking(false));
  }, [loadMedia]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("Wrong password. Try again.");
      return;
    }
    setPassword("");
    await loadMedia();
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setPhotos([]);
    setVideos([]);
  };

  const upload = async (file: File, type: "photo" | "video") => {
    setUploading(true);
    setMessage(
      type === "video"
        ? "Uploading video… this can take a few minutes."
        : "Uploading photo…"
    );
    const form = new FormData();
    form.append("type", type);
    form.append("file", file);
    if (type === "photo") form.append("category", category);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMessage(type === "video" ? "Video added!" : "Photo added!");
      await loadMedia();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (type: "photo" | "video", id: string) => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    setDeletingId(id);
    const res = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
    });
    if (res.ok) {
      setMessage("Deleted.");
      await loadMedia();
    } else {
      setMessage("Could not delete. Try again.");
    }
    setDeletingId(null);
  };

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-zinc-500">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5">
        <h1 className="text-center font-display text-3xl text-zinc-900">
          Admin Login
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Upload or remove photos and videos
        </p>
        <form onSubmit={login} className="mt-8 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400"
            autoFocus
          />
          {loginError ? (
            <p className="text-center text-sm text-red-600">{loginError}</p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-zinc-950 py-3 text-sm font-medium tracking-wide text-white"
          >
            Sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-zinc-900">Manage Media</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Add or remove portfolio photos and films
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-700"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        {(["photos", "videos"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2.5 text-sm capitalize ${
              tab === t
                ? "bg-zinc-950 text-white"
                : "border border-zinc-200 text-zinc-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {message ? (
        <p className="mb-4 rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
          {message}
        </p>
      ) : null}

      {tab === "photos" ? (
        <section className="mb-10 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6">
          <p className="mb-4 text-sm font-medium text-zinc-800">Add a photo</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`rounded-full px-4 py-2 text-xs ${
                  category === c.id
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-600 ring-1 ring-zinc-200"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <label
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-10 transition hover:border-zinc-400 ${
              uploading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            ) : (
              <ImagePlus className="h-8 w-8 text-zinc-400" />
            )}
            <span className="text-sm text-zinc-600">
              Tap to choose a photo (JPG, PNG)
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(file, "photo");
                e.target.value = "";
              }}
            />
          </label>
        </section>
      ) : (
        <section className="mb-10 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6">
          <p className="mb-4 text-sm font-medium text-zinc-800">Add a video</p>
          <label
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-10 transition hover:border-zinc-400 ${
              uploading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            ) : (
              <Video className="h-8 w-8 text-zinc-400" />
            )}
            <span className="text-sm text-zinc-600">
              Tap to choose a video (MP4, MOV)
            </span>
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(file, "video");
                e.target.value = "";
              }}
            />
          </label>
        </section>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {tab === "photos"
          ? photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-xl bg-zinc-100"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={photo.jpg || photo.src}
                    alt={photo.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="truncate px-2 py-2 text-xs text-zinc-600">
                  {photo.category}
                </p>
                <button
                  type="button"
                  disabled={deletingId === photo.id}
                  onClick={() => remove("photo", photo.id)}
                  className="absolute top-2 right-2 rounded-full bg-red-600 p-2 text-white opacity-90"
                  aria-label="Delete photo"
                >
                  {deletingId === photo.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))
          : videos.map((video) => (
              <div
                key={video.id}
                className="group relative overflow-hidden rounded-xl bg-zinc-100"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={video.poster}
                    alt={video.subtitle || video.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="truncate px-2 py-2 text-xs text-zinc-600">
                  {video.subtitle || video.title}
                </p>
                <button
                  type="button"
                  disabled={deletingId === video.id}
                  onClick={() => remove("video", video.id)}
                  className="absolute top-2 right-2 rounded-full bg-red-600 p-2 text-white opacity-90"
                  aria-label="Delete video"
                >
                  {deletingId === video.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
      </div>
    </div>
  );
}
