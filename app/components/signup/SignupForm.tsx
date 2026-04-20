'use client'
import { useRouter } from "next/navigation";
import { useState } from "react"
import { toast } from "react-toastify";

export default function SignupForm() {
    const router = useRouter()

    const [formdata, setFormdata] = useState({
        name: '',
        email: '',
        role: '',
        password: '',
        confirmPassword: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormdata({
            ...formdata,
            [e.target.name]: e.target.value,
        })
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if ((formdata.password !== formdata.confirmPassword)) {
            toast.error("Passwords do not match", {
                position: "top-right",
                autoClose: 5000,

            })


            return
        }
        if (formdata.password.length < 6) {
            toast.error("Password must be at least 6 characters long", {
                position: "top-right",
                autoClose: 5000,
            })
            return
        }
        else {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formdata.name,
                    email: formdata.email,
                    role: formdata.role,
                    password: formdata.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.message ?? "Signup failed.", {
                    position: "top-right",
                    autoClose: 5000,
                })
                return
            }

            toast.success("Signup successful!", {
                position: "top-right",
                autoClose: 5000,
            })
            setFormdata({
                name: '',
                email: '',
                role: '',
                password: '',
                confirmPassword: '',
            })
            router.push('/')
            router.refresh()
            return


        }
        // Handle form submission logic here
    }


    return (
        <div className="w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
                <h1 className="text-3xl font-bold text-center text-white">Signup</h1>

                <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={formdata.name}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-slate-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="john@example.com"
                        value={formdata.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-slate-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                        required
                    />
                    {/* <label className="text-sm text-slate-400">Role</label> */}
                    <select
                        name="role"
                        value={formdata.role}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-white/15 bg-gray-500 px-3 py-2 text-white focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                        required
                    >
                        <option value="">Select Role</option>
                        <option value="creator" className="bg-gray-500 text-white">Creator</option>
                        <option value="consumer" className="bg-gray-500 text-white">Consumer</option>
                    </select>

                    <input

                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formdata.password}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-slate-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                        required
                    />
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formdata.confirmPassword}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-slate-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                        required
                    />

                    <button
                        type="submit"
                        className="mt-2 w-full rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 py-2 font-semibold text-slate-950 transition hover:from-sky-400 hover:to-cyan-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    >
                        Sign Up
                    </button>
                </form>

                <p className="mt-4 text-center text-slate-200">
                    Already have an account?{" "}
                    <a href="/login" className="text-cyan-200 hover:text-white underline-offset-4 hover:underline">
                        Log in
                    </a>
                </p>
            </div>
        </div>
    );
}
