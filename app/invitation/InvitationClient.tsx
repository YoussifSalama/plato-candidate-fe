"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import RedirectNotice from "./RedirectNotice";
import { useInvitationStore } from "@/shared/store/pages";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const CenteredCard = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-100 px-6 py-12 text-foreground dark:from-slate-950 dark:via-slate-950 dark:to-[#001728]">
            <div className="w-full max-w-lg rounded-3xl border border-blue-200 bg-white p-8 text-center shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                {children}
            </div>
        </main>
    );
};

const InvitationClient = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token") ?? undefined;
    const status = useInvitationStore((state) => state.status);
    const message = useInvitationStore((state) => state.message);
    const validateToken = useInvitationStore((state) => state.validateToken);

    useEffect(() => {
        void validateToken(token);
    }, [token, validateToken]);

    useEffect(() => {
        if (status === "valid" && token) {
            router.replace(`/invitation/account?token=${encodeURIComponent(token)}`);
        }
    }, [router, status, token]);

    if (status === "loading" || status === "idle") {
        return (
            <CenteredCard>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-white/90 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/70 dark:shadow-none">
                    <Loader2 className="h-6 w-6 animate-spin text-[#009ad5]" />
                </div>
                <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-[--color-main-portage]">
                    Checking invitation
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-foreground">
                    Validating your invitation
                </h1>
                <p className="mt-3 text-base text-muted-foreground">
                    Please wait while we verify the invitation details.
                </p>
            </CenteredCard>
        );
    }

    if (status === "valid") {
        return (
            <CenteredCard>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-white/90 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/70 dark:shadow-none">
                    <Loader2 className="h-6 w-6 animate-spin text-[#009ad5]" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[--color-main-turkishBlue]">
                    Invitation Verified
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-foreground">
                    Preparing your account
                </h1>
                <p className="mt-3 text-base text-muted-foreground">
                    Redirecting you to complete your invitation.
                </p>
            </CenteredCard>
        );
    }

    if (status === "missing") {
        return (
            <CenteredCard>
                <p className="text-sm font-semibold uppercase tracking-wide text-[--color-main-honeyBerry]">
                    No invitation found
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-foreground">
                    Invitation token not provided
                </h1>
                <p className="mt-3 text-base text-muted-foreground">
                    {message || "Please check the invitation link and try again."}
                </p>
                <RedirectNotice redirectTo="/" seconds={6} />
            </CenteredCard>
        );
    }

    if (status === "invalid") {
        return (
            <CenteredCard>
                <p className="text-sm font-semibold uppercase tracking-wide text-red-500">
                    Invalid invitation
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-foreground">
                    We could not verify this invitation
                </h1>
                <p className="mt-3 text-base text-muted-foreground">
                    {message || "This invitation link is invalid or has expired."}
                </p>
                <RedirectNotice redirectTo="/" seconds={8} />
            </CenteredCard>
        );
    }

    return (
        <CenteredCard>
            <p className="text-sm font-semibold uppercase tracking-wide text-[--color-main-portage]">
                Something went wrong
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-foreground">
                Unable to validate this invitation
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
                {message || "Please try again in a moment."}
            </p>
            <RedirectNotice redirectTo="/" seconds={10} />
        </CenteredCard>
    );
};

export default InvitationClient;

