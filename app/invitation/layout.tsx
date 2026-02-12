import ThemeSwitch from "@/shared/components/layout/theme/ThemeSwitch";
import ToastProvider from "@/shared/components/common/ToastProvider";

const InvitationLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="relative min-h-dvh">
            <div className="absolute right-6 top-6 z-10">
                <ThemeSwitch />
            </div>
            {children}
            <ToastProvider />
        </div>
    );
};

export default InvitationLayout;