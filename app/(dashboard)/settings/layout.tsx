"use client";

import clsx from "clsx";
import LayoutTabsRouter from "@/shared/common/layout/LayoutTabsRouter";
import { settingsTabs } from "@/shared/core/layout/settings/tabs";

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className={clsx("space-y-6")}>
            <LayoutTabsRouter tabs={settingsTabs} matchSubRoutes />
            {children}
        </div>
    );
};

export default SettingsLayout;

