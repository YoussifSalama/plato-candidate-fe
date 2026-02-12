"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import PrimaryActionButton from "@/shared/common/components/PrimaryActionButton";
import { useAuthStore } from "@/shared/store/pages";

const passwordSchema = z
    .object({
        oldPassword: z.string().min(1, "Current password is required."),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters.")
            .max(32, "Password must be at most 32 characters.")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/, {
                message:
                    "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.",
            }),
        confirmPassword: z.string().min(1, "Please confirm your new password."),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

type ChangePasswordFormValues = z.infer<typeof passwordSchema>;

const CandidateChangePasswordSettingsPage = () => {
    const { changePassword, loadingChangePassword } = useAuthStore();
    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isValid },
        reset,
    } = useForm<ChangePasswordFormValues>({
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        mode: "onChange",
        resolver: zodResolver(passwordSchema),
    });

    const onSubmit = async (values: ChangePasswordFormValues) => {
        const result = await changePassword({
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
        });
        if (result.ok) {
            toast.success(result.message);
            reset();
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="rounded-md border border-blue-200 bg-white p-6 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Change password
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Update your password to keep your account secure.
                    </p>
                </div>
                <PrimaryActionButton
                    type="submit"
                    form="change-password-form"
                    disabled={!isDirty || !isValid || loadingChangePassword}
                    className="hidden lg:inline-flex"
                >
                    {loadingChangePassword ? "Saving..." : "Save"}
                </PrimaryActionButton>
            </div>

            <form
                id="change-password-form"
                className="mt-6 grid gap-4 md:grid-cols-2"
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                        Current password <span className="text-red-500">*</span>
                    </label>
                    <Input type="password" placeholder="Enter current password" {...register("oldPassword")} />
                    {errors.oldPassword && (
                        <p className="text-xs text-red-500">{errors.oldPassword.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                        New password <span className="text-red-500">*</span>
                    </label>
                    <Input type="password" placeholder="Enter new password" {...register("newPassword")} />
                    {errors.newPassword && (
                        <p className="text-xs text-red-500">{errors.newPassword.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                        Confirm new password <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="password"
                        placeholder="Confirm new password"
                        {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                        <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                    )}
                </div>
                <div className="flex justify-end md:col-span-2 lg:hidden">
                    <PrimaryActionButton
                        type="submit"
                        form="change-password-form"
                        disabled={!isDirty || !isValid || loadingChangePassword}
                    >
                        {loadingChangePassword ? "Saving..." : "Save"}
                    </PrimaryActionButton>
                </div>
            </form>
        </div>
    );
};

export default CandidateChangePasswordSettingsPage;

