'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import supabase from "@/lib/supabase";

type CurrentUser = {
    id: string;
    name: string;
    role: "creator" | "consumer";
    username: string;
};

export default function UploadPhotoForm() {
    const router = useRouter();
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [form, setForm] = useState({
        title: "",
        caption: "",
        location: "",
        peoplePresent: "",
    });

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const response = await fetch("/api/auth/me", { cache: "no-store" });
            const result = await response.json();
            if (response.ok) {
                setUser(result.user);
            }
            setLoadingUser(false);
        };

        void fetchCurrentUser();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            toast.error("Please select an image file first.");
            return;
        }

        setSubmitting(true);

        try {
            const fileExt = selectedFile.name.split(".").pop();
            const fileName = `${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("images")
                .upload(fileName, selectedFile);

            if (uploadError) {
                toast.error(uploadError.message ?? "Image upload failed.");
                return;
            }

            const { data } = supabase.storage.from("images").getPublicUrl(fileName);

            const photoResponse = await fetch("/api/photos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: form.title,
                    caption: form.caption,
                    location: form.location,
                    peoplePresent: form.peoplePresent.split(",").map((value) => value.trim()).filter(Boolean),
                    imageUrl: data.publicUrl,
                    storagePath: fileName,
                }),
            });
            const photoResult = await photoResponse.json();

            if (!photoResponse.ok) {
                toast.error(photoResult.message ?? "Photo creation failed.");
                return;
            }

            toast.success("Photo uploaded successfully.");
            router.push(`/photos/${photoResult.photo.id}`);
            router.refresh();
        } catch {
            toast.error("Something went wrong while uploading the photo.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingUser) {
        return <p className="text-slate-300">Checking account access...</p>;
    }

    if (!user || user.role !== "creator") {
        return (
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-6 text-slate-300 shadow-xl">
                Only creator accounts can upload photos.
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-3xl rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-6 shadow-xl backdrop-blur">
            <h1 className="text-3xl font-bold text-white">Upload Photo</h1>
            <p className="mt-2 text-slate-300">
                Signed in as {user.name} (@{user.username}).
            </p>

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Title"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                    required
                />
                <textarea
                    placeholder="Caption"
                    value={form.caption}
                    onChange={(e) => setForm((prev) => ({ ...prev, caption: e.target.value }))}
                    className="min-h-32 rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                    required
                />
                <input
                    type="text"
                    placeholder="Location"
                    value={form.location}
                    onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                    required
                />
                <input
                    type="text"
                    placeholder="People present, separated by commas"
                    value={form.peoplePresent}
                    onChange={(e) => setForm((prev) => ({ ...prev, peoplePresent: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                    className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400/20 file:px-4 file:py-2 file:text-cyan-100"
                    required
                />
                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:from-sky-400 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {submitting ? "Uploading..." : "Upload Photo"}
                </button>
            </form>
        </div>
    );
}
