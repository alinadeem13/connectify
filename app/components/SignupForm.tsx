'use client'
import { useRouter } from "next/navigation";
import { useState } from "react"
import { ToastContainer, toast } from "react-toastify";

export default function SignupForm() {
    const router = useRouter()

    const [formdata, setFormdata] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormdata({
            ...formdata,
            [e.target.name]: e.target.value,
        })
    }   

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if((formdata.password !== formdata.confirmPassword) ) {
         toast.error("Passwords do not match", {
            position: "top-right",
            autoClose: 5000,
            
            })
         
    
            return
        }
         if(formdata.password.length < 6) {
                toast.error("Password must be at least 6 characters long", {
                    position: "top-right",  
                    autoClose: 5000,
                })
                return
            } 
        else {
            toast.success("Signup successful!", {
                position: "top-right",
                autoClose: 5000,
            })
                    console.log("Submitted:", formdata)
                    setFormdata({
                        name: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                    })
                    router.push('/login')
                    return

            
        }
        // Handle form submission logic here
    }

   
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold text-center">Signup</h1>

            <form className="mt-4 flex flex-col gap-4" onSubmit={onSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formdata.name}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
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
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formdata.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />

                <button
                    type="submit"
                    className="mt-2 w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600"
                >
                    Sign Up
                </button>
            </form>

            <p className="mt-4 text-center">
                Already have an account?{" "}
                <a href="/login" className="text-blue-500 hover:underline">
                    Log in
                </a>
            </p>
        </div>
    </div>
);
}