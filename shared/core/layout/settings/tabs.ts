import { KeyRound, User } from "lucide-react";
import type { ITab } from "@/shared/common/layout/LayoutTabsRouter";

export const settingsTabs: ITab[] = [
    {
        label: "My Profile",
        href: "/settings/profile",
        icon: User,
    },
    {
        label: "Change Password",
        href: "/settings/change-password",
        icon: KeyRound,
    },
];

