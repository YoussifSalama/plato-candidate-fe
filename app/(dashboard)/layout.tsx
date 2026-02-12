"use client";

import { useState } from "react";
import clsx from "clsx";
import Sidebar from "@/shared/components/layout/sidebar/Sidebar";
import Navbar from "@/shared/components/layout/navbar/Navbar";
import ToastProvider from "@/shared/components/common/ToastProvider";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div
            className={clsx(
                "flex min-h-dvh bg-background text-foreground light-neutral-scope",
                "dark:bg-linear-to-br dark:from-slate-950 dark:to-slate-900"
            )}
        >
            <Sidebar isOpen={sidebarOpen} isCollapsed={sidebarCollapsed} />
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                />
            )}
            <main
                className={clsx(
                    "flex-1 min-w-0 overflow-x-hidden px-6 py-6 transition-[margin] duration-300",
                    sidebarCollapsed ? "lg:ml-0" : "lg:ml-72"
                )}
            >
                <Navbar
                    onMenuClick={() => setSidebarOpen(true)}
                    onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
                    isSidebarCollapsed={sidebarCollapsed}
                />
                <div className="mt-6">{children}</div>
            </main>
            <ToastProvider />
        </div>
    );
};

export default DashboardLayout;

