"use client";

import { useEffect } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import PrimaryActionButton from "@/shared/common/components/PrimaryActionButton";
import SelectInput from "@/shared/common/components/SelectInput";
import { useProfileSectionsStore } from "@/shared/store/pages";

const optionalDate = z
    .preprocess((value) => {
        if (value === "" || value === null || value === undefined) {
            return undefined;
        }
        return value;
    }, z.string().optional())
    .refine((value) => value === undefined || !Number.isNaN(Date.parse(value)), {
        message: "Enter a valid date.",
    });

const experienceTypeEnum = z.enum(
    [
        "remote",
        "hybrid",
        "on_site",
        "full_time",
        "part_time",
        "contract",
        "internship",
        "freelance",
        "temporary",
        "volunteer",
    ],
    {
        message:
            "Type must be one of the following values: remote, hybrid, on_site, full_time, part_time, contract, internship, freelance, temporary, volunteer.",
    }
);

const experienceItemSchema = z
    .object({
        company_name: z.string().trim().min(1, "Company name is required."),
        role: z.string().trim().min(1, "Role is required."),
        field: z.string().trim().min(1, "Field is required."),
        type: experienceTypeEnum,
        from: optionalDate,
        to: optionalDate,
        description: z.string().trim().optional(),
        current: z.boolean(),
    })
    .superRefine((value, ctx) => {
        if (value.from && value.to) {
            const fromDate = new Date(value.from);
            const toDate = new Date(value.to);
            if (!Number.isNaN(fromDate.valueOf()) && !Number.isNaN(toDate.valueOf())) {
                if (toDate <= fromDate) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "To date must be after the from date.",
                        path: ["to"],
                    });
                }
            }
        }
    });

const experienceRoleOptions = [
    { label: "Software Engineer", value: "software_engineer" },
    { label: "Frontend Engineer", value: "frontend_engineer" },
    { label: "Backend Engineer", value: "backend_engineer" },
    { label: "Full-stack Engineer", value: "full_stack_engineer" },
    { label: "Mobile Engineer", value: "mobile_engineer" },
    { label: "Product Designer", value: "product_designer" },
    { label: "UI/UX Designer", value: "ui_ux_designer" },
    { label: "Product Manager", value: "product_manager" },
    { label: "Data Scientist", value: "data_scientist" },
    { label: "DevOps Engineer", value: "devops_engineer" },
];

const experienceFieldOptions = [
    { label: "Fintech", value: "fintech" },
    { label: "E-commerce", value: "ecommerce" },
    { label: "Healthcare", value: "healthcare" },
    { label: "Education", value: "education" },
    { label: "SaaS", value: "saas" },
    { label: "AI / ML", value: "ai_ml" },
    { label: "Logistics", value: "logistics" },
    { label: "Cybersecurity", value: "cybersecurity" },
    { label: "Gaming", value: "gaming" },
    { label: "Media", value: "media" },
];

const experienceTypeOptions = [
    { label: "Remote", value: "remote" },
    { label: "Hybrid", value: "hybrid" },
    { label: "On-site", value: "on_site" },
    { label: "Full-time", value: "full_time" },
    { label: "Part-time", value: "part_time" },
    { label: "Contract", value: "contract" },
    { label: "Internship", value: "internship" },
    { label: "Freelance", value: "freelance" },
    { label: "Temporary", value: "temporary" },
    { label: "Volunteer", value: "volunteer" },
];

const profileExperienceSchema = z.object({
    experiences: z.array(experienceItemSchema).min(1, "Add at least one experience."),
});

type ProfileExperienceFormValues = z.infer<typeof profileExperienceSchema>;

