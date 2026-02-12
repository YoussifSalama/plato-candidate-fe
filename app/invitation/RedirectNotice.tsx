"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type RedirectNoticeProps = {
    redirectTo: string;
    seconds?: number;
};

const RedirectNotice = ({ redirectTo, seconds = 5 }: RedirectNoticeProps) => {
    const router = useRouter();
    const [remaining, setRemaining] = useState(seconds);

    useEffect(() => {
        if (seconds <= 0) {
            router.replace(redirectTo);
            return;
        }
        const targetTime = Date.now() + seconds * 1000;
        const timer = setInterval(() => {
            const next = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
            setRemaining(next);
            if (next === 0) {
                clearInterval(timer);
                router.replace(redirectTo);
            }
        }, 250);
        return () => clearInterval(timer);
    }, [redirectTo, router, seconds]);

    return (
        <p className="mt-4 text-sm text-muted-foreground">
            Redirecting to the homepage in {remaining}s.
        </p>
    );
};

export default RedirectNotice;

