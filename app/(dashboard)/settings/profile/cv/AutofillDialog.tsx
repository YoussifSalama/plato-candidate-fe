import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ParsedCVProfile } from "@/shared/store/pages/profile/useProfileStore";
import { Check, Info } from "lucide-react";

interface AutofillDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    parsedData: ParsedCVProfile | null;
}

const AutofillDialog = ({
    open,
    onOpenChange,
    onConfirm,
    parsedData,
}: AutofillDialogProps) => {
    if (!parsedData) return null;

    const experienceCount = parsedData.experience?.length ?? 0;
    const projectCount = parsedData.projects?.length ?? 0;
    const skillsCount = parsedData.skills?.length ?? 0;
    const educationCount = parsedData.education?.length ?? 0;

    // Check if basic info is present
    const hasBasicInfo = !!(
        parsedData.headline ||
        parsedData.summary ||
        (parsedData.location?.city || parsedData.location?.country)
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        Autofill Profile?
                    </DialogTitle>
                    <DialogDescription>
                        We successfully parsed your CV. Would you like to autofill your profile with the following data?
                    </DialogDescription>
                </DialogHeader>

                <div className="my-4 space-y-3 rounded-md bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Basic Information {hasBasicInfo ? "(Found)" : "(Not found)"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{experienceCount} Experience(s) found</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{projectCount} Project(s) found</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{educationCount} Education entry(s) found</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{skillsCount} Skill(s) found</span>
                    </div>
                </div>

                <p className="text-xs text-slate-500">
                    * Existing data might be overwritten. You can review and edit everything after.
                </p>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        No, thanks
                    </Button>
                    <Button onClick={onConfirm}>Yes, Autofill</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AutofillDialog;
