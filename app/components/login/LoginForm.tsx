'use client'

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function LoginForm() {
    const router = useRouter();
    const [formdata, setFormdata] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormdata({
            ...formdata,
            [e.target.name]: e.target.value,
        });
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formdata),
            });

            const result = await response.json();
            if (!response.ok) {
                toast.error(result.message ?? "Login failed.", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            toast.success("Login successful!", {
                position: "top-right",
                autoClose: 3000,
            });
            setFormdata({
                email: '',
                password: '',
            });
            router.push('/');
            router.refresh();
        } catch {
            toast.error("Something went wrong while logging in.", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
                <h1 className="text-3xl font-bold text-center text-white">Login</h1>

                <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="john@example.com"
                        value={formdata.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-slate-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formdata.password}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-slate-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                        required
                    />

                    <button
                        type="submit"
                        className="mt-2 w-full rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 py-2 font-semibold text-slate-950 transition hover:from-sky-400 hover:to-cyan-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    >
                        Login
                    </button>
                </form>
                <p className="mt-4 text-center text-slate-200">Don&apos;t have an account? <a href="/signup" className="text-cyan-200 hover:text-white underline-offset-4 hover:underline">Sign up</a></p>
            </div>
        </div>
    );
}
