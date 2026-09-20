import type { ReactNode } from "react";

interface ProfileSectionCardProps {
    id: string;
    title: string;
    subtitle?: string;
    children: ReactNode;
}

// The bordered "gray-50 header + white body" card chrome shared by every profile tab section
// except "Personal" (About Me renders bare, matching the Figma handoff). `id` is the scroll-spy
// anchor ProfileTabs and the page's IntersectionObserver key off of.
export const ProfileSectionCard = ({ id, title, subtitle, children }: ProfileSectionCardProps) => {
    return (
        <div id={id} className="flex w-full scroll-mt-[190px] max-md:scroll-mt-20 flex-col items-start overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex h-[68px] w-full shrink-0 flex-col justify-center border-b border-gray-cool-200 bg-gray-50 px-8 py-5 max-md:px-4">
                <p className="text-xl font-semibold text-gray-900">{title}</p>
                {subtitle && <p className="text-base text-gray-900">{subtitle}</p>}
            </div>
            <div className="flex w-full flex-col items-start gap-0 px-8 py-5 max-md:px-4">{children}</div>
        </div>
    );
};
