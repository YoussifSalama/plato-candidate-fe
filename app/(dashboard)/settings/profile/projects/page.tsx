"use client";

import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import PrimaryActionButton from "@/shared/common/components/PrimaryActionButton";
import SelectInput from "@/shared/common/components/SelectInput";
import { useProfileSectionsStore } from "@/shared/store/pages";

const projectItemSchema = z.object({
    name: z.string().trim().min(1, "Project name is required."),
    role: z.string().trim().min(1, "Role is required."),
    description: z.string().trim().optional(),
});

const projectRoleOptions = [
    { label: "Full-stack Developer", value: "full_stack_developer" },
    { label: "Frontend Developer", value: "frontend_developer" },
    { label: "Backend Developer", value: "backend_developer" },
    { label: "Mobile Developer", value: "mobile_developer" },
    { label: "UI/UX Designer", value: "ui_ux_designer" },
    { label: "Product Designer", value: "product_designer" },
    { label: "Product Manager", value: "product_manager" },
    { label: "Data Scientist", value: "data_scientist" },
    { label: "Data Analyst", value: "data_analyst" },
    { label: "DevOps Engineer", value: "devops_engineer" },
];

const profileProjectsSchema = z.object({
    projects: z.array(projectItemSchema).min(1, "Add at least one project."),
});

type ProfileProjectsFormValues = z.infer<typeof profileProjectsSchema>;

const CandidateProfileProjectsSettingsPage = () => {
    const { getProjects, replaceProjects, savingProjects, loadingProjects } = useProfileSectionsStore();
    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isValid },
        control,
        watch,
        reset,
    } = useForm<ProfileProjectsFormValues>({
        defaultValues: {
            projects: [
                {
                    name: "",
                    role: "",
                    description: "",
                },
            ],
        },
        mode: "onChange",
        resolver: zodResolver(profileProjectsSchema),
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "projects",
    });

    const firstProject = watch("projects.0");
    const isFirstProjectValid = projectItemSchema.safeParse(firstProject).success;

    useEffect(() => {
        const load = async () => {
            const projects = await getProjects();
            if (!projects.length) {
                reset({
                    projects: [
                        {
                            name: "",
                            role: "",
                            description: "",
                        },
                    ],
                });
                return;
            }
            reset({
                projects: projects.map((item) => ({
                    name: item.name ?? "",
                    role: item.role ?? "",
                    description: item.description ?? "",
                })),
            });
        };
        void load();
    }, [getProjects, reset]);

    const onSubmit = async (values: ProfileProjectsFormValues) => {
        const payload = values.projects.map((item) => ({
            name: item.name.trim(),
            role: item.role.trim(),
            description: item.description?.trim() || undefined,
        }));
        const ok = await replaceProjects(payload);
        if (ok) {
            reset(values);
        }
    };

    return (
        <div className="rounded-md border border-blue-200 bg-white p-6 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Projects
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Highlight projects that showcase your skills and impact.
                    </p>
                </div>
                <div className="hidden items-center gap-2 lg:flex">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            append({
                                name: "",
                                role: "",
                                description: "",
                            })
                        }
                        disabled={!isFirstProjectValid}
                    >
                        Add project
                    </Button>
                    <PrimaryActionButton
                        type="submit"
                        form="profile-projects-form"
                        disabled={!isDirty || !isValid || savingProjects}
                    >
                        {savingProjects ? "Saving..." : "Save"}
                    </PrimaryActionButton>
                </div>
            </div>

            {loadingProjects ? (
                <div className="mt-6 space-y-4">
                    <div className="h-6 w-32 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="h-10 w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                        <div className="h-10 w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                    </div>
                    <div className="h-24 w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                </div>
            ) : (
                <form
                    id="profile-projects-form"
                    className="mt-6 space-y-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                {errors.projects?.message && (
                    <p className="text-sm text-red-500">{errors.projects.message}</p>
                )}
                {fields.map((field, index) => (
                    <div
                        key={field.id}
                        className="rounded-md border border-blue-100 bg-blue-50/30 p-4 dark:border-slate-800 dark:bg-slate-900/40"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                Project {index + 1}
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
                                    Project name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="Project name"
                                    {...register(`projects.${index}.name`)}
                                />
                                {errors.projects?.[index]?.name && (
                                    <p className="text-xs text-red-500">
                                        {errors.projects[index]?.name?.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <Controller
                                    control={control}
                                    name={`projects.${index}.role`}
                                    render={({ field }) => (
                                        <SelectInput
                                            value={field.value}
                                            onChange={field.onChange}
                                            options={projectRoleOptions}
                                            placeholder="Select or type a role..."
                                            allowCustom
                                        />
                                    )}
                                />
                                {errors.projects?.[index]?.role && (
                                    <p className="text-xs text-red-500">
                                        {errors.projects[index]?.role?.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                    Description
                                </label>
                                <Textarea
                                    placeholder="What did you build? What tools did you use?"
                                    {...register(`projects.${index}.description`)}
                                />
                                {errors.projects?.[index]?.description && (
                                    <p className="text-xs text-red-500">
                                        {errors.projects[index]?.description?.message}
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
                                name: "",
                                role: "",
                                description: "",
                            })
                        }
                        disabled={!isFirstProjectValid}
                    >
                        Add project
                    </Button>
                    <PrimaryActionButton
                        type="submit"
                        form="profile-projects-form"
                        disabled={!isDirty || !isValid || savingProjects}
                    >
                        {savingProjects ? "Saving..." : "Save"}
                    </PrimaryActionButton>
                </div>
                </form>
            )}
        </div>
    );
};

export default CandidateProfileProjectsSettingsPage;

