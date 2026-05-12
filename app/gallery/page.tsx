"use client";

import { useEffect, useState } from "react";
import { GENERAL_LOADING_ID } from "@/constants";
import { getSupabase } from "@/lib/supabase";
import { Heart, ArrowLeft, ImageOff, Lock, Download } from "lucide-react";
import Link from "next/link";
import customerDetails from "@/customer-details.json";

interface GuestbookEntry {
  id: string;
  created_at: string;
  guest_name: string;
  message: string;
  photo_url: string;
}

export default function GalleryPage() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<GuestbookEntry | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    const loader = document.getElementById(GENERAL_LOADING_ID);
    if (loader) {
      loader.style.opacity = "0";
      loader.style.display = "none";
    }
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("gallery_unlocked") === "true") {
      setUnlocked(true);
    }
  }, []);

  const downloadPhoto = async (url: string, name: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${name.replace(/\s+/g, "-")}-wish.jpg`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === customerDetails.gallery_password) {
      sessionStorage.setItem("gallery_unlocked", "true");
      setUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput("");
    }
  };

  useEffect(() => {
    if (!unlocked) return;
    const fetchEntries = async () => {
      const { data, error } = await getSupabase()
        .from("guestbook_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching entries:", error);
      } else {
        setEntries(data || []);
      }
      setLoading(false);
    };

    fetchEntries();

    // Real-time updates
    const subscription = getSupabase()
      .channel("guestbook_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "guestbook_entries" },
        (payload: { new: GuestbookEntry }) => {
          setEntries((prev) => [payload.new as GuestbookEntry, ...prev]);
        }
      )
      .subscribe();

    return () => {
      getSupabase().removeChannel(subscription);
    };
  }, [unlocked]);

  if (!unlocked) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="w-full max-w-xs">
          <div className="text-center mb-8">
            <Lock className="w-10 h-10 mx-auto mb-4" style={{ color: "var(--foreground)" }} />
            <h1
              className="text-4xl mb-2"
              style={{
                fontFamily: "var(--font-great-vibes), cursive",
                color: "var(--foreground)",
              }}
            >
              Gallery
            </h1>
            <p className="text-sm" style={{ color: "var(--foreground-base)" }}>
              Enter the password to view the gallery
            </p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
              placeholder="Password"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border bg-white/50 focus:outline-none focus:ring-2 transition text-center tracking-widest"
              style={{
                borderColor: passwordError ? "#e53e3e" : "rgba(59, 42, 35, 0.15)",
                color: "var(--foreground)",
              }}
            />
            {passwordError && (
              <p className="text-sm text-center" style={{ color: "#e53e3e" }}>
                Incorrect password. Try again.
              </p>
            )}
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-full text-white font-medium transition hover:scale-[1.02]"
              style={{ backgroundColor: "var(--foreground)" }}
            >
              View Gallery
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "var(--foreground)", borderTopColor: "transparent" }}
          />
          <p style={{ color: "var(--foreground-base)" }}>Loading memories...</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 rounded-full transition hover:bg-black/5"
            style={{ color: "var(--foreground)" }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1
              className="text-4xl"
              style={{
                fontFamily: "var(--font-great-vibes), cursive",
                color: "var(--foreground)",
              }}
            >
              Guestbook Gallery
            </h1>
            <p className="text-sm" style={{ color: "var(--foreground-base)" }}>
              {entries.length} wish{entries.length !== 1 ? "es" : ""} for Menna &amp; Ahmed
            </p>
          </div>
        </div>

        {entries.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl border border-dashed"
            style={{ borderColor: "rgba(59, 42, 35, 0.2)" }}
          >
            <ImageOff className="w-10 h-10 mx-auto mb-3 opacity-40" style={{ color: "var(--foreground)" }} />
            <p className="text-lg font-medium mb-1" style={{ color: "var(--foreground)" }}>
              No entries yet
            </p>
            <p className="mb-6" style={{ color: "var(--foreground-base)" }}>
              Be the first to leave a wish!
            </p>
            <Link
              href="/guestbook"
              className="inline-block px-6 py-2 rounded-full text-white font-medium transition hover:scale-105"
              style={{ backgroundColor: "var(--foreground)" }}
            >
              Leave a Wish
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className="text-left group rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-white border"
                style={{ borderColor: "rgba(59, 42, 35, 0.08)" }}
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={entry.photo_url}
                    alt={`Photo by ${entry.guest_name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <p className="font-medium truncate" style={{ color: "var(--foreground)" }}>
                    {entry.guest_name}
                  </p>
                  <p
                    className="text-sm line-clamp-2 mt-1"
                    style={{ color: "var(--foreground-base)" }}
                  >
                    {entry.message}
                  </p>
                  <p className="text-xs mt-2" style={{ color: "var(--foreground-base)", opacity: 0.6 }}>
                    {new Date(entry.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEntry(null)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-square bg-gray-100">
              <img
                src={selectedEntry.photo_url}
                alt={`Photo by ${selectedEntry.guest_name}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5" style={{ backgroundColor: "var(--background)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-current" style={{ color: "var(--gold)" }} />
                  <p className="font-medium" style={{ color: "var(--foreground)" }}>
                    {selectedEntry.guest_name}
                  </p>
                </div>
                <button
                  onClick={() => downloadPhoto(selectedEntry.photo_url, selectedEntry.guest_name)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition hover:scale-105"
                  style={{ backgroundColor: "var(--foreground)", color: "white" }}
                >
                  <Download className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-base)" }}>
                {selectedEntry.message}
              </p>
              <p className="text-xs mt-3" style={{ color: "var(--foreground-base)", opacity: 0.6 }}>
                {new Date(selectedEntry.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <button
              onClick={() => setSelectedEntry(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition backdrop-blur"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
