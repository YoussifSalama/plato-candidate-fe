import {
    ClipboardList,

    LayoutDashboard,
    Settings,
    Briefcase,
} from "lucide-react";

export const sidebarRoutes = [
    {
        label: "Overview",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        label: "Interviews",
        href: "/interviews",
        icon: ClipboardList,
    },
    {
        label: "Job Matching",
        href: "/jobs",
        icon: Briefcase,
    },
    {
        label: "Settings",
        href: "/settings",
        icon: Settings,
    },
];

