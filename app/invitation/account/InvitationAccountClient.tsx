"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInvitationStore } from "@/shared/store/pages";

const CenteredCard = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-100 px-6 py-12 text-foreground dark:from-slate-950 dark:via-slate-950 dark:to-[#001728]">
            <div className="w-full max-w-lg rounded-3xl border border-blue-200 bg-white p-6 text-center shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                {children}
            </div>
        </main>
    );
};

const InvitationAccountClient = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token") ?? undefined;
    const accountStatus = useInvitationStore((state) => state.accountStatus);
    const accountMessage = useInvitationStore((state) => state.accountMessage);
    const accountEmail = useInvitationStore((state) => state.accountEmail);
    const createAccount = useInvitationStore((state) => state.createAccount);
    const completeAccount = useInvitationStore((state) => state.completeAccount);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitError, setSubmitError] = useState<string | null>(null);

    const canSubmit = useMemo(() => {
        if (password.length < 8 || confirmPassword.length < 8) return false;
        return password === confirmPassword;
    }, [password, confirmPassword]);

    useEffect(() => {
        void createAccount(token);
    }, [createAccount, token]);

    useEffect(() => {
        if (
            accountStatus === "creating" ||
            accountStatus === "setting" ||
            accountStatus === "created"
        ) {
            const handler = (event: BeforeUnloadEvent) => {
                event.preventDefault();
                event.returnValue = "Your account is being prepared. Please stay on this page.";
            };
            window.addEventListener("beforeunload", handler);
            return () => window.removeEventListener("beforeunload", handler);
        }
        return undefined;
    }, [accountStatus]);

    useEffect(() => {
        if (accountStatus === "completed") {
            router.replace("/");
        }
    }, [accountStatus, router]);


    const handleSubmit = async () => {
        setSubmitError(null);
        if (!canSubmit) {
            setSubmitError("Passwords must match and be at least 8 characters.");
            return;
        }
        if (!token) {
            setSubmitError("Invitation token is missing.");
            return;
        }
        const ok = await completeAccount(token, password);
        if (!ok) {
            setSubmitError("Failed to set password. Please try again.");
        }
    };

    return (
        <CenteredCard>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-white/90 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/70 dark:shadow-none">
                {accountStatus === "completed" ? (
                    <ShieldCheck className="h-6 w-6 text-[#009ad5]" />
                ) : (
                    <Loader2 className="h-6 w-6 animate-spin text-[#009ad5]" />
                )}
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-[--color-main-portage]">
                Setting up your account
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-foreground">
                We are creating your account
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
                {accountStatus === "error"
                    ? accountMessage
                    : accountStatus === "created"
                        ? "Your account is ready. Please set your password to continue."
                        : "Please wait a few seconds. Do not close this page."}
            </p>
            {(accountStatus === "created" || accountStatus === "setting") && (
                <div className="mt-4 w-full rounded-2xl border border-blue-200 bg-white p-4 text-left dark:border-slate-700/60 dark:bg-slate-900">
                    <p className="text-sm font-medium text-foreground">
                        Set your password
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Create a secure password to access your account.
                    </p>
                    {accountEmail && (
                        <p className="mt-3 text-xs text-muted-foreground">
                            Account email: {accountEmail}
                        </p>
                    )}
                    <div className="mt-4 flex flex-col gap-3">
                        <input
                            type="password"
                            placeholder="New password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-400"
                        />
                        <input
                            type="password"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-400"
                        />
                        {submitError && (
                            <p className="text-xs text-red-500">{submitError}</p>
                        )}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!canSubmit || accountStatus === "setting"}
                            className="w-full rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] px-4 py-2 text-sm font-semibold text-white transition-all hover:from-[#009ad5]/90 hover:to-[#005ca9]/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {accountStatus === "setting"
                                ? "Setting password..."
                                : "Save password"}
                        </button>
                    </div>
                </div>
            )}
            {accountStatus === "completed" && (
                <p className="mt-4 text-sm text-muted-foreground">
                    Your account is ready. You can continue the hiring flow now.
                </p>
            )}
        </CenteredCard>
    );
};

export default InvitationAccountClient;

