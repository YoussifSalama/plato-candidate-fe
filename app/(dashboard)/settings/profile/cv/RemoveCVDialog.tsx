import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";

interface RemoveCVDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (autoClear: boolean) => void;
    isRemoving: boolean;
}

const RemoveCVDialog = ({
    open,
    onOpenChange,
    onConfirm,
    isRemoving,
}: RemoveCVDialogProps) => {
    const [autoClear, setAutoClear] = useState(false);

    const handleConfirm = () => {
        onConfirm(autoClear);
        setAutoClear(false); // Reset for next time
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Remove CV?
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove your uploaded CV? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="my-4 space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={autoClear}
                            onChange={(e) => setAutoClear(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                Also clear my profile data
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                This will remove your headline, summary, location, experiences, and projects.
                            </p>
                        </div>
                    </label>
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isRemoving}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isRemoving}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <Trash2 className="h-4 w-4" />
                        {isRemoving ? "Removing..." : "Remove CV"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RemoveCVDialog;
