"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { GENERAL_LOADING_ID } from "@/constants";
import { getSupabase } from "@/lib/supabase";
import { Camera, RotateCcw, Send, Image as ImageIcon, Sparkles } from "lucide-react";
import Link from "next/link";

export default function GuestbookPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  useEffect(() => {
    const loader = document.getElementById(GENERAL_LOADING_ID);
    if (loader) {
      loader.style.opacity = "0";
      loader.style.display = "none";
    }
    if (localStorage.getItem("guestbook_submitted") === "true") {
      setAlreadySubmitted(true);
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setCameraError("Could not access camera. Please allow camera permissions.");
      console.error("Camera error:", err);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flip horizontally for selfie mirror effect
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const toggleCamera = () => {
    stopCamera();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const uploadImage = async (dataUrl: string): Promise<string | null> => {
    const blob = await fetch(dataUrl).then((res) => res.blob());
    const fileName = `guest-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

    const { error } = await getSupabase().storage
      .from("guestbook-photos")
      .upload(fileName, blob, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data } = getSupabase().storage.from("guestbook-photos").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capturedImage || !guestName.trim() || !message.trim()) return;

    setIsSubmitting(true);

    try {
      const photoUrl = await uploadImage(capturedImage);
      if (!photoUrl) {
        alert("Failed to upload photo. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const { error } = await getSupabase().from("guestbook_entries").insert({
        guest_name: guestName.trim(),
        message: message.trim(),
        photo_url: photoUrl,
      });

      if (error) {
        console.error("Insert error:", error);
        alert("Failed to save entry. Please try again.");
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem("guestbook_submitted", "true");
      setSubmitted(true);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (alreadySubmitted || submitted) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="text-center max-w-md w-full">
          <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--gold)" }} />
          <h1
            className="text-4xl mb-4"
            style={{
              fontFamily: "var(--font-great-vibes), cursive",
              color: "var(--foreground)",
            }}
          >
            {submitted ? "Thank You!" : "Already Shared!"}
          </h1>
          <p className="text-lg mb-8" style={{ color: "var(--foreground-base)" }}>
            {submitted
              ? "Your message and photo have been saved. It means the world to Menna & Ahmed."
              : "You've already left your wish. Thank you for being part of this special day!"}
          </p>
          <Link
            href="/gallery"
            className="inline-block px-6 py-3 rounded-full text-white font-medium transition-transform hover:scale-105"
            style={{ backgroundColor: "var(--foreground)" }}
          >
            View Gallery
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-5xl mb-2"
            style={{
              fontFamily: "var(--font-great-vibes), cursive",
              color: "var(--foreground)",
            }}
          >
            Guestbook
          </h1>
          <p style={{ color: "var(--foreground-base)" }}>
            Leave a photo &amp; a wish for{" "}
            <span className="font-medium" style={{ color: "var(--foreground)" }}>
              Menna &amp; Ahmed
            </span>
          </p>
        </div>

        {/* Camera / Preview */}
        <div className="mb-6">
          {!capturedImage ? (
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-black shadow-lg">
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 text-center">
                  <ImageIcon className="w-10 h-10 mb-3 opacity-60" />
                  <p className="mb-4">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-full bg-white/20 backdrop-blur text-white text-sm"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: facingMode === "user" ? "scaleX(-1)" : undefined }}
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                    <button
                      onClick={toggleCamera}
                      className="p-3 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/30 transition"
                      aria-label="Switch camera"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={capturePhoto}
                      className="w-16 h-16 rounded-full border-4 border-white bg-white/90 flex items-center justify-center hover:scale-105 transition"
                      aria-label="Take photo"
                    >
                      <div
                        className="w-12 h-12 rounded-full"
                        style={{ backgroundColor: "var(--foreground)" }}
                      />
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-lg">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center">
                <button
                  onClick={retakePhoto}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur text-sm font-medium hover:bg-white transition"
                  style={{ color: "var(--foreground)" }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Retake
                </button>
              </div>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="guestName"
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--foreground)" }}
            >
              Your Name
            </label>
            <input
              id="guestName"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl border bg-white/50 focus:outline-none focus:ring-2 transition"
              style={{
                borderColor: "rgba(59, 42, 35, 0.15)",
                color: "var(--foreground)",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--foreground)" }}
            >
              Your Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              placeholder="Write a wish or memory for the couple..."
              className="w-full px-4 py-3 rounded-xl border bg-white/50 focus:outline-none focus:ring-2 transition resize-none"
              style={{
                borderColor: "rgba(59, 42, 35, 0.15)",
                color: "var(--foreground)",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!capturedImage || isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ backgroundColor: "var(--foreground)" }}
          >
            {isSubmitting ? (
              <span className="animate-pulse">Sending...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Wish
              </>
            )}
          </button>

          {!capturedImage && (
            <p className="text-xs text-center" style={{ color: "var(--foreground-base)" }}>
              Take a photo first to enable sending.
            </p>
          )}
        </form>

        {/* Footer link */}
        <div className="mt-8 text-center">
          <Link
            href="/gallery"
            className="text-sm font-medium hover:underline"
            style={{ color: "var(--foreground-base)" }}
          >
            View all wishes &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
