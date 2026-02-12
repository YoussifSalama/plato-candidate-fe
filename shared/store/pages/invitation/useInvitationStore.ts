import axios from "axios";
import Cookies from "js-cookie";
import { create } from "zustand";
import type {
    InvitationAccountStatus,
    InvitationStatus,
    ValidationResponse,
    ValidationResult,
} from "@/shared/types/pages/invitation";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/lib/authTokens";

type InvitationState = {
    status: InvitationStatus;
    message: string;
    token?: string;
    accountStatus: InvitationAccountStatus;
    accountMessage: string;
    accountEmail?: string | null;
    createAccount: (token?: string) => Promise<boolean>;
    completeAccount: (token: string, password: string) => Promise<boolean>;
    validateToken: (token?: string) => Promise<ValidationResult>;
    reset: () => void;
};

const resolveApiBaseUrl = () => {
    return (process.env.NEXT_PUBLIC_CANDIDATE_API_URL ?? "").replace(/\/+$/, "");
};

const DEFAULT_MESSAGE = "Please check the invitation link and try again.";

const useInvitationStore = create<InvitationState>((set) => ({
    status: "idle",
    message: "",
    token: undefined,
    accountStatus: "idle",
    accountMessage: "",
    accountEmail: null,
    reset: () =>
        set({
            status: "idle",
            message: "",
            token: undefined,
            accountStatus: "idle",
            accountMessage: "",
            accountEmail: null,
        }),
    createAccount: async (token) => {
        if (!token) {
            set({
                accountStatus: "error",
                accountMessage: "Invitation token is missing.",
            });
            return false;
        }
        const baseUrl = resolveApiBaseUrl();
        if (!baseUrl) {
            set({
                accountStatus: "error",
                accountMessage: "API base URL is not configured.",
            });
            return false;
        }
        set({ accountStatus: "creating", accountMessage: "Creating account..." });
        try {
            const response = await axios.post<{
                data?: { email?: string | null; created?: boolean };
                message?: string;
            }>(`${baseUrl}/candidate/invitation/create`, { token });
            const created = response.data?.data?.created;
            set({
                accountStatus: "created",
                accountMessage:
                    created === false
                        ? response.data?.message ?? "Account already exists. Set your password to continue."
                        : response.data?.message ?? "Account created.",
                accountEmail: response.data?.data?.email ?? null,
            });
            return true;
        } catch (error) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            set({
                accountStatus: "error",
                accountMessage:
                    axiosError.response?.data?.message ??
                    (error instanceof Error ? error.message : DEFAULT_MESSAGE),
            });
            return false;
        }
    },
    completeAccount: async (token, password) => {
        const baseUrl = resolveApiBaseUrl();
        if (!baseUrl) {
            set({
                accountStatus: "error",
                accountMessage: "API base URL is not configured.",
            });
            return false;
        }
        set({ accountStatus: "setting", accountMessage: "Setting password..." });
        try {
            const response = await axios.post<{
                data?: {
                    access_token?: string;
                    refresh_token?: string;
                };
                message?: string;
            }>(`${baseUrl}/candidate/invitation/complete`, { token, password });
            if (typeof window !== "undefined") {
                if (response.data?.data?.access_token) {
                    localStorage.setItem("access_token", response.data.data.access_token);
                    Cookies.set(ACCESS_TOKEN_KEY, response.data.data.access_token);
                }
                if (response.data?.data?.refresh_token) {
                    localStorage.setItem("refresh_token", response.data.data.refresh_token);
                    Cookies.set(REFRESH_TOKEN_KEY, response.data.data.refresh_token, {
                        expires: 7,
                    });
                }
            }
            set({
                accountStatus: "completed",
                accountMessage: response.data?.message ?? "Account ready.",
            });
            return true;
        } catch (error) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            set({
                accountStatus: "error",
                accountMessage:
                    axiosError.response?.data?.message ??
                    (error instanceof Error ? error.message : DEFAULT_MESSAGE),
            });
            return false;
        }
    },
    validateToken: async (token) => {
        if (!token) {
            const result = {
                ok: false,
                status: "missing" as const,
                message: "No invitation token provided.",
            };
            set({ status: result.status, message: result.message, token });
            return result;
        }
        const baseUrl = resolveApiBaseUrl();
        if (!baseUrl) {
            const result = {
                ok: false,
                status: "error" as const,
                message: "API base URL is not configured.",
            };
            set({ status: result.status, message: result.message, token });
            return result;
        }
        set({ status: "loading", message: "Checking invitation...", token });
        try {
            const response = await axios.get<ValidationResponse>(
                `${baseUrl}/invitation/validate`,
                {
                    params: { token },
                    headers: { "Cache-Control": "no-store" },
                },
            );
            const result = {
                ok: true,
                status: "valid" as const,
                message: response.data?.message ?? "Invitation token is valid.",
            };
            set({ status: result.status, message: result.message, token });
            return result;
        } catch (error) {
            const axiosError = error as { response?: { data?: ValidationResponse } };
            const message = axiosError.response?.data?.message;
            const isResponseError = Boolean(axiosError.response);
            const result: ValidationResult = {
                ok: false,
                status: isResponseError ? "invalid" : "error",
                message:
                    message ??
                    (isResponseError
                        ? "This invitation link is invalid or has expired."
                        : error instanceof Error
                            ? error.message
                            : DEFAULT_MESSAGE),
            };
            set({ status: result.status, message: result.message, token });
            return result;
        }
    },
}));

export default useInvitationStore;

