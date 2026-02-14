import { Building2, MapPin, Banknote } from "lucide-react";
import clsx from "clsx";

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
        company_radius?: string; // Assuming this might be available or not
    };
    created_at: string;
}

interface JobCardProps {
    job: Job;
}

export const JobCard = ({ job }: JobCardProps) => {
    return (
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-500 text-lg font-bold dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
                        {job.agency?.company_name?.[0]?.toUpperCase() || <Building2 className="h-6 w-6" />}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {job.title}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {job.agency?.company_name || "Unknown Company"} • {job.industry}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div
                        className={clsx(
                            "flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold",
                            job.match_score >= 80
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : job.match_score >= 50
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}
                    >
                        {job.match_score}% Match
                    </div>
                    <span className="text-xs text-slate-400">
                        Posted {new Date(job.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="capitalize">{job.location}</span> ({job.workplace_type.replace("_", " ")})
                </div>
                <div className="flex items-center gap-1.5">
                    <BriefcaseIcon className="h-4 w-4 text-slate-400" />
                    <span className="capitalize">{job.employment_type.replace("_", " ")}</span> • <span className="capitalize">{job.seniority_level.replace("_", " ")}</span>
                </div>
                {(job.salary_from || job.salary_to) && (
                    <div className="flex items-center gap-1.5">
                        <Banknote className="h-4 w-4 text-slate-400" />
                        <span>
                            {job.salary_currency?.toUpperCase()} {Number(job.salary_from).toLocaleString()} - {Number(job.salary_to).toLocaleString()}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {job.matched_skills.slice(0, 3).map((skill) => (
                    <span
                        key={skill}
                        className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    >
                        {skill}
                    </span>
                ))}
                {job.matched_skills.length > 3 && (
                    <span className="rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        +{job.matched_skills.length - 3} more
                    </span>
                )}
            </div>
        </div>
    );
};

function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    )
}
