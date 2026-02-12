"use client";

import Cookies from "js-cookie";
import { create } from "zustand";
import { apiClient } from "@/lib/apiClient";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/lib/authTokens";

type CandidateAccount = {
    id: number;
    email: string | null;
    phone: string | null;
    candidate_name: string | null;
    f_name: string;
    l_name: string;
    name: string;
    verified: boolean;
    invited: boolean;
};

interface CandidateAuthState {
    loadingSignup: boolean;
    loadingLogin: boolean;
    loadingResetRequest: boolean;
    loadingResetVerify: boolean;
    loadingResetConfirm: boolean;
    loadingAccount: boolean;
    loadingChangePassword: boolean;
    candidateAccount: CandidateAccount | null;
    signup: (payload: { f_name: string; l_name: string; email: string; password: string }) => Promise<boolean>;
    login: (email: string, password: string) => Promise<{ access_token: string; refresh_token?: string } | null>;
    storeTokens: (accessToken?: string | null, refreshToken?: string | null) => void;
    getCandidateAccount: (accessToken?: string | null) => Promise<CandidateAccount | null>;
    changePassword: (
        payload: { oldPassword: string; newPassword: string },
        accessToken?: string | null
    ) => Promise<{ ok: boolean; message: string }>;
    requestPasswordReset: (email: string) => Promise<boolean>;
    verifyPasswordResetOtp: (email: string, otp: string) => Promise<boolean>;
    resetPassword: (email: string, otp: string, newPassword: string) => Promise<boolean>;
    verifyAccountToken: (token: string) => Promise<boolean>;
    resendVerificationToken: (token: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const useAuthStore = create<CandidateAuthState>((set) => ({
    loadingSignup: false,
    loadingLogin: false,
    loadingResetRequest: false,
    loadingResetVerify: false,
    loadingResetConfirm: false,
    loadingAccount: false,
    loadingChangePassword: false,
    candidateAccount: null,
    storeTokens: (accessToken, refreshToken) => {
        if (accessToken) {
            Cookies.set(ACCESS_TOKEN_KEY, accessToken);
            localStorage.setItem("access_token", accessToken);
        }
        if (refreshToken) {
            Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7 });
            localStorage.setItem("refresh_token", refreshToken);
        }
    },
    signup: async (payload) => {
        set({ loadingSignup: true });
        try {
            const response = await apiClient.post("/candidate/signup", payload);
            return response.status === 201;
        } catch {
            return false;
        } finally {
            set({ loadingSignup: false });
        }
    },
    login: async (email, password) => {
        set({ loadingLogin: true });
        try {
            const response = await apiClient.post("/candidate/login", { email, password });
            const accessToken = response.data?.data?.access_token ?? response.data?.access_token;
            const refreshToken = response.data?.data?.refresh_token ?? response.data?.refresh_token;
            if (!accessToken) return null;
            return { access_token: accessToken, refresh_token: refreshToken };
        } catch {
            return null;
        } finally {
            set({ loadingLogin: false });
        }
    },
    getCandidateAccount: async (accessToken) => {
        const token = accessToken ?? Cookies.get(ACCESS_TOKEN_KEY) ?? null;
        if (!token) return null;
        set({ loadingAccount: true });
        try {
            const response = await apiClient.get("/candidate/account/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = response.data?.data ?? response.data;
            set({ candidateAccount: data });
            return data as CandidateAccount;
        } catch {
            set({ candidateAccount: null });
            return null;
        } finally {
            set({ loadingAccount: false });
        }
    },
    changePassword: async (payload, accessToken) => {
        const token = accessToken ?? Cookies.get(ACCESS_TOKEN_KEY) ?? null;
        if (!token) {
            return { ok: false, message: "Missing access token." };
        }
        set({ loadingChangePassword: true });
        try {
            const response = await apiClient.patch("/candidate/password", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const message =
                response.data?.message ?? response.data?.data?.message ?? "Password updated successfully.";
            return { ok: true, message };
        } catch (error: any) {
            const message =
                error?.response?.data?.message ??
                error?.response?.data?.data?.message ??
                "Unable to update password.";
            return { ok: false, message };
        } finally {
            set({ loadingChangePassword: false });
        }
    },
    requestPasswordReset: async (email) => {
        set({ loadingResetRequest: true });
        try {
            await apiClient.post("/candidate/password/reset/request", { email });
            return true;
        } catch {
            return false;
        } finally {
            set({ loadingResetRequest: false });
        }
    },
    verifyPasswordResetOtp: async (email, otp) => {
        set({ loadingResetVerify: true });
        try {
            const response = await apiClient.post("/candidate/password/reset/verify", { email, otp });
            const valid = response.data?.data?.valid ?? response.data?.valid;
            return Boolean(valid);
        } catch {
            return false;
        } finally {
            set({ loadingResetVerify: false });
        }
    },
    resetPassword: async (email, otp, newPassword) => {
        set({ loadingResetConfirm: true });
        try {
            await apiClient.post("/candidate/password/reset/confirm", { email, otp, newPassword });
            return true;
        } catch {
            return false;
        } finally {
            set({ loadingResetConfirm: false });
        }
    },
    verifyAccountToken: async (token) => {
        try {
            const response = await apiClient.post("/candidate/verify-account/confirm", { token });
            const valid = response.data?.data?.valid ?? response.data?.valid;
            return Boolean(valid);
        } catch {
            return false;
        }
    },
    resendVerificationToken: async (token) => {
        try {
            await apiClient.post("/candidate/resend-verification", { token });
            return true;
        } catch {
            return false;
        }
    },
    logout: async () => {
        try {
            const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
            if (refreshToken) {
                await apiClient.post("/candidate/logout", { refresh_token: refreshToken });
            }
        } catch {
            // ignore
        } finally {
            Cookies.remove(ACCESS_TOKEN_KEY);
            Cookies.remove(REFRESH_TOKEN_KEY);
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            set({ candidateAccount: null });
            window.location.href = "/auth/login";
        }
    },
}));

export default useAuthStore;

