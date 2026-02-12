"use client";

import { useEffect } from "react";
import { useProfileStore } from "@/shared/store/pages";

const CandidateProfilePage = () => {
    const profile = useProfileStore((state) => state.profile);
    const loadingProfile = useProfileStore((state) => state.loadingProfile);
    const getProfile = useProfileStore((state) => state.getProfile);

    useEffect(() => {
        void getProfile();
    }, [getProfile]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    My Profile
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Keep your profile updated for faster interview setup.
                </p>
            </div>

            <div className="rounded-md border border-blue-200 bg-white p-4 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Profile overview
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {loadingProfile
                        ? "Loading profile..."
                        : profile
                            ? "Profile loaded. Forms will go here."
                            : "No profile data yet."}
                </p>
                {profile && (
                    <pre className="mt-4 rounded-md bg-blue-50 p-3 text-xs text-blue-800 dark:bg-slate-800 dark:text-slate-200">
                        {JSON.stringify(profile, null, 2)}
                    </pre>
                )}
            </div>
        </div>
    );
};

export default CandidateProfilePage;

