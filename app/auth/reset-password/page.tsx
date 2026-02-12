"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import ThemeSwitch from "@/shared/components/layout/theme/ThemeSwitch";
import { useAuthStore } from "@/shared/store/pages";

const ResetPasswordContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get("email") ?? "";
    const email =
        emailParam ||
        (typeof window !== "undefined" ? localStorage.getItem("resetEmail") ?? "" : "");
    const [isVerified, setIsVerified] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const {
        verifyPasswordResetOtp,
        resetPassword,
        loadingResetVerify,
        loadingResetConfirm,
    } = useAuthStore();

    useEffect(() => {
        if (!emailParam) return;
        localStorage.setItem("resetEmail", emailParam);
    }, [emailParam]);

    const maskedEmail = useMemo(() => {
        if (!email) return "";
        const [name, domain] = email.split("@");
        if (!name || !domain) return email;
        return `${name.slice(0, 2)}***@${domain}`;
    }, [email]);

    const canVerify = otp.length === 6 && email.length > 0 && !loadingResetVerify;
    const canReset = isVerified && newPassword.length >= 8 && !loadingResetConfirm;

    const handleVerify = async () => {
        if (!canVerify) return;
        const isValid = await verifyPasswordResetOtp(email, otp);
        if (isValid) {
            setIsVerified(true);
        }
    };

    const handleReset = async () => {
        if (!canReset) return;
        const isReset = await resetPassword(email, otp, newPassword);
        if (isReset) {
            localStorage.removeItem("resetEmail");
            router.push("/auth/login");
        }
    };

    return (
        <div className="light-neutral-scope">
            <section className="relative flex min-h-screen items-center justify-center bg-blue-50 px-4 py-10 dark:bg-slate-950">
                <div className="absolute right-6 top-6">
                    <ThemeSwitch />
                </div>
                <div className="w-full max-w-md rounded-md border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-300">
                            Reset your password
                        </h1>
                        <p className="mt-2 text-sm text-blue-600 dark:text-slate-300">
                            Enter the 6-digit code we sent to{" "}
                            <span className="font-medium text-blue-700 dark:text-blue-300">
                                {maskedEmail || "your email"}
                            </span>
                            .
                        </p>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="flex justify-center">
                            <InputOTP
                                maxLength={6}
                                value={otp}
                                onChange={(value) => {
                                    setOtp(value);
                                    if (isVerified) setIsVerified(false);
                                }}
                                render={({ slots }) => (
                                    <InputOTPGroup>
                                        {slots.map((slot, index) => (
                                            <InputOTPSlot key={index} {...slot} />
                                        ))}
                                    </InputOTPGroup>
                                )}
                            />
                        </div>

                        <Button
                            type="button"
                            disabled={!canVerify}
                            onClick={handleVerify}
                            className="w-full rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white hover:from-[#009ad5] hover:to-[#005ca9]"
                        >
                            {loadingResetVerify ? "Verifying..." : "Verify OTP"}
                        </Button>

                        {isVerified && (
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                    New password
                                </label>
                                <Input
                                    type="password"
                                    placeholder="Enter your new password"
                                    className="dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-400"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                />
                                <Button
                                    type="button"
                                    disabled={!canReset}
                                    onClick={handleReset}
                                    className="w-full rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white hover:from-[#009ad5] hover:to-[#005ca9]"
                                >
                                    {loadingResetConfirm ? "Resetting..." : "Reset password"}
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href="/auth/login"
                            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                        >
                            Back to login
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

const ResetPasswordPage = () => {
    return (
        <Suspense fallback={null}>
            <ResetPasswordContent />
        </Suspense>
    );
};

export default ResetPasswordPage;

