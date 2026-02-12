import {
    ClipboardList,
    LayoutDashboard,
    Settings,
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
        label: "Settings",
        href: "/settings",
        icon: Settings,
    },
];

