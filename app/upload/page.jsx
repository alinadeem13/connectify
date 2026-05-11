'use client';

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setUploading(true);
    setError("");
    setImageUrl("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Upload failed.");
      }

      setImageUrl(result.imageUrl);
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[radial-gradient(circle_at_top,#12345c_0%,#0b1224_38%,#08101d_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-white/10 bg-slate-950/50 p-8 shadow-2xl backdrop-blur">
        <h1 className="text-3xl font-bold">Upload Image</h1>
        <p className="mt-2 text-slate-300">
          Select an image and upload it to Azure Blob Storage.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400/20 file:px-4 file:py-2 file:text-cyan-100"
          />

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:from-sky-400 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>

          {error && (
            <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          )}

          {imageUrl && (
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-cyan-200">Upload successful.</p>
              <img
                src={imageUrl}
                alt="Uploaded preview"
                className="w-full rounded-2xl object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
