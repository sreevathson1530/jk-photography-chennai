"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  ImagePlus,
  Loader2,
  LogOut,
  Trash2,
  Youtube,
} from "lucide-react";
import { parseYouTubeId, youtubeThumb } from "@/lib/youtube";

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
  youtubeId?: string;
  category?: string;
  externalUrl?: string;
};

const PHOTO_CATEGORIES = [
  { id: "wedding", label: "Wedding" },
  { id: "prewed", label: "Pre-Wedding" },
  { id: "bride", label: "Bride" },
  { id: "bts", label: "Behind the Scenes" },
] as const;

const FILM_CATEGORIES = [
  { id: "wedding", label: "Wedding" },
  { id: "prewed", label: "Pre-Wedding" },
] as const;

export function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<"photos" | "films">("photos");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [photoCategory, setPhotoCategory] = useState("wedding");
  const [filmCategory, setFilmCategory] = useState<"wedding" | "prewed">(
    "wedding"
  );
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [filmTitle, setFilmTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [addingFilm, setAddingFilm] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const parsedYoutubeId = useMemo(
    () => parseYouTubeId(youtubeUrl),
    [youtubeUrl]
  );
  const youtubeHint = useMemo(() => {
    if (!youtubeUrl.trim()) return "";
    if (parsedYoutubeId) return "";
    return "That doesn’t look like a YouTube link yet. Paste a youtube.com or youtu.be URL.";
  }, [youtubeUrl, parsedYoutubeId]);

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

  const uploadPhoto = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please choose a photo (JPG or PNG). Videos are not accepted here.");
      return;
    }
    setUploading(true);
    setError("");
    setMessage("Uploading photo…");
    const form = new FormData();
    form.append("type", "photo");
    form.append("file", file);
    form.append("category", photoCategory);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMessage("Photo added to the portfolio.");
      await loadMedia();
    } catch (err) {
      setMessage("");
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addFilm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedYoutubeId) {
      setError("Paste a valid YouTube link.");
      return;
    }
    setAddingFilm(true);
    setError("");
    setMessage("Adding YouTube film…");
    try {
      const res = await fetch("/api/admin/films", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: youtubeUrl,
          title: filmTitle,
          category: filmCategory,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add film");
      setYoutubeUrl("");
      setFilmTitle("");
      setMessage("YouTube film added. It now shows on the Films page.");
      await loadMedia();
    } catch (err) {
      setMessage("");
      setError(err instanceof Error ? err.message : "Could not add film");
    } finally {
      setAddingFilm(false);
    }
  };

  const remove = async (type: "photo" | "video", id: string, label: string) => {
    if (!confirm(`Remove “${label}” from the website? This cannot be undone.`)) {
      return;
    }
    setDeletingId(id);
    const res = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
    });
    if (res.ok) {
      setError("");
      setMessage("Removed.");
      await loadMedia();
    } else {
      setMessage("");
      setError("Could not delete. Try again.");
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
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
        <p className="text-center text-[11px] tracking-[0.24em] text-zinc-500 uppercase">
          JK Photography
        </p>
        <h1 className="mt-2 text-center font-display text-4xl text-zinc-900">
          Admin
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Sign in to manage photos and YouTube films
        </p>
        <form onSubmit={login} className="mt-8 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400"
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
    <div className="mx-auto max-w-5xl px-5 py-8 sm:py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-zinc-500 uppercase">
            JK Photography
          </p>
          <h1 className="mt-1 font-display text-3xl text-zinc-900 sm:text-4xl">
            Studio Admin
          </h1>
          <p className="mt-1 max-w-xl text-sm text-zinc-500">
            Photos go in the portfolio. Films are YouTube links only — MP4 files
            are not accepted.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/films"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700"
          >
            View films page
          </Link>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setTab("photos");
            setError("");
            setMessage("");
          }}
          className={`rounded-full px-5 py-2.5 text-sm ${
            tab === "photos"
              ? "bg-zinc-950 text-white"
              : "border border-zinc-200 bg-white text-zinc-700"
          }`}
        >
          Photos ({photos.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("films");
            setError("");
            setMessage("");
          }}
          className={`rounded-full px-5 py-2.5 text-sm ${
            tab === "films"
              ? "bg-zinc-950 text-white"
              : "border border-zinc-200 bg-white text-zinc-700"
          }`}
        >
          Films ({videos.length})
        </button>
      </div>

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

      {tab === "photos" ? (
        <section className="mb-10 rounded-2xl border border-zinc-200 bg-[#FCFBF9] p-5 sm:p-6">
          <p className="text-sm font-medium text-zinc-900">Add a photo</p>
          <p className="mt-1 mb-4 text-sm text-zinc-500">
            Choose a category, then drop a JPG or PNG. It appears in Portfolio.
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {PHOTO_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setPhotoCategory(c.id)}
                className={`rounded-full px-4 py-2 text-xs ${
                  photoCategory === c.id
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-600 ring-1 ring-zinc-200"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) void uploadPhoto(file);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-white px-6 py-10 transition ${
              dragOver ? "border-zinc-900" : "border-zinc-300 hover:border-zinc-400"
            } ${uploading ? "pointer-events-none opacity-60" : ""}`}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            ) : (
              <ImagePlus className="h-8 w-8 text-zinc-400" />
            )}
            <span className="text-sm text-zinc-600">
              Drop a photo here, or tap to choose (JPG, PNG)
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadPhoto(file);
                e.target.value = "";
              }}
            />
          </label>
        </section>
      ) : (
        <section className="mb-10 rounded-2xl border border-zinc-200 bg-[#FCFBF9] p-5 sm:p-6">
          <p className="text-sm font-medium text-zinc-900">Add a YouTube film</p>
          <p className="mt-1 mb-4 text-sm text-zinc-500">
            Paste a YouTube link from the channel. The film plays on the site —
            we do not accept MP4 or MOV files.
          </p>
          <form onSubmit={addFilm} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs tracking-[0.14em] text-zinc-500 uppercase">
                YouTube link
              </label>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=…"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400"
              />
              {youtubeHint ? (
                <p className="mt-2 text-sm text-amber-700">{youtubeHint}</p>
              ) : null}
            </div>
            {parsedYoutubeId ? (
              <div className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-zinc-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={youtubeThumb(parsedYoutubeId)}
                  alt=""
                  className="h-16 w-28 rounded-md object-cover"
                />
                <div>
                  <p className="inline-flex items-center gap-1 text-xs font-medium text-zinc-800">
                    <Youtube className="h-3.5 w-3.5" />
                    Ready to add
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">{parsedYoutubeId}</p>
                </div>
              </div>
            ) : null}
            <div>
              <label className="mb-1.5 block text-xs tracking-[0.14em] text-zinc-500 uppercase">
                Title (optional)
              </label>
              <input
                type="text"
                value={filmTitle}
                onChange={(e) => setFilmTitle(e.target.value)}
                placeholder="Leave blank to use the YouTube title"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs tracking-[0.14em] text-zinc-500 uppercase">
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {FILM_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFilmCategory(c.id)}
                    className={`rounded-full px-4 py-2 text-xs ${
                      filmCategory === c.id
                        ? "bg-zinc-900 text-white"
                        : "bg-white text-zinc-600 ring-1 ring-zinc-200"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={addingFilm || !parsedYoutubeId}
              className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-[12px] tracking-[0.16em] text-white uppercase disabled:opacity-50"
            >
              {addingFilm ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Youtube className="h-4 w-4" />
              )}
              Add film
            </button>
          </form>
        </section>
      )}

      {tab === "photos" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
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
              <p className="truncate px-2 py-2 text-xs capitalize text-zinc-600">
                {photo.category}
              </p>
              <button
                type="button"
                disabled={deletingId === photo.id}
                onClick={() => remove("photo", photo.id, photo.title || photo.category)}
                className="absolute top-2 right-2 rounded-full bg-red-600 p-2 text-white"
                aria-label="Delete photo"
              >
                {deletingId === photo.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
          {!photos.length ? (
            <p className="col-span-full py-8 text-center text-sm text-zinc-500">
              No uploaded photos yet. Add one above.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="relative overflow-hidden rounded-xl bg-zinc-100"
            >
              <div className="relative aspect-video">
                <Image
                  src={video.poster}
                  alt={video.subtitle || video.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="px-3 py-3">
                <p className="text-[10px] tracking-[0.16em] text-zinc-500 uppercase">
                  {video.category === "prewed" ? "Pre-Wedding" : "Wedding"} ·
                  YouTube
                </p>
                <p className="mt-1 truncate text-sm font-medium text-zinc-900">
                  {video.title}
                </p>
                {video.externalUrl ? (
                  <a
                    href={video.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800"
                  >
                    Open on YouTube
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </div>
              <button
                type="button"
                disabled={deletingId === video.id}
                onClick={() => remove("video", video.id, video.title)}
                className="absolute top-2 right-2 rounded-full bg-red-600 p-2 text-white"
                aria-label="Delete film"
              >
                {deletingId === video.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
          {!videos.length ? (
            <p className="col-span-full py-8 text-center text-sm text-zinc-500">
              No YouTube films yet. Paste a link above.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
