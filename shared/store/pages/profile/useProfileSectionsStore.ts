"use client";

import Cookies from "js-cookie";
import { create } from "zustand";
import axios from "axios";
import { apiClient } from "@/lib/apiClient";
import { ACCESS_TOKEN_KEY } from "@/lib/authTokens";
import { toast } from "sonner";
import type {
    CandidateProfile,
    ProfileExperience,
    ProfileProject,
    ProfileSocialLink,
} from "./useProfileStore";

type ProfileBasic = {
    headline: string;
    summary: string;
    location: string;
};

type ProfileSectionsState = {
    basic: ProfileBasic | null;
    experiences: ProfileExperience[];
    projects: ProfileProject[];
    socialLinks: ProfileSocialLink[];
    avatar: string | null;
    loadingBasic: boolean;
    loadingExperiences: boolean;
    loadingProjects: boolean;
    loadingSocialLinks: boolean;
    loadingAvatar: boolean;
    savingBasic: boolean;
    savingExperiences: boolean;
    savingProjects: boolean;
    savingSocialLinks: boolean;
    savingAvatar: boolean;
    getBasicProfile: (accessToken?: string | null) => Promise<ProfileBasic | null>;
    getExperiences: (accessToken?: string | null) => Promise<ProfileExperience[]>;
    getProjects: (accessToken?: string | null) => Promise<ProfileProject[]>;
    getSocialLinks: (accessToken?: string | null) => Promise<ProfileSocialLink[]>;
    getAvatar: (accessToken?: string | null) => Promise<string | null>;
    updateBasic: (payload: Partial<ProfileBasic>) => Promise<boolean>;
    replaceExperiences: (experiences: ProfileExperience[]) => Promise<boolean>;
    replaceProjects: (projects: ProfileProject[]) => Promise<boolean>;
    replaceSocialLinks: (links: ProfileSocialLink[]) => Promise<boolean>;
    uploadAvatar: (file: File) => Promise<boolean>;
};

const getToken = (accessToken?: string | null) => {
    if (accessToken) return accessToken;
    return Cookies.get(ACCESS_TOKEN_KEY) ?? null;
};

const fetchProfile = async (accessToken?: string | null) => {
    const token = getToken(accessToken);
    if (!token) return null;
    const response = await apiClient.get("/profile/me", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return (response.data?.data ?? response.data) as CandidateProfile;
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        const message = (error.response?.data as { message?: string } | undefined)?.message;
        if (message) return message;
    }
    return fallback;
};

export const useProfileSectionsStore = create<ProfileSectionsState>((set) => ({
    basic: null,
    experiences: [],
    projects: [],
    socialLinks: [],
    avatar: null,
    loadingBasic: false,
    loadingExperiences: false,
    loadingProjects: false,
    loadingSocialLinks: false,
    loadingAvatar: false,
    savingBasic: false,
    savingExperiences: false,
    savingProjects: false,
    savingSocialLinks: false,
    savingAvatar: false,
    getBasicProfile: async (accessToken) => {
        set({ loadingBasic: true });
        try {
            const profile = await fetchProfile(accessToken);
            if (!profile) {
                set({ basic: null });
                return null;
            }
            const basic = {
                headline: profile.headline ?? "",
                summary: profile.summary ?? "",
                location: profile.location ?? "",
            };
            set({ basic });
            return basic;
        } catch {
            set({ basic: null });
            return null;
        } finally {
            set({ loadingBasic: false });
        }
    },
    getExperiences: async (accessToken) => {
        set({ loadingExperiences: true });
        try {
            const profile = await fetchProfile(accessToken);
            const experiences = profile?.experiences ?? [];
            set({ experiences });
            return experiences;
        } catch {
            set({ experiences: [] });
            return [];
        } finally {
            set({ loadingExperiences: false });
        }
    },
    getProjects: async (accessToken) => {
        set({ loadingProjects: true });
        try {
            const profile = await fetchProfile(accessToken);
            const projects = profile?.projects ?? [];
            set({ projects });
            return projects;
        } catch {
            set({ projects: [] });
            return [];
        } finally {
            set({ loadingProjects: false });
        }
    },
    getSocialLinks: async (accessToken) => {
        set({ loadingSocialLinks: true });
        try {
            const profile = await fetchProfile(accessToken);
            const socialLinks = profile?.social_links ?? [];
            set({ socialLinks });
            return socialLinks;
        } catch {
            set({ socialLinks: [] });
            return [];
        } finally {
            set({ loadingSocialLinks: false });
        }
    },
    getAvatar: async (accessToken) => {
        set({ loadingAvatar: true });
        try {
            const profile = await fetchProfile(accessToken);
            const avatar = profile?.avatar ?? null;
            set({ avatar });
            return avatar;
        } catch {
            set({ avatar: null });
            return null;
        } finally {
            set({ loadingAvatar: false });
        }
    },
    updateBasic: async (payload) => {
        set({ savingBasic: true });
        try {
            const response = await apiClient.put("/profile/basic", payload);
            const data = response.data?.data ?? response.data;
            const basic = {
                headline: data?.headline ?? "",
                summary: data?.summary ?? "",
                location: data?.location ?? "",
            };
            set({ basic });
            toast.success(response.data?.message ?? "Basic information saved.");
            return true;
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to save basic information."));
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
            set({ experiences: data ?? [] });
            toast.success(response.data?.message ?? "Experience saved.");
            return true;
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to save experience."));
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
            set({ projects: data ?? [] });
            toast.success(response.data?.message ?? "Projects saved.");
            return true;
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to save projects."));
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
            set({ socialLinks: data ?? [] });
            toast.success(response.data?.message ?? "Social links saved.");
            return true;
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to save social links."));
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
            const avatar = data?.avatar ?? null;
            set({ avatar });
            toast.success(response.data?.message ?? "Avatar updated.");
            return true;
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to upload avatar."));
            return false;
        } finally {
            set({ savingAvatar: false });
        }
    },
}));

