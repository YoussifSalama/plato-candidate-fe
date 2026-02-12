const CandidateDashboardPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Candidate Dashboard
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Track your interviews and keep your profile ready.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                    { label: "Upcoming interviews", value: "0 scheduled" },
                    { label: "Completed interviews", value: "0 completed" },
                    { label: "Profile completion", value: "0%" },
                ].map((card) => (
                    <div
                        key={card.label}
                        className="rounded-md border border-blue-200 bg-white p-4 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none"
                    >
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-300">
                            {card.label}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                            {card.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="rounded-md border border-blue-200 bg-white p-4 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Recent activity
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    No activity yet. Your completed interviews will appear here.
                </p>
            </div>
        </div>
    );
};

export default CandidateDashboardPage;

