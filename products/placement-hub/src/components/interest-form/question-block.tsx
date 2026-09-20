import { AlertCircle, AlertTriangle } from "@untitledui/icons";
import type { ReactNode } from "react";

interface QuestionBlockProps {
    id: string;
    number: number;
    label: string;
    /** Guidance shown under the control (never under the label, so it's read after the answer is in view). */
    hint?: string;
    warning?: string;
    error?: string;
    children: ReactNode;
}

// The number + question + control + hint/error stack every question shares. The error takes the
// hint's place instead of stacking under it, so a field never grows two lines of small print.
export const QuestionBlock = ({ id, number, label, hint, warning, error, children }: QuestionBlockProps) => {
    return (
        <div id={`q-${id}`} className="scroll-mt-44">
            <div className="flex items-start gap-1">
                <span aria-hidden className="w-7 shrink-0 text-base leading-6 text-gray-500 tabular-nums">
                    {number}.
                </span>
                <p id={`q-${id}-label`} className="text-base leading-6 font-medium text-gray-900">
                    {label}
                </p>
            </div>

            <div className="mt-3">
                {children}

                {error ? (
                    <p role="alert" className="mt-2 flex items-start gap-1.5 text-sm font-medium text-error-600">
                        <AlertCircle className="mt-px size-4 shrink-0" />
                        {error}
                    </p>
                ) : (
                    hint && <p className="mt-2 text-sm text-gray-500">{hint}</p>
                )}

                {warning && !error && (
                    <p className="mt-2 flex items-start gap-1.5 text-sm font-medium text-warning-600">
                        <AlertTriangle className="mt-px size-4 shrink-0" />
                        {warning}
                    </p>
                )}
            </div>
        </div>
    );
};
