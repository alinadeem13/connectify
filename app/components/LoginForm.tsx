'use client'
import { useRouter } from "next/navigation";
import { useState } from "react"
import {  toast } from "react-toastify";

export default function LoginForm() {

    const router = useRouter()

    const [formdata, setFormdata] = useState({

        email: '',
        password: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormdata({
            ...formdata,
            [e.target.name]: e.target.value,
        })
    }   

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        router.push('/')
        toast.success("Login successful!", {
            position: "top-right",
            autoClose: 3000,
        })
        console.log("Submitted:", formdata)
        setFormdata({
            email: '',
            password: '',
        })
        return
        // Handle form submission logic here
       
      
    }

   
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <div className="w-full max-w-sm">
                <h1 className="text-3xl font-bold text-center">Login</h1>

                <form className="mt-4 flex flex-col gap-4" onSubmit={onSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="john@example.com"
                        value={formdata.email}
                        onChange={handleChange}
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                  
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formdata.password}
                        onChange={handleChange}
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                   

                    <button
                        type="submit"
                        className="mt-2 w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600"
                    >
                        Login                    </button>
                </form>
                                <p className="mt-4 text-center">Don't have an account? <a href="/signup" className="text-blue-500 hover:underline">Sign up</a></p>

            </div>
        </div>
    );
}