"use client";

import Cookies from "js-cookie";
import { create } from "zustand";
import { apiClient } from "@/lib/apiClient";
import { ACCESS_TOKEN_KEY } from "@/lib/authTokens";

export type ProfileExperience = {
    company_name: string;
    from?: string | null;
    to?: string | null;
    current: boolean;
    role: string;
    description?: string | null;
    field: string;
    type: string;
};

export type ProfileProject = {
    name: string;
    description?: string | null;
    role: string;
};

export type ProfileSocialLink = {
    key: string;
    value: string;
};

export type CandidateProfile = {
    id: number;
    avatar?: string | null;
    headline?: string | null;
    summary?: string | null;
    location?: string | null;
    experiences: ProfileExperience[];
    projects: ProfileProject[];
    social_links: ProfileSocialLink[];
};

type UpdateProfileBasicPayload = {
    headline?: string;
    summary?: string;
    location?: string;
};

interface ProfileState {
    profile: CandidateProfile | null;
    loadingProfile: boolean;
    savingBasic: boolean;
    savingExperiences: boolean;
    savingProjects: boolean;
    savingSocialLinks: boolean;
    savingAvatar: boolean;
    getProfile: (accessToken?: string | null) => Promise<CandidateProfile | null>;
    updateBasic: (payload: UpdateProfileBasicPayload) => Promise<boolean>;
    replaceExperiences: (experiences: ProfileExperience[]) => Promise<boolean>;
    replaceProjects: (projects: ProfileProject[]) => Promise<boolean>;
    replaceSocialLinks: (links: ProfileSocialLink[]) => Promise<boolean>;
    uploadAvatar: (file: File) => Promise<boolean>;
}

const getToken = (accessToken?: string | null) => {
    if (accessToken) return accessToken;
    return Cookies.get(ACCESS_TOKEN_KEY) ?? null;
};

export const useProfileStore = create<ProfileState>((set) => ({
    profile: null,
    loadingProfile: false,
    savingBasic: false,
    savingExperiences: false,
    savingProjects: false,
    savingSocialLinks: false,
    savingAvatar: false,
    getProfile: async (accessToken) => {
        const token = getToken(accessToken);
        if (!token) return null;
        set({ loadingProfile: true });
        try {
            const response = await apiClient.get("/profile/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = response.data?.data ?? response.data;
            set({ profile: data });
            return data as CandidateProfile;
        } catch {
            set({ profile: null });
            return null;
        } finally {
            set({ loadingProfile: false });
        }
    },
    updateBasic: async (payload) => {
        set({ savingBasic: true });
        try {
            const response = await apiClient.put("/profile/basic", payload);
            const data = response.data?.data ?? response.data;
            set((state) => ({
                profile: state.profile ? { ...state.profile, ...data } : data,
            }));
            return true;
        } catch {
            return false;
        } finally {
            set({ savingBasic: false });
        }
    },
    replaceExperiences: async (experiences) => {
        set({ savingExperiences: true });
        try {
            const response = await apiClient.put("/profile/experiences", { experiences });
            const data = response.data?.data ?? response.data;
            set((state) => ({
                profile: state.profile
                    ? { ...state.profile, experiences: data }
                    : { ...(state.profile ?? {}), experiences: data },
            }));
            return true;
        } catch {
            return false;
        } finally {
            set({ savingExperiences: false });
        }
    },
    replaceProjects: async (projects) => {
        set({ savingProjects: true });
        try {
            const response = await apiClient.put("/profile/projects", { projects });
            const data = response.data?.data ?? response.data;
            set((state) => ({
                profile: state.profile
                    ? { ...state.profile, projects: data }
                    : { ...(state.profile ?? {}), projects: data },
            }));
            return true;
        } catch {
            return false;
        } finally {
            set({ savingProjects: false });
        }
    },
    replaceSocialLinks: async (links) => {
        set({ savingSocialLinks: true });
        try {
            const response = await apiClient.put("/profile/social-links", { social_links: links });
            const data = response.data?.data ?? response.data;
            set((state) => ({
                profile: state.profile
                    ? { ...state.profile, social_links: data }
                    : { ...(state.profile ?? {}), social_links: data },
            }));
            return true;
        } catch {
            return false;
        } finally {
            set({ savingSocialLinks: false });
        }
    },
    uploadAvatar: async (file) => {
        set({ savingAvatar: true });
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await apiClient.post("/profile/avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const data = response.data?.data ?? response.data;
            set((state) => ({
                profile: state.profile ? { ...state.profile, ...data } : data,
            }));
            return true;
        } catch {
            return false;
        } finally {
            set({ savingAvatar: false });
        }
    },
}));

