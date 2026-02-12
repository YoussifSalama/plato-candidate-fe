"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import {
    CalendarCheck,
    CalendarClock,
    Building2,
    Briefcase,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Input } from "@/components/ui/input";
import { observeIntersection } from "@/shared/common/helpers/observer";

type InterviewItem = {
    id: number;
    token: string;
    revoked: boolean;
    status: string;
    expires_at: string;
    created_at: string;
    agency: {
        company_name?: string | null;
        organization_url?: string | null;
        company_size?: string | null;
        company_industry?: string | null;
    } | null;
    job: {
        title: string;
        description: string;
        status: "active" | "inactive";
    } | null;
};

const stripHtml = (value?: string | null) => {
    if (!value) return "";
    return value.replace(/<[^>]*>/g, "").trim();
};

const normalizeUrl = (value?: string | null) => {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
    }
    return `https://${trimmed}`;
};

const CandidateInterviewsPage = () => {
    const [status, setStatus] = useState<"active" | "expired">("active");
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [items, setItems] = useState<InterviewItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const emptyMessage = useMemo(
        () =>
            status === "active"
                ? "Your upcoming interviews will appear here once scheduled."
                : "Expired interviews will appear here once available.",
        [status]
    );

    useEffect(() => {
        const handle = window.setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);
        return () => window.clearTimeout(handle);
    }, [query]);

    const filteredItems = useMemo(() => {
        const normalized = debouncedQuery.trim().toLowerCase();
        if (!normalized) return items;
        return items.filter((item) => {
            const jobTitle = item.job?.title?.toLowerCase() ?? "";
            const jobDescription = stripHtml(item.job?.description).toLowerCase();
            const agencyName = item.agency?.company_name?.toLowerCase() ?? "";
            return (
                jobTitle.includes(normalized) ||
                jobDescription.includes(normalized) ||
                agencyName.includes(normalized)
            );
        });
    }, [items, debouncedQuery]);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get("/interview", {
                    params: {
                        status,
                        page: 1,
                        limit: 10,
                        sortBy: "expires_at",
                        sortOrder: "asc",
                        search: debouncedQuery.trim() || undefined,
                    },
                });
                const data = response.data?.data ?? response.data ?? [];
                const meta = response.data?.meta;
                if (isMounted) {
                    setItems(Array.isArray(data) ? data : []);
                    setPage(1);
                    setTotalPages(Number(meta?.totalPages ?? 1));
                }
            } catch {
                if (isMounted) {
                    setItems([]);
                    setPage(1);
                    setTotalPages(1);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        void load();
        return () => {
            isMounted = false;
        };
    }, [status, debouncedQuery]);

    useEffect(() => {
        const target = sentinelRef.current;
        if (!target) return;
        if (loading || loadingMore) return;
        if (page >= totalPages) return;

        return observeIntersection(
            target,
            () => {
                setLoadingMore(true);
                apiClient
                    .get("/interview", {
                        params: {
                            status,
                            page: page + 1,
                            limit: 10,
                            sortBy: "expires_at",
                            sortOrder: "asc",
                            search: debouncedQuery.trim() || undefined,
                        },
                    })
                    .then((response) => {
                        const data = response.data?.data ?? response.data ?? [];
                        const meta = response.data?.meta;
                        const nextItems = Array.isArray(data) ? data : [];
                        setItems((prev) => [...prev, ...nextItems]);
                        setPage((prev) => prev + 1);
                        setTotalPages(Number(meta?.totalPages ?? totalPages));
                    })
                    .catch(() => undefined)
                    .finally(() => setLoadingMore(false));
            },
            { rootMargin: "200px", once: true }
        );
    }, [debouncedQuery, loading, loadingMore, page, status, totalPages]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Interviews
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Manage upcoming and completed interviews.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-md border border-blue-200 bg-white p-3 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                {(["active", "expired"] as const).map((tab) => {
                    const isActive = status === tab;
                    return (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setStatus(tab)}
                            className={clsx(
                                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors",
                                isActive
                                    ? "border border-blue-400/60 bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white"
                                    : "text-blue-700/70 hover:text-blue-700 hover:bg-blue-100/80 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-slate-100"
                            )}
                        >
                            {tab === "active" ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Active
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-4 w-4" />
                                    Expired
                                </>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="rounded-md border border-blue-200 bg-white p-3 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                <label
                    htmlFor="interviews-search"
                    className="mb-2 block text-xs font-semibold text-blue-700 dark:text-slate-200"
                >
                    Search interviews
                </label>
                <Input
                    id="interviews-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by job or agency..."
                    className="placeholder:text-xs"
                />
            </div>

            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={`interview-skeleton-${index}`}
                            className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none"
                        >
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800" />
                                        <div className="space-y-2">
                                            <div className="h-4 w-40 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                                            <div className="h-3 w-28 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-24 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                                        <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800" />
                                    </div>
                                </div>
                                <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800/60 dark:bg-slate-950/30">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-56 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                                            <div className="h-3 w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                                            <div className="h-3 w-5/6 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                    <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-r from-[#009ad5]/80 to-[#005ca9]/80 text-white">
                            <CalendarCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                No interviews found
                            </p>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {debouncedQuery.trim()
                                    ? "No matches. Try a different keyword."
                                    : emptyMessage}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none"
                        >
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    {(() => {
                                        const agencyUrl = normalizeUrl(item.agency?.organization_url);
                                        const agencyContent = (
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-r from-[#009ad5]/80 to-[#005ca9]/80 text-white">
                                                    <Building2 className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                        {item.agency?.company_name ?? "Agency"}
                                                    </p>
                                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                        {item.agency?.company_industry && (
                                                            <span>{item.agency.company_industry}</span>
                                                        )}
                                                        {item.agency?.company_size && (
                                                            <span>• {item.agency.company_size}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                        if (!agencyUrl) {
                                            return agencyContent;
                                        }
                                        return (
                                            <a
                                                href={agencyUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="group inline-flex items-center gap-2 rounded-xl p-1 transition"
                                            >
                                                {agencyContent}
                                            </a>
                                        );
                                    })()}
                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                        <CalendarClock className="h-4 w-4" />
                                        <span>
                                            Expires{" "}
                                            {new Date(item.expires_at).toLocaleDateString()}
                                        </span>
                                        <span
                                            className={clsx(
                                                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                                status === "active"
                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                                                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                                            )}
                                        >
                                            {status === "active" ? "Active" : "Expired"}
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800/60 dark:bg-slate-950/30">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-r from-[#009ad5]/80 to-[#005ca9]/80 text-white">
                                            <Briefcase className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {item.job?.title ?? "Job title"}
                                                </p>
                                            </div>
                                            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                                                {stripHtml(item.job?.description) || "Job description"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {status === "active" && item.token && (
                                    <div className="flex justify-end">
                                        <Link
                                            href={`/interview/${item.token}`}
                                            className="rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-200/60 hover:from-[#009ad5]/90 hover:to-[#005ca9]/90 dark:shadow-none"
                                        >
                                            Start interview
                                        </Link>
                                    </div>
                                )}

                            </div>
                        </div>
                    ))}
                    {loadingMore && (
                        <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800" />
                                        <div className="space-y-2">
                                            <div className="h-4 w-40 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                                            <div className="h-3 w-28 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-24 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                                        <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800" />
                                    </div>
                                </div>
                                <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800/60 dark:bg-slate-950/30">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-56 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                                            <div className="h-3 w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                                            <div className="h-3 w-5/6 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {page < totalPages && <div ref={sentinelRef} className="h-1" />}
                </div>
            )}
        </div>
    );
};

export default CandidateInterviewsPage;

