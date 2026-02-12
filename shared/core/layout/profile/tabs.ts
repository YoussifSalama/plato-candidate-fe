import {
    BriefcaseBusiness,
    FolderKanban,
    Image,
    Link2,
    User,
} from "lucide-react";
import type { ITab } from "@/shared/common/layout/LayoutTabsRouter";

export const profileTabs: ITab[] = [
    {
        label: "Basic Info",
        href: "/settings/profile",
        icon: User,
    },
    {
        label: "Experience",
        href: "/settings/profile/experience",
        icon: BriefcaseBusiness,
    },
    {
        label: "Projects",
        href: "/settings/profile/projects",
        icon: FolderKanban,
    },
    {
        label: "Social Links",
        href: "/settings/profile/social-links",
        icon: Link2,
    },
    {
        label: "Avatar",
        href: "/settings/profile/avatar",
        icon: Image,
    },
];