const CandidateProfileExperienceSettingsPage = () => {
    const { getExperiences, replaceExperiences, savingExperiences, loadingExperiences } =
        useProfileSectionsStore();
    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isValid },
        control,
        setValue,
        clearErrors,
        reset,
    } = useForm<ProfileExperienceFormValues>({
        defaultValues: {
            experiences: [
                {
                    company_name: "",
                    role: "",
                    field: "",
                    type: "",
                    from: "",
                    to: "",
                    description: "",
                    current: false,
                },
            ],
        },
        mode: "onChange",
        resolver: zodResolver(profileExperienceSchema),
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "experiences",
    });

    const watchedExperiences = useWatch({ control, name: "experiences" });
    const firstExperience = watchedExperiences?.[0];
    const isFirstExperienceValid = experienceItemSchema.safeParse(firstExperience).success;

    useEffect(() => {
        watchedExperiences?.forEach((experience, index) => {
            if (experience?.current && experience?.to) {
                setValue(`experiences.${index}.to`, "", {
                    shouldValidate: true,
                    shouldDirty: true,
                });
                clearErrors(`experiences.${index}.to`);
            }
        });
    }, [clearErrors, setValue, watchedExperiences]);

    useEffect(() => {
        const load = async () => {
            const experiences = await getExperiences();
            if (!experiences.length) {
                reset({
                    experiences: [
                        {
                            company_name: "",
                            role: "",
                            field: "",
                            type: "",
                            from: "",
                            to: "",
                            description: "",
                            current: false,
                        },
                    ],
                });
                return;
            }
            reset({
                experiences: experiences.map((item) => ({
                    company_name: item.company_name ?? "",
                    role: item.role ?? "",
                    field: item.field ?? "",
                    type: item.type ?? "",
                    from: item.from ? new Date(item.from).toISOString().slice(0, 10) : "",
                    to: item.to ? new Date(item.to).toISOString().slice(0, 10) : "",
                    description: item.description ?? "",
                    current: item.current ?? false,
                })),
            });
        };
        void load();
    }, [getExperiences, reset]);

    const onSubmit = async (values: ProfileExperienceFormValues) => {
        const payload = values.experiences.map((item) => ({
            company_name: item.company_name.trim(),
            role: item.role.trim(),
            field: item.field.trim(),
            type: item.type.trim(),
            from: item.from || undefined,
            to: item.current ? undefined : item.to || undefined,
            description: item.description?.trim() || undefined,
            current: item.current ?? false,
        }));
        const ok = await replaceExperiences(payload);
        if (ok) {
            reset(values);
        }
    };

    return (
        <div className="rounded-md border border-blue-200 bg-white p-6 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Experience
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Add your most relevant roles and responsibilities.
                    </p>
                </div>
                <div className="hidden items-center gap-2 lg:flex">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            append({
                                company_name: "",
                                role: "",
                                field: "",
                                type: "",
                                from: "",
                                to: "",
                                description: "",
                                current: false,
                            })
                        }
                        disabled={!isFirstExperienceValid}
                    >
                        Add experience
                    </Button>
                    <PrimaryActionButton
                        type="submit"
                        form="profile-experience-form"
                        disabled={!isDirty || !isValid || savingExperiences}
                    >
                        {savingExperiences ? "Saving..." : "Save"}
                    </PrimaryActionButton>
                </div>
            </div>

            {loadingExperiences ? (
                <div className="mt-6 space-y-4">
                    <div className="h-6 w-40 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="h-10 w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                        <div className="h-10 w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                        <div className="h-10 w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                        <div className="h-10 w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                    </div>
                    <div className="h-24 w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800" />
                </div>
            ) : (
                <form
                    id="profile-experience-form"
                    className="mt-6 space-y-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {errors.experiences?.message && (
                        <p className="text-sm text-red-500">{errors.experiences.message}</p>
                    )}
                    {fields.map((field, index) => {
                        const fromValue = watchedExperiences?.[index]?.from ?? "";
                        const isCurrent = watchedExperiences?.[index]?.current ?? false;
                        return (
                            <div
                                key={field.id}
                                className="rounded-md border border-blue-100 bg-blue-50/30 p-4 dark:border-slate-800 dark:bg-slate-900/40"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        Experience {index + 1}
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
                                            Company name <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            placeholder="Company name"
                                            {...register(`experiences.${index}.company_name`)}
                                        />
                                        {errors.experiences?.[index]?.company_name && (
                                            <p className="text-xs text-red-500">
                                                {errors.experiences[index]?.company_name?.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                            Role <span className="text-red-500">*</span>
                                        </label>
                                        <Controller
                                            control={control}
                                            name={`experiences.${index}.role`}
                                            render={({ field }) => (
                                                <SelectInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    options={experienceRoleOptions}
                                                    placeholder="Select or type a role..."
                                                    allowCustom
                                                />
                                            )}
                                        />
                                        {errors.experiences?.[index]?.role && (
                                            <p className="text-xs text-red-500">
                                                {errors.experiences[index]?.role?.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                            Field <span className="text-red-500">*</span>
                                        </label>
                                        <Controller
                                            control={control}
                                            name={`experiences.${index}.field`}
                                            render={({ field }) => (
                                                <SelectInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    options={experienceFieldOptions}
                                                    placeholder="Select or type a field..."
                                                    allowCustom
                                                />
                                            )}
                                        />
                                        {errors.experiences?.[index]?.field && (
                                            <p className="text-xs text-red-500">
                                                {errors.experiences[index]?.field?.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                            Type <span className="text-red-500">*</span>
                                        </label>
                                        <Controller
                                            control={control}
                                            name={`experiences.${index}.type`}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select a type..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {experienceTypeOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.experiences?.[index]?.type && (
                                            <p className="text-xs text-red-500">
                                                {errors.experiences[index]?.type?.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                            From
                                        </label>
                                        <Input type="date" {...register(`experiences.${index}.from`)} />
                                        {errors.experiences?.[index]?.from && (
                                            <p className="text-xs text-red-500">
                                                {errors.experiences[index]?.from?.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                            To
                                        </label>
                                        <Input
                                            type="date"
                                            min={fromValue || undefined}
                                            disabled={isCurrent}
                                            {...register(`experiences.${index}.to`)}
                                        />
                                        {errors.experiences?.[index]?.to && (
                                            <p className="text-xs text-red-500">
                                                {errors.experiences[index]?.to?.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                            Description
                                        </label>
                                        <Textarea
                                            placeholder="Describe your responsibilities and impact."
                                            {...register(`experiences.${index}.description`)}
                                        />
                                        {errors.experiences?.[index]?.description && (
                                            <p className="text-xs text-red-500">
                                                {errors.experiences[index]?.description?.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label
                                            htmlFor={`current-role-${field.id}`}
                                            className="flex cursor-pointer items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
                                        >
                                            <input
                                                id={`current-role-${field.id}`}
                                                type="checkbox"
                                                className="peer sr-only"
                                                {...register(`experiences.${index}.current`)}
                                            />
                                            <span
                                                className="flex h-5 w-5 items-center justify-center rounded border border-blue-400/60 bg-white text-white transition-all
                                        peer-checked:border-blue-400/60 peer-checked:bg-linear-to-r peer-checked:from-[#009ad5] peer-checked:to-[#005ca9]
                                        peer-focus-visible:ring-2 peer-focus-visible:ring-blue-300 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white
                                        dark:bg-slate-900 dark:peer-focus-visible:ring-offset-slate-950"
                                            >
                                                <svg
                                                    viewBox="0 0 20 20"
                                                    className="h-3 w-3"
                                                    aria-hidden="true"
                                                    fill="currentColor"
                                                >
                                                    <path d="M16.704 5.29a1 1 0 0 1 .006 1.415l-7.25 7.3a1 1 0 0 1-1.414.003l-3.76-3.75a1 1 0 1 1 1.414-1.414l3.053 3.046 6.543-6.58a1 1 0 0 1 1.408-.02z" />
                                                </svg>
                                            </span>
                                            <span>I currently work here</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div className="flex items-center justify-end gap-2 lg:hidden">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                append({
                                    company_name: "",
                                    role: "",
                                    field: "",
                                    type: "",
                                    from: "",
                                    to: "",
                                    description: "",
                                    current: false,
                                })
                            }
                            disabled={!isFirstExperienceValid}
                        >
                            Add experience
                        </Button>
                        <PrimaryActionButton
                            type="submit"
                            form="profile-experience-form"
                            disabled={!isDirty || !isValid || savingExperiences}
                        >
                            {savingExperiences ? "Saving..." : "Save"}
                        </PrimaryActionButton>
                    </div>
                </form>
            )}
        </div>
    );
};

export default CandidateProfileExperienceSettingsPage;

