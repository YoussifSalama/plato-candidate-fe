export type InvitationPageProps = {
    searchParams: {
        token?: string;
    };
};

export type ValidationResponse = {
    message?: string;
    statusCode?: number;
};

export type InvitationStatus =
    | "idle"
    | "loading"
    | "valid"
    | "invalid"
    | "error"
    | "missing";

export type InvitationAccountStatus =
    | "idle"
    | "creating"
    | "created"
    | "error"
    | "setting"
    | "completed";

export type ValidationResult = {
    ok: boolean;
    status: InvitationStatus;
    message: string;
};

