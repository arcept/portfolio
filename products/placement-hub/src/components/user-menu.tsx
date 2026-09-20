import { ChevronDown, LogOut01, Settings01, ShoppingBag03, User03 } from "@untitledui/icons";
import { useEffect, useRef, useState } from "react";
import avatarManik from "@/assets/avatar-manik.png";
import { cx } from "@/utils/cx";

interface UserMenuProps {
    onNavigateProfile: () => void;
}

// The "Manik Madaan" button in TopBar — opens the account menu dropdown (Profile / My Orders /
// Settings / Log out). Only Profile is wired up; the rest aren't in scope yet, so they just close
// the menu instead of doing nothing silently.
export const UserMenu = ({ onNavigateProfile }: UserMenuProps) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <div ref={containerRef} className="relative">
            <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 rounded-lg px-2 py-0 hover:bg-gray-50 max-md:gap-1 max-md:px-0">
                <span className="size-8 overflow-hidden rounded-2xl border-2 border-gray-cool-200">
                    <img src={avatarManik} alt="" className="size-full object-cover" />
                </span>
                <span className="flex flex-col items-start text-gray-cool-900 max-md:hidden">
                    <span className="text-base font-semibold">Manik Madaan</span>
                    <span className="text-xs">BA.C5.56471</span>
                </span>
                <ChevronDown className={cx("size-4 text-gray-cool-900 transition-transform duration-150", open && "rotate-180")} />
            </button>

            {open && (
                <div className="absolute top-[calc(100%+8px)] right-0 z-20 flex w-[240px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[var(--shadow-card-lg)]">
                    <div className="border-b border-gray-cool-200 px-4 pt-3 pb-2">
                        <p className="text-sm font-semibold text-gray-600">Account menu</p>
                    </div>

                    <div className="flex flex-col items-start p-1">
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                onNavigateProfile();
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                            <User03 className="size-4" />
                            Profile
                        </button>
                        <button type="button" onClick={() => setOpen(false)} className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-gray-600 hover:bg-gray-50">
                            <ShoppingBag03 className="size-4" />
                            My Orders
                        </button>
                        <button type="button" onClick={() => setOpen(false)} className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <Settings01 className="size-4" />
                            Settings
                        </button>
                    </div>

                    <div className="border-t border-gray-cool-200 p-1">
                        <button type="button" onClick={() => setOpen(false)} className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-error-600 hover:bg-error-25">
                            <LogOut01 className="size-4" />
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
