"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PrimaryActionButton from "@/shared/common/components/PrimaryActionButton";
import { useProfileSectionsStore } from "@/shared/store/pages";
import { ParsedCVProfile } from "@/shared/store/pages/profile/useProfileStore";
import { FileText, Download, Trash2 } from "lucide-react";
import AutofillDialog from "./AutofillDialog";
import RemoveCVDialog from "./RemoveCVDialog";

const FILES_BASE_URL = process.env.NEXT_PUBLIC_FILES_RESUME || "";

const resolveFileUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("data:") || /^https?:\/\//.test(path)) return path;
    if (!FILES_BASE_URL) return path;
    // Strip both /uploads/ and /resumes/ prefixes to avoid duplication
    let normalizedPath = path;
    if (normalizedPath.startsWith("/uploads/")) {
        normalizedPath = normalizedPath.replace(/^\/uploads/, "");
    }
    if (normalizedPath.startsWith("/resumes/")) {
        normalizedPath = normalizedPath.replace(/^\/resumes/, "");
    }
    const separator = normalizedPath.startsWith("/") ? "" : "/";
    return `${FILES_BASE_URL}${separator}${normalizedPath}`;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const profileCVSchema = z.object({
    cv: z
        .any()
        .refine((files) => files?.length === 1, "CV is required.")
        .refine(
            (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
            "Only .pdf, .doc, and .docx formats are supported."
        )
        .refine(
            (files) => files?.[0]?.size <= MAX_FILE_SIZE,
            "Max file size is 5MB."
        ),
});

type ProfileCVFormValues = z.infer<typeof profileCVSchema>;

const CandidateProfileCVSettingsPage = () => {
    const {
        getCV,
        uploadCV,
        deleteCV,
        savingCV,
        cv,
        loadingCV,
        updateBasic,
        replaceExperiences,
        replaceProjects,
    } = useProfileSectionsStore();
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const [isAutofillOpen, setIsAutofillOpen] = useState(false);
    const [isRemoveOpen, setIsRemoveOpen] = useState(false);
    const [parsedData, setParsedData] = useState<ParsedCVProfile | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isValid },
        reset,
    } = useForm<ProfileCVFormValues>({
        mode: "onChange",
        resolver: zodResolver(profileCVSchema),
    });

    const cvFiles = watch("cv");

    useEffect(() => {
        const load = async () => {
            await getCV();
        };
        void load();
    }, [getCV]);

    useEffect(() => {
        if (cvFiles?.length) {
            setSelectedFileName(cvFiles[0].name);
        } else {
            setSelectedFileName(null);
        }
    }, [cvFiles]);

    const onSubmit = async (values: ProfileCVFormValues) => {
        const file = values.cv?.[0];
        if (!file) return;
        const data = await uploadCV(file);
        if (data) {
            setParsedData(data);
            setIsAutofillOpen(true);
            reset();
            setSelectedFileName(null);
            // Don't call getCV() here - uploadCV already sets the CV state
        } else if (data === null) {
            // Upload failure handled in store, but if null returned without error (unlikely), reset
            // If data is null it means error or no parsed data.
            // If it was just an upload without parsing (legacy), we would have handled it differently?
            // But now uploadCV returns ParsedCVProfile | null. 
            // If it returns null, error toast was shown.
            // If it returns object, it's success.
            reset();
            setSelectedFileName(null);
        }
    };

    const handleAutofill = async () => {
        if (!parsedData) return;

        // 1. Update Basic Info
        const basicPayload = {
            headline: parsedData.headline || undefined,
            summary: parsedData.summary || undefined,
            location: parsedData.location
                ? `${parsedData.location.city || ""}, ${parsedData.location.country || ""}`
                : undefined,
        };
        // Clean up location string if empty parts
        if (basicPayload.location === ", ") basicPayload.location = undefined;
        else if (basicPayload.location?.startsWith(", "))
            basicPayload.location = basicPayload.location.substring(2);
        else if (basicPayload.location?.endsWith(", "))
            basicPayload.location = basicPayload.location.slice(0, -2);

        await updateBasic(basicPayload);

        // 2. Update Experiences
        if (parsedData.experience?.length) {
            const experiences = parsedData.experience.map((exp) => ({
                company_name: exp.company,
                role: exp.role || "Not specified",
                field: exp.field || "Other",
                type: exp.type || "full_time",
                from: exp.startDate ? new Date(exp.startDate).toISOString() : undefined,
                to: exp.isCurrent ? undefined : (exp.endDate ? new Date(exp.endDate).toISOString() : undefined),
                current: exp.isCurrent,
                description: exp.description,
            }));
            await replaceExperiences(experiences);
        }

        // 3. Update Projects
        if (parsedData.projects?.length) {
            const projects = parsedData.projects.map((proj) => ({
                name: proj.name,
                role: proj.role,
                description:
                    proj.description +
                    (proj.technologies?.length
                        ? `\n\nTechnologies: ${proj.technologies.join(", ")}`
                        : ""),
            }));
            await replaceProjects(projects);
        }

        setIsAutofillOpen(false);
        // Don't call getCV() here - CV state is already set from upload
    };

    const handleRemoveCV = async (autoClear: boolean) => {
        const success = await deleteCV(autoClear);
        if (success) {
            setIsRemoveOpen(false);
        }
    };

    return (
        <div className="rounded-md border border-blue-200 bg-white p-6 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
            <AutofillDialog
                open={isAutofillOpen}
                onOpenChange={setIsAutofillOpen}
                onConfirm={handleAutofill}
                parsedData={parsedData}
            />
            <RemoveCVDialog
                open={isRemoveOpen}
                onOpenChange={setIsRemoveOpen}
                onConfirm={handleRemoveCV}
                isRemoving={savingCV}
            />
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                        CV / Resume
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Upload your CV/Resume to let employers know more about your experience.
                    </p>
                </div>
                <PrimaryActionButton
                    type="submit"
                    form="profile-cv-form"
                    disabled={!isValid || savingCV || !selectedFileName}
                    className="hidden lg:inline-flex"
                >
                    {savingCV ? "Uploading..." : "Upload"}
                </PrimaryActionButton>
            </div>

            {loadingCV ? (
                <div className="mt-6 space-y-4">
                    <div className="h-10 w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                    <div className="h-24 w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                </div>
            ) : (
                <div className="mt-6 space-y-6">
                    {cv?.url && (
                        <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                            {cv.name || "Current CV"}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Uploaded
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={resolveFileUrl(cv.url) ?? ""}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        <Download size={16} />
                                        Download
                                    </a>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsRemoveOpen(true)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 size={16} />
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <form
                        id="profile-cv-form"
                        className="space-y-4"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                Upload New CV
                            </label>
                            <Input
                                type="file"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                {...register("cv")}
                            />
                            {errors.cv && (
                                <p className="text-sm text-red-500">{errors.cv.message as string}</p>
                            )}
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Supported formats: PDF, DOC, DOCX. Max size: 5MB.
                            </p>
                        </div>

                        <div className="flex justify-end lg:hidden">
                            <PrimaryActionButton
                                type="submit"
                                form="profile-cv-form"
                                disabled={!isValid || savingCV || !selectedFileName}
                            >
                                {savingCV ? "Uploading..." : "Upload"}
                            </PrimaryActionButton>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CandidateProfileCVSettingsPage;
