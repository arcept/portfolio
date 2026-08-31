import { useEffect, useState } from "react";
import { CheckCircle } from "@untitledui/icons";
import { cx } from "@/utils/cx";

type ToastItem = { id: number; message: string };

let nextId = 1;
let notify: ((message: string) => void) | null = null;

/** A minimal toast — the scaffold ships no notification component and this app only needs it
 * at three call sites (the Deals list row actions) plus the wizard's confirmations, so a small
 * pub/sub + auto-dismiss stack is simpler than pulling in a dependency. Mount `<ToastHost />`
 * once near the app root; call `toast("message")` from anywhere after that. */
export function toast(message: string) {
    notify?.(message);
}

export const ToastHost = () => {
    const [items, setItems] = useState<ToastItem[]>([]);

    useEffect(() => {
        notify = (message: string) => {
            const id = nextId++;
            setItems((prev) => [...prev, { id, message }]);
            setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 2600);
        };
        return () => {
            notify = null;
        };
    }, []);

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-100 flex flex-col items-center gap-2">
            {items.map((item) => (
                <div
                    key={item.id}
                    className={cx(
                        "pointer-events-auto flex items-center gap-2 rounded-lg bg-primary-solid px-4 py-2.5 text-sm font-medium text-white shadow-lg",
                        "animate-in fade-in slide-in-from-bottom-1 duration-200",
                    )}
                >
                    <CheckCircle className="size-4 text-fg-success-secondary" />
                    {item.message}
                </div>
            ))}
        </div>
    );
};
