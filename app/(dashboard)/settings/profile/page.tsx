"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PrimaryActionButton from "@/shared/common/components/PrimaryActionButton";
import { useProfileSectionsStore } from "@/shared/store/pages";

const profileBasicSchema = z.object({
    headline: z.string().trim().optional(),
    location: z.string().trim().optional(),
    summary: z.string().trim().optional(),
});

type ProfileBasicFormValues = z.infer<typeof profileBasicSchema>;

const CandidateProfileSettingsPage = () => {
    const { getBasicProfile, updateBasic, savingBasic, loadingBasic } = useProfileSectionsStore();
    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isValid },
        reset,
    } = useForm<ProfileBasicFormValues>({
        defaultValues: {
            headline: "",
            location: "",
            summary: "",
        },
        mode: "onChange",
        resolver: zodResolver(profileBasicSchema),
    });

    useEffect(() => {
        const load = async () => {
            const data = await getBasicProfile();
            reset({
                headline: data?.headline ?? "",
                location: data?.location ?? "",
                summary: data?.summary ?? "",
            });
        };
        void load();
    }, [getBasicProfile, reset]);

    const onSubmit = async (values: ProfileBasicFormValues) => {
        const ok = await updateBasic({
            headline: values.headline?.trim() || undefined,
            location: values.location?.trim() || undefined,
            summary: values.summary?.trim() || undefined,
        });
        if (ok) {
            reset({
                headline: values.headline ?? "",
                location: values.location ?? "",
                summary: values.summary ?? "",
            });
        }
    };

    return (
        <div className="rounded-md border border-blue-200 bg-white p-6 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Basic information
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Share a short headline and summary so employers can learn about you.
                    </p>
                </div>
                <PrimaryActionButton
                    type="submit"
                    form="profile-basic-form"
                    disabled={!isDirty || !isValid || savingBasic}
                    className="hidden lg:inline-flex"
                >
                    {savingBasic ? "Saving..." : "Save"}
                </PrimaryActionButton>
            </div>

            {loadingBasic ? (
                <div className="mt-6 space-y-4">
                    <div className="h-10 w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="h-10 w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                        <div className="h-10 w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                    </div>
                    <div className="h-24 w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                </div>
            ) : (
                <form
                    id="profile-basic-form"
                    className="mt-6 grid gap-4 md:grid-cols-2"
                    onSubmit={handleSubmit(onSubmit)}
                >
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                        Headline
                    </label>
                    <Input placeholder="e.g. Senior Backend Engineer" {...register("headline")} />
                    {errors.headline && (
                        <p className="text-xs text-red-500">{errors.headline.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                        Location
                    </label>
                    <Input placeholder="City, Country" {...register("location")} />
                    {errors.location && (
                        <p className="text-xs text-red-500">{errors.location.message}</p>
                    )}
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                        Summary
                    </label>
                    <Textarea placeholder="Add a short professional summary..." {...register("summary")} />
                    {errors.summary && (
                        <p className="text-xs text-red-500">{errors.summary.message}</p>
                    )}
                </div>
                <div className="flex justify-end md:col-span-2 lg:hidden">
                    <PrimaryActionButton
                        type="submit"
                        form="profile-basic-form"
                        disabled={!isDirty || !isValid || savingBasic}
                    >
                        {savingBasic ? "Saving..." : "Save"}
                    </PrimaryActionButton>
                </div>
                </form>
            )}
        </div>
    );
};

export default CandidateProfileSettingsPage;

