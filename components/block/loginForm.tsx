"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/api"
import { useState } from "react"
import { useRouter } from "next/navigation"




export default function LoginForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            console.log("Login attempt")
            await apiFetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            })
            console.log("Login successful")
            router.push("/")
        } catch (error) {
            console.log(error)
            setError(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-sm">

            <CardHeader>
                <CardTitle>Login to your account</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account
                </CardDescription>
                <CardAction>
                    <Button variant="link">Sign Up</Button>
                </CardAction>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} id="login-form" >

                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                                <a
                                    href="#"
                                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                >
                                    Forgot your password?
                                </a>
                            </div>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                    </div>
                </form >

            </CardContent>
            {error && <p role="alert" className="text-red-500 text-sm">{error}</p>}

            <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full" form="login-form">
                    Login
                </Button>
            </CardFooter>
        </Card>

    )
}