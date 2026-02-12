"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Briefcase, FileText, Lock, Mail, Sparkles, Users } from "lucide-react";
import ThemeSwitch from "@/shared/components/layout/theme/ThemeSwitch";
import { ACCESS_TOKEN_KEY } from "@/lib/authTokens";
import { useAuthStore } from "@/shared/store/pages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const LoginPage = () => {
    const router = useRouter();
    const { login, storeTokens, loadingLogin, requestPasswordReset, loadingResetRequest } =
        useAuthStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [resetEmail, setResetEmail] = useState("");
    const [resetError, setResetError] = useState<string | null>(null);
    const [isResetOpen, setIsResetOpen] = useState(false);

    useEffect(() => {
        const token = Cookies.get(ACCESS_TOKEN_KEY);
        if (token) {
            router.replace("/");
        }
    }, [router]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        const result = await login(email, password);
        if (!result?.access_token) {
            setError("Login failed. Please check your credentials.");
            return;
        }
        storeTokens(result.access_token, result.refresh_token);
        router.replace("/");
    };

    const handleResetSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setResetError(null);
        const ok = await requestPasswordReset(resetEmail);
        if (!ok) {
            setResetError("Failed to send reset OTP. Please try again.");
            return;
        }
        setIsResetOpen(false);
        router.push(`/auth/reset-password?email=${encodeURIComponent(resetEmail)}`);
    };

    return (
        <div className="light-neutral-scope">
            <section className="relative flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-100 px-4 py-10 dark:from-slate-950 dark:via-slate-950 dark:to-[#001728]">
                <div className="absolute right-6 top-6">
                    <ThemeSwitch />
                </div>
                <div className="w-full max-w-5xl">
                    <div className="grid md:grid-cols-2">
                        <div className="order-2 rounded-md rounded-r-none border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none md:order-1">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-300">
                                        Welcome Back
                                    </h1>
                                    <p className="mt-1 text-sm text-blue-600 dark:text-slate-300">
                                        Sign in to access your candidate dashboard
                                    </p>
                                </div>
                            </div>

                            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-500 dark:text-slate-300" />
                                        <Input
                                            type="email"
                                            placeholder="Enter your email"
                                            className="pl-9 dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-400"
                                            value={email}
                                            onChange={(event) => setEmail(event.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-500 dark:text-slate-300" />
                                        <Input
                                            type="password"
                                            placeholder="Enter your password"
                                            className="pl-9 dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-400"
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-xs text-red-500">{error}</p>}

                                <Button
                                    type="submit"
                                    disabled={loadingLogin || !email || !password}
                                    className="w-full rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white hover:from-[#009ad5] hover:to-[#005ca9]"
                                >
                                    {loadingLogin ? "Signing in..." : "Sign In"}
                                </Button>
                            </form>

                            <div className="mt-4 text-center">
                                <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                                    <DialogTrigger asChild>
                                        <button
                                            type="button"
                                            className="text-sm text-slate-600 hover:underline dark:text-blue-400"
                                        >
                                            Forgot your password?
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Reset your password</DialogTitle>
                                            <DialogDescription>
                                                Enter your email address and we&apos;ll send you a link
                                                to reset your password.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form
                                            className="mt-4 space-y-4"
                                            onSubmit={handleResetSubmit}
                                        >
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">
                                                    Email address
                                                </label>
                                                <div className="relative">
                                                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                                                    <Input
                                                        type="email"
                                                        placeholder="Enter your email address"
                                                        className="pl-9"
                                                        value={resetEmail}
                                                        onChange={(event) =>
                                                            setResetEmail(event.target.value)
                                                        }
                                                    />
                                                </div>
                                                {resetError && (
                                                    <p className="text-xs text-red-500">{resetError}</p>
                                                )}
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={!resetEmail || loadingResetRequest}
                                                className="w-full rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white hover:from-[#009ad5] hover:to-[#005ca9]"
                                            >
                                                {loadingResetRequest ? "Sending..." : "Send reset OTP"}
                                            </Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="mt-6 flex items-center gap-3 text-xs text-blue-500 dark:text-slate-400">
                                <span className="h-px flex-1 bg-blue-200 dark:bg-slate-700" />
                                OR CONTINUE WITH
                                <span className="h-px flex-1 bg-blue-200 dark:bg-slate-700" />
                            </div>

                            <button
                                type="button"
                                className="mt-4 w-full rounded-md border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                            >
                                Continue with Google
                            </button>

                            <p className="mt-6 text-center text-sm text-blue-600 dark:text-slate-300">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/auth/signup"
                                    className="text-blue-700 hover:underline dark:text-blue-400"
                                >
                                    Sign up here
                                </Link>
                            </p>
                        </div>
                        <div className="order-1 rounded-md rounded-l-none border border-blue-400/60 bg-linear-to-r from-[#009ad5]/90 to-[#005ca9]/90 p-8 text-white shadow-md shadow-blue-200/60 backdrop-blur-md dark:shadow-none md:order-2">
                            <div className="flex h-full flex-col justify-between gap-8">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-sm">
                                        <img
                                            src="/brand/plato-logo.png"
                                            alt="Plato logo"
                                            className="h-8 w-8 object-contain"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm uppercase tracking-wide text-blue-100">
                                            Plato Candidate
                                        </p>
                                        <h2 className="text-xl font-semibold">Plato</h2>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <div className="inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm text-white">
                                        <Sparkles className="h-4 w-4 text-white" />
                                        AI insights
                                    </div>
                                    <div className="inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm text-white">
                                        <FileText className="h-4 w-4 text-white" />
                                        Smart interviews
                                    </div>
                                    <div className="inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm text-white">
                                        <Briefcase className="h-4 w-4 text-white" />
                                        Role matching
                                    </div>
                                    <div className="inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm text-white">
                                        <Users className="h-4 w-4 text-white" />
                                        Feedback loops
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-semibold">
                                        Prepare for interviews that feel human.
                                    </h2>
                                    <p className="mt-3 text-sm text-blue-100/90">
                                        Keep your profile ready, practice with AI, and track your
                                        progress in one place.
                                    </p>
                                </div>
                                <div className="rounded-md bg-white/10 p-4 text-sm text-blue-100">
                                    “Plato helped me prepare in days, not weeks.”
                                    <span className="mt-2 block text-xs text-blue-100/80">
                                        Candidate, Product Team
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LoginPage;

