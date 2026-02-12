"use client";

import clsx from "clsx";
import LayoutTabsRouter from "@/shared/common/layout/LayoutTabsRouter";
import { profileTabs } from "@/shared/core/layout/profile/tabs";

const ProfileSettingsLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className={clsx("space-y-6")}>
            <LayoutTabsRouter tabs={profileTabs} />
            {children}
        </div>
    );
};

export default ProfileSettingsLayout;

