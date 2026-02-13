"use client";

import { useEffect, useState, useMemo } from "react";
import { apiClient } from "@/lib/apiClient";
import { JobCard } from "@/shared/components/jobs/JobCard";
import { ArrowRight, ArrowUpDown, Briefcase, FileText, Loader2, RefreshCw } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { useProfileSectionsStore } from "@/shared/store/pages";

interface Job {
    id: number;
    title: string;
    workplace_type: string;
    employment_type: string;
    seniority_level: string;
    industry: string;
    location: string;
    match_score: number;
    salary_from?: string;
    salary_to?: string;
    salary_currency?: string;
    description: string;
    matched_skills: string[];
    missing_skills: string[];
    agency?: {
        company_name: string;
        company_radius?: string;
    };
    created_at: string;
    is_active: boolean;
    // Add other fields as needed
}

type SortOption = "match_score" | "created_at";

const JobMatchingPage = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>("match_score");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // CV Check
    const { getCV, cv, loadingCV } = useProfileSectionsStore();

    useEffect(() => {
        const loadCV = async () => {
            await getCV();
        };
        void loadCV();
    }, [getCV]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            // First, try to get cached matched jobs (instant)
            const matchedResponse = await apiClient.get("/candidate/jobs/matched");
            const matchedData = matchedResponse.data;
            const matchedJobs = Array.isArray(matchedData) ? matchedData : [];

            if (matchedJobs.length > 0) {
                setJobs(matchedJobs);
                return;
            }

            // If empty, fall back to computing matches
            const matchResponse = await apiClient.get("/candidate/jobs/match");
            const matchData = matchResponse.data;
            setJobs(Array.isArray(matchData) ? matchData : []);
        } catch (error) {
            console.error("Failed to fetch jobs:", error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const response = await apiClient.post("/candidate/jobs/match/refresh");
            const data = response.data;
            setJobs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to refresh jobs:", error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (cv) {
            fetchJobs();
        } else {
            setLoading(false);
        }
    }, [cv]);

    const sortedJobs = useMemo(() => {
        return [...jobs].sort((a, b) => {
            let comparison = 0;
            if (sortBy === "match_score") {
                comparison = a.match_score - b.match_score;
            } else if (sortBy === "created_at") {
                comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            }
            return sortOrder === "asc" ? comparison : -comparison;
        });
    }, [jobs, sortBy, sortOrder]);

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    };

    if (loadingCV) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!cv) {
        return (
            <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-900/50 dark:bg-amber-900/20">
                <div className="rounded-full bg-amber-100 p-4 dark:bg-amber-900/40">
                    <FileText className="h-8 w-8 text-amber-600 dark:text-amber-500" />
                </div>
                <div className="max-w-md space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Upload your CV to see matched jobs
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        We need your CV to analyze your skills and experience to find the best job matches for you.
                    </p>
                </div>
                <Link
                    href="/settings/profile/cv"
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                    Upload CV
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Job Matching
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Jobs matched to your profile and preferences.
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Sort by:
                    </span>
                    <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
                        <button
                            onClick={() => setSortBy("match_score")}
                            className={clsx(
                                "rounded px-2.5 py-1.5 text-xs font-medium transition-colors",
                                sortBy === "match_score"
                                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-300"
                            )}
                        >
                            Match Score
                        </button>
                        <button
                            onClick={() => setSortBy("created_at")}
                            className={clsx(
                                "rounded px-2.5 py-1.5 text-xs font-medium transition-colors",
                                sortBy === "created_at"
                                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-300"
                            )}
                        >
                            Date Posted
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                    >
                        <RefreshCw className={clsx("h-3.5 w-3.5", refreshing && "animate-spin")} />
                        {refreshing ? "Refreshing..." : "Refresh Matches"}
                    </button>
                    <button
                        onClick={toggleSortOrder}
                        className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    >
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        {sortOrder === "asc" ? "Ascending" : "Descending"}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : sortedJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800">
                        <Briefcase className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        No jobs found
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        We couldn't find any jobs matching your profile at the moment.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {sortedJobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default JobMatchingPage;
