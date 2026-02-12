"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import PrimaryActionButton from "@/shared/common/components/PrimaryActionButton";
import { useProfileSectionsStore } from "@/shared/store/pages";

const MIN_AVATAR_SIZE = 200;
const MAX_AVATAR_SIZE = 2000;
const FILES_BASE_URL = (process.env.NEXT_PUBLIC_FILES ?? "").replace(/\/$/, "");

const resolveFileUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("data:") || /^https?:\/\//.test(path)) return path;
    if (!FILES_BASE_URL) return path;
    const normalizedPath = path.startsWith("/uploads/")
        ? path.replace(/^\/uploads/, "")
        : path;
    const separator = normalizedPath.startsWith("/") ? "" : "/";
    return `${FILES_BASE_URL}${separator}${normalizedPath}`;
};

const loadImageDimensions = (file: File) =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            const { width, height } = image;
            URL.revokeObjectURL(url);
            resolve({ width, height });
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Unable to read image dimensions."));
        };
        image.src = url;
    });

const profileAvatarSchema = z.object({
    avatar: z
        .any()
        .refine((files) => files?.length === 1, "Avatar is required.")
        .refine(
            (files) => files?.[0]?.type?.startsWith("image/") ?? false,
            "Avatar must be an image file."
        )
        .refine(async (files) => {
            const file = files?.[0] as File | undefined;
            if (!file) return false;
            try {
                const { width, height } = await loadImageDimensions(file);
                const isSquare = width === height;
                const withinBounds =
                    width >= MIN_AVATAR_SIZE &&
                    height >= MIN_AVATAR_SIZE &&
                    width <= MAX_AVATAR_SIZE &&
                    height <= MAX_AVATAR_SIZE;
                return isSquare && withinBounds;
            } catch {
                return false;
            }
        }, `Avatar must be a square image between ${MIN_AVATAR_SIZE}px and ${MAX_AVATAR_SIZE}px.`),
});

type ProfileAvatarFormValues = z.infer<typeof profileAvatarSchema>;

const CandidateProfileAvatarSettingsPage = () => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
    const { getAvatar, uploadAvatar, savingAvatar, avatar, loadingAvatar } =
        useProfileSectionsStore();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isDirty, isValid },
        reset,
    } = useForm<ProfileAvatarFormValues>({
        defaultValues: {
            avatar: undefined,
        },
        mode: "onChange",
        resolver: zodResolver(profileAvatarSchema),
    });

    const avatarFiles = watch("avatar");

    useEffect(() => {
        const load = async () => {
            const value = await getAvatar();
            setCurrentAvatar(value ?? null);
        };
        void load();
    }, [getAvatar]);

    useEffect(() => {
        if (avatar) {
            setCurrentAvatar(avatar);
        }
    }, [avatar]);

    useEffect(() => {
        if (!avatarFiles?.length) {
            setPreviewUrl(null);
            return;
        }
        const file = avatarFiles[0];
        const nextUrl = URL.createObjectURL(file);
        setPreviewUrl(nextUrl);
        return () => {
            URL.revokeObjectURL(nextUrl);
        };
    }, [avatarFiles]);

    const onSubmit = async (values: ProfileAvatarFormValues) => {
        const file = values.avatar?.[0] as File | undefined;
        if (!file) return;
        const ok = await uploadAvatar(file);
        if (ok) {
            reset({ avatar: undefined });
        }
    };

    return (
        <div className="rounded-md border border-blue-200 bg-white p-6 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Profile photo
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Upload a clear headshot to personalize your profile.
                    </p>
                </div>
                <PrimaryActionButton
                    type="submit"
                    form="profile-avatar-form"
                    disabled={!isDirty || !isValid || savingAvatar}
                    className="hidden lg:inline-flex"
                >
                    {savingAvatar ? "Saving..." : "Save"}
                </PrimaryActionButton>
            </div>

            {loadingAvatar ? (
                <div className="mt-6 space-y-4">
                    <div className="h-10 w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                    <div className="h-20 w-20 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800" />
                </div>
            ) : (
                <form
                    id="profile-avatar-form"
                    className="mt-6 space-y-4"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                            Upload avatar <span className="text-red-500">*</span>
                        </label>
                        <Input type="file" accept="image/*" {...register("avatar")} />
                        {errors.avatar && (
                            <p className="text-xs text-red-500">{errors.avatar.message}</p>
                        )}
                    </div>
                    {previewUrl ? (
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 overflow-hidden rounded-full border border-blue-100 bg-blue-50/30 dark:border-slate-800 dark:bg-slate-900/40">
                                <img
                                    src={previewUrl}
                                    alt="Selected avatar preview"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    Preview
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Make sure your face is centered and well lit.
                                </p>
                            </div>
                        </div>
                    ) : currentAvatar ? (
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 overflow-hidden rounded-full border border-blue-100 bg-blue-50/30 dark:border-slate-800 dark:bg-slate-900/40">
                                <img
                                    src={resolveFileUrl(currentAvatar) ?? ""}
                                    alt="Current avatar"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    Current avatar
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Upload a new image to replace it.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Use a square image between {MIN_AVATAR_SIZE}px and {MAX_AVATAR_SIZE}px.
                        </p>
                    )}
                    <div className="flex justify-end lg:hidden">
                        <PrimaryActionButton
                            type="submit"
                            form="profile-avatar-form"
                            disabled={!isDirty || !isValid || savingAvatar}
                        >
                            {savingAvatar ? "Saving..." : "Save"}
                        </PrimaryActionButton>
                    </div>
                </form>
            )}
        </div>
    );
};

export default CandidateProfileAvatarSettingsPage;

