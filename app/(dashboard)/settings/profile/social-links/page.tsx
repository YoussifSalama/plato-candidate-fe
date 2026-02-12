"use client";

import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PrimaryActionButton from "@/shared/common/components/PrimaryActionButton";
import SelectInput from "@/shared/common/components/SelectInput";
import { useProfileSectionsStore } from "@/shared/store/pages";

const socialPlatformOptions = [
    { label: "LinkedIn", value: "linkedin" },
    { label: "GitHub", value: "github" },
    { label: "Portfolio", value: "portfolio" },
    { label: "Behance", value: "behance" },
    { label: "Dribbble", value: "dribbble" },
    { label: "Stack Overflow", value: "stackoverflow" },
    { label: "Medium", value: "medium" },
    { label: "X (Twitter)", value: "twitter" },
    { label: "YouTube", value: "youtube" },
    { label: "Dev.to", value: "devto" },
];

const socialLinkItemSchema = z.object({
    key: z.string().trim().min(1, "Platform is required."),
    value: z.string().trim().url("Enter a valid URL."),
});

const profileSocialLinksSchema = z.object({
    social_links: z.array(socialLinkItemSchema).min(1, "Add at least one link."),
});

type ProfileSocialLinksFormValues = z.infer<typeof profileSocialLinksSchema>;

const CandidateProfileSocialLinksSettingsPage = () => {
    const { getSocialLinks, replaceSocialLinks, savingSocialLinks, loadingSocialLinks } =
        useProfileSectionsStore();
    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isValid },
        control,
        watch,
        reset,
    } = useForm<ProfileSocialLinksFormValues>({
        defaultValues: {
            social_links: [
                {
                    key: "",
                    value: "",
                },
            ],
        },
        mode: "onChange",
        resolver: zodResolver(profileSocialLinksSchema),
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "social_links",
    });

    const firstLink = watch("social_links.0");
    const isFirstLinkValid = socialLinkItemSchema.safeParse(firstLink).success;

    useEffect(() => {
        const load = async () => {
            const links = await getSocialLinks();
            if (!links.length) {
                reset({
                    social_links: [
                        {
                            key: "",
                            value: "",
                        },
                    ],
                });
                return;
            }
            reset({
                social_links: links.map((item) => ({
                    key: item.key ?? "",
                    value: item.value ?? "",
                })),
            });
        };
        void load();
    }, [getSocialLinks, reset]);

    const onSubmit = async (values: ProfileSocialLinksFormValues) => {
        const payload = values.social_links.map((item) => ({
            key: item.key.trim(),
            value: item.value.trim(),
        }));
        const ok = await replaceSocialLinks(payload);
        if (ok) {
            reset(values);
        }
    };

    return (
        <div className="rounded-md border border-blue-200 bg-white p-6 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Social links
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Add the links that help employers verify your work.
                    </p>
                </div>
                <div className="hidden items-center gap-2 lg:flex">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            append({
                                key: "",
                                value: "",
                            })
                        }
                        disabled={!isFirstLinkValid}
                    >
                        Add link
                    </Button>
                    <PrimaryActionButton
                        type="submit"
                        form="profile-social-links-form"
                        disabled={!isDirty || !isValid || savingSocialLinks}
                    >
                        {savingSocialLinks ? "Saving..." : "Save"}
                    </PrimaryActionButton>
                </div>
            </div>

            {loadingSocialLinks ? (
                <div className="mt-6 space-y-4">
                    <div className="h-6 w-32 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="h-10 w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                        <div className="h-10 w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                    </div>
                </div>
            ) : (
                <form
                    id="profile-social-links-form"
                    className="mt-6 space-y-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                {errors.social_links?.message && (
                    <p className="text-sm text-red-500">{errors.social_links.message}</p>
                )}
                {fields.map((field, index) => (
                    <div
                        key={field.id}
                        className="rounded-md border border-blue-100 bg-blue-50/30 p-4 dark:border-slate-800 dark:bg-slate-900/40"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                Link {index + 1}
                            </p>
                            {fields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => remove(index)}
                                    className="text-red-500 hover:text-red-600"
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                    Platform <span className="text-red-500">*</span>
                                </label>
                                <Controller
                                    control={control}
                                    name={`social_links.${index}.key`}
                                    render={({ field }) => (
                                        <SelectInput
                                            value={field.value}
                                            onChange={field.onChange}
                                            options={socialPlatformOptions}
                                            placeholder="Select or type a platform..."
                                            allowCustom
                                        />
                                    )}
                                />
                                {errors.social_links?.[index]?.key && (
                                    <p className="text-xs text-red-500">
                                        {errors.social_links[index]?.key?.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                    URL <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="https://..."
                                    {...register(`social_links.${index}.value`)}
                                />
                                {errors.social_links?.[index]?.value && (
                                    <p className="text-xs text-red-500">
                                        {errors.social_links[index]?.value?.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div className="flex items-center justify-end gap-2 lg:hidden">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            append({
                                key: "",
                                value: "",
                            })
                        }
                        disabled={!isFirstLinkValid}
                    >
                        Add link
                    </Button>
                    <PrimaryActionButton
                        type="submit"
                        form="profile-social-links-form"
                        disabled={!isDirty || !isValid || savingSocialLinks}
                    >
                        {savingSocialLinks ? "Saving..." : "Save"}
                    </PrimaryActionButton>
                </div>
                </form>
            )}
        </div>
    );
};

export default CandidateProfileSocialLinksSettingsPage;

