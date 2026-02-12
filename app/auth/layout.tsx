import ToastProvider from "@/shared/components/common/ToastProvider";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <ToastProvider />
        </>
    );
}

